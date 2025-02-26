import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid"; 
import Navbar from "../../components/navbar"; 
import { useEvents } from "../../context/eventContext"; // Import global events

function AdminViewEvents() {
  const { events } = useEvents(); // Use global events
  const [sortOption, setSortOption] = useState("name"); // Default sorting by name

  // Sorting logic
  const sortedEvents = [...events].sort((a, b) => {
    if (sortOption === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortOption === "tickets") {
      return a.ticketsSold - b.ticketsSold;
    } else {
      return a.name.localeCompare(b.name); // Default: sort by name
    }
  });

  // Group events into rows (2 events per row)
  const groupedEvents = [];
  for (let i = 0; i < sortedEvents.length; i += 2) {
    groupedEvents.push(sortedEvents.slice(i, i + 2));
  }

  return (
    <>
      <Navbar /> 

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          {/* Create Event Button */}
          <div className="flex items-center">
            <h2 className="text-2xl font-bold mr-4">Events</h2>
            <a href="/create-event" className="btn btn-primary flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Event
            </a>
          </div>
          
          <div className="dropdown">
            <button className="btn btn-ghost">Sort By: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</button>
            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box w-52 p-2 shadow">
              <li><button onClick={() => setSortOption("name")}>Name</button></li>
              <li><button onClick={() => setSortOption("date")}>Date</button></li>
              <li><button onClick={() => setSortOption("tickets")}>Tickets Sold</button></li>
            </ul>
          </div>
        </div>

        {/* Events Grid (2 events per row) */}
        <div className="space-y-4">
          {groupedEvents.map((eventRow, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4">
              {eventRow.map((event) => (
                <div key={event.id} className="flex-none w-1/2 bg-base-100 shadow-lg rounded-lg">
                  <figure>
                    <img src="./paw.png" alt="Event" className="w-full rounded-t-lg" />
                  </figure>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <p className="text-sm text-gray-600">Date: {new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Tickets Sold: {event.ticketsSold}</p>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button className="btn btn-primary">Edit</button>
                      <button className="btn btn-error">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AdminViewEvents;
