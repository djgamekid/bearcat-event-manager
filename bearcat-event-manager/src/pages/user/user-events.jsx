import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../../context/eventContext";
import { useAuth } from "../../context/authContext";
import NavbarUser from "../../components/navbar-user";

function UserEvents() {
  const navigate = useNavigate();
  const { events = [], loading } = useEvents();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Get unique categories from events with null checking
  const categories = ["all", ...new Set(events?.map(event => event?.category || 'Uncategorized').filter(Boolean))];

  useEffect(() => {
    if (!Array.isArray(events)) {
      setFilteredEvents([]);
      return;
    }

    try {
      let filtered = [...events];

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(event =>
          (event?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event?.location || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (selectedCategory !== "all") {
        filtered = filtered.filter(event => event?.category === selectedCategory);
      }

      // Apply date filter
      const now = new Date();
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(event => {
            if (!event?.date) return false;
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            if (!event?.date) return false;
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= nextWeek;
          });
          break;
        case "month":
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          filtered = filtered.filter(event => {
            if (!event?.date) return false;
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= nextMonth;
          });
          break;
        default:
          // Show all future events by default
          filtered = filtered.filter(event => {
            if (!event?.date) return false;
            return new Date(event.date) >= now;
          });
      }

      // Sort by date with null checking
      filtered.sort((a, b) => {
        const dateA = a?.date ? new Date(a.date) : new Date(0);
        const dateB = b?.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });

      setFilteredEvents(filtered);
    } catch (error) {
      console.error('Error filtering events:', error);
      setFilteredEvents([]);
    }
  }, [events, searchTerm, selectedCategory, dateFilter]);

  const handleGetTickets = (eventId) => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/user-tickets/${eventId}` } });
    } else {
      navigate(`/user-tickets/${eventId}`);
    }
  };

  if (loading) {
    return (
      <>
        <NavbarUser />
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarUser />
      <div className="min-h-screen bg-base-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Find Your Next Event</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover amazing events happening around you. From concerts to workshops,
              find the perfect event that matches your interests.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-base-100 rounded-box shadow-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="form-control">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="input input-bordered w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Upcoming Events</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end">
                <span className="text-sm opacity-75">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                  {event.imageUrl && (
                    <figure className="relative h-48">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {event.ticketsAvailable <= 10 && (
                        <div className="absolute top-4 right-4">
                          <div className="badge badge-warning gap-2 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Only {event.ticketsAvailable} left
                          </div>
                        </div>
                      )}
                    </figure>
                  )}
                  <div className="card-body">
                    <h2 className="card-title">
                      {event.title}
                      {event.category && (
                        <div className="badge badge-primary">{event.category}</div>
                      )}
                    </h2>
                    <p className="line-clamp-2">{event.description}</p>
                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span>${event.price}</span>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleGetTickets(event.id)}
                      >
                        {currentUser ? 'Get Tickets' : 'Sign in to Purchase'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content opacity-50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-bold mb-2">No Events Found</h3>
                <p className="text-base-content opacity-75">
                  Try adjusting your search or filter criteria to find more events.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserEvents; 