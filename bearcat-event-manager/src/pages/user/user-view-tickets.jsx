import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarUser from "../../components/navbar-user";
import { useTickets } from "../../context/ticketContext";
import { useEvents } from "../../context/eventContext";

function UserViewTickets() {
  const navigate = useNavigate();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(ticket => {
    const event = events.find(e => e.id === ticket.eventId);
    return event && (
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (ticketsLoading) {
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
      <div className="p-6 md:p-12 bg-base-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">My Tickets</h1>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              ← Back to Events
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search tickets..."
              className="input input-bordered w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tickets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
              const event = events.find(e => e.id === ticket.eventId);
              if (!event) return null;

              return (
                <div key={ticket.id} className="card bg-base-200 shadow-xl">
                  {event.imageUrl && (
                    <figure>
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <h2 className="card-title">{event.title}</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()} at{" "}
                      {new Date(event.date).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm">
                        <span className="font-semibold">Status:</span>{" "}
                        <span className={`badge ${
                          ticket.status === 'active' ? 'badge-success' : 'badge-error'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Purchased:</span>{" "}
                        {new Date(ticket.purchaseDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/user-tickets/${ticket.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No tickets found</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => navigate('/')}
              >
                Browse Events
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserViewTickets;
