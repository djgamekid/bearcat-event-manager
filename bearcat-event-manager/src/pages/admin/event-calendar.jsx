import { useState } from 'react';
import { useEvents } from '../../context/eventContext';
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

function EventCalendar() {
  const { events } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, past
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Get events for the current month
  const getEventsForMonth = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const isInMonth = eventDate >= startOfMonth && eventDate <= endOfMonth;
      
      if (filterStatus === 'all') return isInMonth;
      if (filterStatus === 'upcoming') return isInMonth && eventDate >= new Date();
      if (filterStatus === 'past') return isInMonth && eventDate < new Date();
      
      return isInMonth;
    });
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get month name
  const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Navigate to previous/next month
  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction));
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get event status
  const getEventStatus = (event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) return 'past';
    if (event.ticketsSold >= event.tickets) return 'sold-out';
    return 'upcoming';
  };

  const days = getDaysInMonth(currentMonth);
  const monthEvents = getEventsForMonth(currentMonth);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigateMonth(-1)} className="btn btn-ghost btn-sm">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold">{getMonthName(currentMonth)}</h3>
          <button onClick={() => navigateMonth(1)} className="btn btn-ghost btn-sm">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-ghost btn-sm"
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
          {showFilters && (
            <div className="absolute right-0 mt-2 w-48 bg-base-100 shadow-lg rounded-box z-10">
              <div className="p-2">
                <button
                  className={`w-full text-left px-2 py-1 rounded ${filterStatus === 'all' ? 'bg-primary text-primary-content' : ''}`}
                  onClick={() => {
                    setFilterStatus('all');
                    setShowFilters(false);
                  }}
                >
                  All Events
                </button>
                <button
                  className={`w-full text-left px-2 py-1 rounded ${filterStatus === 'upcoming' ? 'bg-primary text-primary-content' : ''}`}
                  onClick={() => {
                    setFilterStatus('upcoming');
                    setShowFilters(false);
                  }}
                >
                  Upcoming Events
                </button>
                <button
                  className={`w-full text-left px-2 py-1 rounded ${filterStatus === 'past' ? 'bg-primary text-primary-content' : ''}`}
                  onClick={() => {
                    setFilterStatus('past');
                    setShowFilters(false);
                  }}
                >
                  Past Events
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold p-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = day ? getEventsForDate(day) : [];
          const isToday = day && day.toDateString() === new Date().toDateString();
          const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border rounded-lg ${
                isToday ? 'bg-primary text-primary-content' : ''
              } ${isSelected ? 'border-primary' : 'border-base-300'}`}
              onClick={() => day && setSelectedDate(day)}
            >
              {day && (
                <>
                  <div className="text-sm font-semibold">{day.getDate()}</div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayEvents.map(event => {
                        const status = getEventStatus(event);
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${
                              status === 'sold-out' ? 'bg-error text-error-content' :
                              status === 'past' ? 'bg-base-300' :
                              'bg-primary text-primary-content'
                            }`}
                            title={`${event.title} - ${status}`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">
            Events for {selectedDate.toLocaleDateString()}
          </h4>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map(event => {
              const status = getEventStatus(event);
              return (
                <div key={event.id} className="bg-base-200 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{event.title}</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tickets Sold: {event.ticketsSold || 0} / {event.tickets}
                      </p>
                    </div>
                    <div className="badge badge-{status === 'sold-out' ? 'error' : status === 'past' ? 'ghost' : 'primary'}">
                      {status}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="btn btn-sm btn-primary">View Details</button>
                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/admin-view-events', { state: { editEventId: event.id } });
                      }}
                    >
                      Edit Event
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventCalendar;
