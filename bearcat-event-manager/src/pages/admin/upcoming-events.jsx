import React from 'react';

const upcomingEvents = [
  { id: 1, title: "Music Concert", date: "2025-03-15", location: "Stadium A", imageUrl: "./paw.png" },
  { id: 2, title: "Tech Conference", date: "2025-04-20", location: "Convention Center", imageUrl: "./paw.png" },
  { id: 3, title: "Art Exhibition", date: "2025-05-10", location: "Gallery B", imageUrl: "./paw.png" },
  { id: 4, title: "Food Festival", date: "2025-06-25", location: "Park C", imageUrl: "./paw.png" },
];

const UpcomingEventsCarousel = () => {
  return (
    <div className="card bg-base-100 shadow-lg p-4">
      <div className="card-body">
        <h2 className="card-title text-xl font-bold">Upcoming Events</h2>
        <div className="carousel w-full">
          {upcomingEvents.map((event, index) => (
            <div key={event.id} id={`slide${index + 1}`} className="carousel-item relative w-full">
              <img src={event.imageUrl} alt={event.title} className="w-full" />
              <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                <a href={`#slide${index === 0 ? upcomingEvents.length : index}`} className="btn btn-circle">❮</a>
                <a href={`#slide${index === upcomingEvents.length - 1 ? 1 : index + 2}`} className="btn btn-circle">❯</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEventsCarousel;
