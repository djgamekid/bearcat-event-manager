import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';

const events = [
  { date: new Date(2025, 2, 15), title: "Music Concert" },
  { date: new Date(2025, 3, 20), title: "Tech Conference" },
  { date: new Date(2025, 4, 10), title: "Art Exhibition" },
  { date: new Date(2025, 5, 25), title: "Food Festival" }
];

const EventCalendar = () => {
  const [date, setDate] = useState(null);

  const hasEvent = (date) => {
    return events.some((event) => event.date.toDateString() === date.toDateString());
  };

  return (
    <div className="card bg-base-100 shadow-lg p-4">
      <div className="card-body">
        <h2 className="card-title text-xl font-bold">Event Calendar</h2>
        <div className="dropdown">
          <button className="btn btn-outline w-full">
            {date ? date.toLocaleDateString() : 'Pick a date'}
          </button>
          <div className="dropdown-content mt-2 p-4 shadow-lg rounded-lg bg-base-100">
            <DayPicker 
              selected={date} 
              onSelect={setDate} 
              tileClassName={({ date, view }) => {
                if (view === "month" && hasEvent(date)) {
                  return "bg-blue-500 text-white"; // Highlight event dates
                }
              }} 
            />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Event on {date ? date.toDateString() : ''}:</h3>
          <ul className="list-disc pl-5">
            {events.filter((event) => event.date.toDateString() === date?.toDateString())
              .map((event, index) => (
                <li key={index} className="text-sm">{event.title}</li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
