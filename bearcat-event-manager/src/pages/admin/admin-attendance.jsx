import {useState, useEffect} from 'react';
import {getFirestore, collection, query, where, getDocs, orderBy, onSnapshot} from 'firebase/firestore';
import {Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement} from 'chart.js';
import {Pie, Bar} from 'react-chartjs-2';
import {CalendarIcon, UserGroupIcon, ClockIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {CheckCircleIcon} from '@heroicons/react/24/solid';
import Navbar from "../../components/navbar.jsx";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminAttendance = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalTickets: 0,
        checkedIn: 0,
        percentCheckedIn: 0,
        averageCheckInTime: '0:00'
    });

    const db = getFirestore();

    // Fetch all events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const eventsSnapshot = await getDocs(
                    query(collection(db, 'events'), orderBy('date', 'desc'))
                );

                const eventsData = eventsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date, // Convert Firestore timestamp to JS Date
                    title: doc.data().title
                }));

                setEvents(eventsData);

                // Auto-select the most recent event
                if (eventsData.length > 0 && !selectedEvent) {
                    setSelectedEvent(eventsData[0]);
                }

            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to load events. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [db]);

    // Replace the useEffect that fetches attendees with this:
    useEffect(() => {
        if (!selectedEvent) return;

        setIsLoading(true);

        // Create a query for tickets
        const ticketsQuery = query(
            collection(db, 'tickets'),
            where('eventId', '==', selectedEvent.id)
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(ticketsQuery, async (snapshot) => {
            try {
                const ticketsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    checkedInAt: doc.data().checkedInAt?.toDate()
                }));

                // Update attendees state
                setAttendees(ticketsData);
                // Initial setup of filtered attendees
                setFilteredAttendees(ticketsData);

                // Calculate statistics
                const totalTickets = ticketsData.length;
                const checkedInTickets = ticketsData.filter(ticket => ticket.checkedIn === true);
                const checkedInCount = checkedInTickets.length;
                const percentCheckedIn = totalTickets > 0 ? Math.round((checkedInCount / totalTickets) * 100) : 0;

                // Calculate average check-in time if available
                let avgCheckInTime = '—';
                if (checkedInTickets.length > 0) {
                    const eventDate = selectedEvent.date;
                    if (eventDate) {
                        // Calculate average minutes between event start time and check-in time
                        const totalMinutes = checkedInTickets.reduce((sum, ticket) => {
                            if (ticket.checkedInAt) {
                                const diffMs = ticket.checkedInAt - eventDate;
                                return sum + (diffMs / (1000 * 60)); // Convert ms to minutes
                            }
                            return sum;
                        }, 0);

                        const avgMinutes = Math.round(totalMinutes / checkedInTickets.length);
                        const hours = Math.floor(Math.abs(avgMinutes) / 60);
                        const minutes = Math.abs(avgMinutes) % 60;

                        // Format as HH:MM and add a negative sign if before event start
                        avgCheckInTime = `${avgMinutes < 0 ? '-' : ''}${hours}:${minutes.toString().padStart(2, '0')}`;
                    }
                }

                setStats({
                    totalTickets,
                    checkedIn: checkedInCount,
                    percentCheckedIn,
                    averageCheckInTime: avgCheckInTime
                });

                setIsLoading(false);
            } catch (err) {
                console.error('Error processing tickets data:', err);
                setError('Failed to load attendee data. Please try again.');
                setIsLoading(false);
            }
        }, error => {
            console.error('Firestore listener error:', error);
            setError('Error in real-time updates. Please refresh the page.');
            setIsLoading(false);
        });

        // Cleanup function to unsubscribe from the Firestore listener
        return () => unsubscribe();
    }, [selectedEvent, db]);

