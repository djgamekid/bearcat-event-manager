import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarUser from "../../components/navbar-user";
import { useTickets } from "../../context/ticketContext";
import { useEvents } from "../../context/eventContext";
import TicketDisplay from "../../components/TicketDisplay";

function UserTickets() {
  const navigate = useNavigate();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { events } = useEvents();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTicket, setSelectedTicket] = useState(null);

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

  // Filter tickets based on active tab
  const filteredTickets = tickets.filter(ticket => {
    const event = events.find(e => e.id === ticket.eventId);
    if (!event) return false;

    const eventDate = new Date(event.date);
    const now = new Date();

    if (activeTab === 'upcoming') {
      return eventDate > now;
    } else if (activeTab === 'past') {
      return eventDate < now;
    } else {
      return true;
    }
  });

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

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-8">
            <a
              className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Tickets
            </a>
            <a
              className={`tab ${activeTab === 'upcoming' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </a>
            <a
              className={`tab ${activeTab === 'past' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </a>
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
                          ticket.checkedIn ? 'badge-success' : 'badge-warning'
                        }`}>
                          {ticket.checkedIn ? 'Checked In' : 'Valid'}
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
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        View QR Code
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

      {/* QR Code Modal */}
      {selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Ticket QR Code</h3>
            <TicketDisplay ticket={selectedTicket} />
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserTickets;
