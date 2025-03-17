import React from 'react';
import UpcomingEventsCarousel from './upcoming-events';
import EventCalendar from './event-calendar';
import EventAnalytics from './event-analytics';

function Dashboard() {
  return (
    <div className="min-h-screen bg-base-200 py-8 px-4 sm:px-6 md:px-8 lg:px-12">
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Upcoming Events Carousel */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-xl font-bold">Upcoming Events</h2>
            <UpcomingEventsCarousel />
          </div>
        </div>

        {/* Card 2: Event Analytics */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-xl font-bold">Event Analytics</h2>
            <EventAnalytics />
          </div>
        </div>

        {/* Card 3: Event Calendar */}
        <div className="card bg-base-100 shadow-lg lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title text-xl font-bold">Event Calendar</h2>
            <EventCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
