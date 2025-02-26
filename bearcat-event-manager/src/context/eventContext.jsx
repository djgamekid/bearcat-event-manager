import { createContext, useContext, useState } from "react";

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([
    { id: 1, name: "Concert A", date: "2025-05-10", ticketsSold: 150, price: 20 },
    { id: 2, name: "Concert B", date: "2025-04-15", ticketsSold: 200, price: 30 },
    { id: 3, name: "Concert C", date: "2025-03-30", ticketsSold: 50, price: 15 },
  ]); // Dummy data for now

  // Function to add an event
  const addEvent = (eventDetails) => {
    const newEvent = {
      ...eventDetails,
      id: events.length + 1, // Generate a new ID (this will be handled by Firebase later)
    };
    setEvents([...events, newEvent]); // Update state
  };

  return (
    <EventContext.Provider value={{ events, addEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventContext);
}
