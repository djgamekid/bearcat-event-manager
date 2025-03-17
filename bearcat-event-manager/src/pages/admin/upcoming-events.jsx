import { useState, useEffect } from 'react';
import { useEvents } from '../../context/eventContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

function UpcomingEventsCarousel() {
  const { events } = useEvents();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter upcoming events and sort by date
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Show only the next 5 upcoming events

  // Auto-advance carousel
  useEffect(() => {
    if (upcomingEvents.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === upcomingEvents.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(timer);
    }
  }, [upcomingEvents.length]);

  if (!upcomingEvents.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No upcoming events scheduled
      </div>
    );
  }

  const currentEvent = upcomingEvents[currentIndex];

  return (
    <div className="relative">
      {/* Event Card */}
      <div className="bg-base-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{currentEvent.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(currentEvent.date).toLocaleDateString()} at{' '}
              {new Date(currentEvent.date).toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">{currentEvent.location}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="badge badge-primary">
                {currentEvent.ticketsSold || 0} / {currentEvent.tickets} tickets sold
              </span>
              <span className="badge badge-secondary">
                ${currentEvent.price} per ticket
              </span>
            </div>
          </div>
          {currentEvent.imageUrl && (
            <img
              src={currentEvent.imageUrl}
              alt={currentEvent.title}
              className="w-24 h-24 object-cover rounded"
            />
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      {upcomingEvents.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev === 0 ? upcomingEvents.length - 1 : prev - 1
            )}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 btn btn-circle btn-sm btn-ghost"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev === upcomingEvents.length - 1 ? 0 : prev + 1
            )}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 btn btn-circle btn-sm btn-ghost"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {upcomingEvents.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {upcomingEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-base-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default UpcomingEventsCarousel;