// Add useEffect for search functionality
    useEffect(() => {
        if (!attendees.length) return;

        if (!searchQuery.trim()) {
            // If search query is empty, show all attendees
            setFilteredAttendees(attendees);
            return;
        }

        // Filter attendees based on search query
        const query = searchQuery.toLowerCase().trim();
        const filtered = attendees.filter(attendee =>
            // Search in various fields - add or remove fields as needed
            attendee.name?.toLowerCase().includes(query) ||
            attendee.email?.toLowerCase().includes(query) ||
            attendee.ticketId?.toLowerCase().includes(query) ||
            attendee.phone?.toLowerCase().includes(query)
        );

        setFilteredAttendees(filtered);
    }, [searchQuery, attendees]);

    // Chart data for check-in status
    const pieChartData = {
        labels: ['Checked In', 'Not Checked In'],
        datasets: [
            {
                data: [stats.checkedIn, stats.totalTickets - stats.checkedIn],
                backgroundColor: ['#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
            },
        ],
    };

    // Time-based check-in data
    const getTimeBasedData = () => {
        if (!selectedEvent || !attendees.length) return null;

        // Group check-ins by hour
        const checkedInByHour = {};
        const eventDate = selectedEvent.date;

        if (!eventDate) return null;

        attendees.forEach(attendee => {
            if (attendee.checkedIn && attendee.checkedInAt) {
                // Calculate hour offset from event start
                const diffHours = Math.floor((attendee.checkedInAt - eventDate) / (1000 * 60 * 60));

                // Group check-ins into 1-hour buckets
                const bucket = diffHours;
                checkedInByHour[bucket] = (checkedInByHour[bucket] || 0) + 1;
            }
        });

        // Convert to sorted array and limit to relevant range
        const sortedHours = Object.keys(checkedInByHour)
            .map(Number)
            .sort((a, b) => a - b);

        if (!sortedHours.length) return null;

        // Get min/max hours with some padding
        const minHour = Math.min(...sortedHours) - 1;
        const maxHour = Math.max(...sortedHours) + 1;

        // Create labels for each hour
        const labels = [];
        const data = [];

        for (let hour = minHour; hour <= maxHour; hour++) {
            const label = hour === 0 ? 'Event Start' :
                hour < 0 ? `${Math.abs(hour)}h before` :
                    `${hour}h after`;
            labels.push(label);
            data.push(checkedInByHour[hour] || 0);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Check-ins',
                    data,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const timeChartData = getTimeBasedData();

    const handleEventChange = (e) => {
        const eventId = e.target.value;
        const selectedEvent = events.find(event => event.id === eventId);
        setSelectedEvent(selectedEvent);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Event Attendance</h1>

                {/* Event Selection */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <h2 className="card-title">Select Event</h2>

                        {isLoading && !events.length ? (
                            <div className="flex justify-center my-4">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : error && !events.length ? (
                            <div className="alert alert-error">{error}</div>
                        ) : (
                            <select
                                className="select select-bordered w-full max-w-xs"
                                onChange={handleEventChange}
                                value={selectedEvent?.id || ''}
                            >
                                <option disabled value="">Select an event</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>
                                        {event.title} - {event.date ? formatDate(event.date) : 'No date'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {selectedEvent && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="stat card bg-base-100 shadow-xl">
                                <div className="stat-figure text-primary">
                                    <UserGroupIcon className="w-8 h-8"/>
                                </div>
                                <div className="stat-title">Total Tickets</div>
                                <div className="stat-value text-primary">{stats.totalTickets}</div>
                            </div>

                            <div className="stat card bg-base-100 shadow-xl">
                                <div className="stat-figure text-secondary">
                                    <CheckCircleIcon className="w-8 h-8"/>
                                </div>
                                <div className="stat-title">Checked In</div>
                                <div className="stat-value text-secondary">{stats.checkedIn}</div>
                                <div className="stat-desc">{stats.percentCheckedIn}% of total</div>
                            </div>

                            <div className="stat card bg-base-100 shadow-xl">
                                <div className="stat-figure text-info">
                                    <ClockIcon className="w-8 h-8"/>
                                </div>
                                <div className="stat-title">Avg. Check-in Time</div>
                                <div className="stat-value text-info">{stats.averageCheckInTime}</div>
                                <div className="stat-desc">Relative to event start</div>
                            </div>

                            <div className="stat card bg-base-100 shadow-xl">
                                <div className="stat-figure text-accent">
                                    <CalendarIcon className="w-8 h-8"/>
                                </div>
                                <div className="stat-title">Event Date</div>
                                <div className="stat-value text-accent text-lg">
                                    {selectedEvent.date ? formatDate(selectedEvent.date) : 'No date'}
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">Check-in Status</h2>
                                    <div className="h-64 flex items-center justify-center">
                                        {stats.totalTickets > 0 ? (
                                            <Pie data={pieChartData} options={{maintainAspectRatio: false}}/>
                                        ) : (
                                            <p className="text-center text-gray-400">No ticket data available</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">Check-in Timeline</h2>
                                    <div className="h-64 flex items-center justify-center">
                                        {timeChartData ? (
                                            <Bar
                                                data={timeChartData}
                                                options={{
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            title: {
                                                                display: true,
                                                                text: 'Number of Check-ins'
                                                            }
                                                        },
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Time (Relative to Event Start)'
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <p className="text-center text-gray-400">No check-in timeline data
                                                available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search box - placed here before the attendee list */}
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400"/>
                            </div>
                            <input
                                type="text"
                                className="input border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                                placeholder="Search by name, email, or ticket ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>


                        {/* Attendee List */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                                    <h2 className="card-title">Attendee List</h2>

                                    {/*<div className="form-control w-full max-w-xs mt-2 md:mt-0">*/}
                                    {/*    <div className="input-group">*/}
                                    {/*        <input*/}
                                    {/*            type="text"*/}
                                    {/*            placeholder="Search attendees..."*/}
                                    {/*            className="input input-bordered w-full"*/}
                                    {/*            value={searchQuery}*/}
                                    {/*            onChange={(e) => setSearchQuery(e.target.value)}*/}
                                    {/*        />*/}
                                    {/*        <button className="btn btn-square">*/}
                                    {/*            <MagnifyingGlassIcon className="h-6 w-6"/>*/}
                                    {/*        </button>*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
                                </div>

                                {isLoading && !attendees.length ? (
                                    <div className="flex justify-center my-8">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </div>
                                ) : error && !attendees.length ? (
                                    <div className="alert alert-error">{error}</div>
                                ) : filteredAttendees.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchQuery ? 'No attendees match your search' : 'No attendees found for this event'}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Ticket #</th>
                                                <th>Status</th>
                                                <th>Check-in Time</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredAttendees.map((attendee) => (
                                                <tr key={attendee.id}
                                                    className={attendee.checkedIn ? 'bg-base-200' : ''}>
                                                    <td>{attendee.user?.displayName || 'N/A'}</td>
                                                    <td>{attendee.user?.email || attendee.email || 'N/A'}</td>
                                                    <td>{attendee.ticketNumber || 'N/A'}</td>
                                                    <td>
                                                        {attendee.checkedIn ? (
                                                            <div className="badge badge-success gap-1">
                                                                <CheckCircleIcon className="h-4 w-4"/>
                                                                Checked In
                                                            </div>
                                                        ) : (
                                                            <div className="badge badge-outline">Not Checked In</div>
                                                        )}
                                                    </td>
                                                    <td>{attendee.checkedInAt ? formatDate(attendee.checkedInAt) : '—'}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default AdminAttendance;
