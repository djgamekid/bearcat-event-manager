import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../../context/eventContext";
import { useAuth } from "../../context/authContext";
import { useTickets } from "../../context/ticketContext";
import NavbarUser from "../../components/navbar-user";
import TicketDisplay from "../../components/TicketDisplay";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

function UserTicketsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, loading: eventsLoading } = useEvents();
  const { currentUser } = useAuth();
  const { purchaseTickets, loading: ticketLoading, error: ticketError } = useTickets();
  const [quantity, setQuantity] = useState(1);
  const [purchasedTickets, setPurchasedTickets] = useState(null);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('Component rendered with eventId from params:', id);
  console.log('Events from context:', events);
  console.log('Current loading states:', { loading, eventsLoading, ticketLoading });

  // Try to find event in context first
  useEffect(() => {
    console.log('Searching for event in context with eventId:', id);
    if (events && events.length > 0 && id) {
      const foundEvent = events.find(e => e.id === id);
      console.log('Found event in context:', foundEvent);
      if (foundEvent) {
        setEvent(foundEvent);
        setLoading(false);
      } else {
        console.log('Event not found in context, will try Firestore');
      }
    }
  }, [events, id]);

  // If not found in context, fetch from Firestore
  useEffect(() => {
    if (!id) {
      console.log('No eventId provided');
      setError("No event ID provided");
      setLoading(false);
      return;
    }

    if (event) {
      console.log('Event already loaded:', event);
      return;
    }

    const fetchEvent = async () => {
      try {
        console.log('Fetching event from Firestore with ID:', id);
        const eventRef = doc(db, 'events', id);
        const eventDoc = await getDoc(eventRef);
        
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
          console.log('Found event in Firestore:', eventData);
          setEvent(eventData);
          setError(null);
        } else {
          console.log('Event not found in Firestore');
          setError("Event not found");
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError("Error loading event: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!eventsLoading) {
      console.log('Attempting to fetch event from Firestore');
      fetchEvent();
    }
  }, [id, event, eventsLoading]);

  const handlePurchase = async () => {
    console.log('Purchase initiated:', { eventId: id, quantity, currentUser });
    if (!currentUser) {
      setError("Please log in to purchase tickets");
      return;
    }

    if (quantity > event.ticketsAvailable) {
      setError("Not enough tickets available");
      return;
    }

    try {
      console.log('Attempting to purchase tickets');
      const tickets = await purchaseTickets(id, quantity);
      console.log('Tickets purchased successfully:', tickets);
      setPurchasedTickets(tickets);
      setError(null);
      // Redirect to confirmation page with ticket IDs
      const ticketIds = tickets.map(ticket => ticket.id).join(',');
      navigate(`/ticket-confirmation?tickets=${ticketIds}`);
    } catch (err) {
      console.error('Error purchasing tickets:', err);
      setError(err.message);
    }
  };

  return (
    <>
      <NavbarUser />
      <div className="min-h-screen bg-base-200 py-8">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Events
          </button>
        </div>

        {loading || eventsLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : error ? (
          <div className="max-w-7xl mx-auto px-4">
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          </div>
        ) : event ? (
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Event Details */}
              <div className="lg:col-span-2">
                <div className="card bg-base-100 shadow-xl">
                  {event.imageUrl && (
                    <figure>
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-64 object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <h2 className="card-title text-3xl">{event.title}</h2>
                    <div className="flex flex-wrap gap-4 my-4">
                      <div className="badge badge-primary">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="badge badge-secondary">
                        {new Date(event.date).toLocaleTimeString()}
                      </div>
                      <div className="badge badge-accent">{event.location}</div>
                    </div>
                    <p className="text-lg mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="stat-value text-primary">${event.price}</div>
                      {event.capacity && (
                        <div className="stat">
                          <div className="stat-title">Available Tickets</div>
                          <div className="stat-value">{event.capacity}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="lg:col-span-1">
                <div className="card bg-base-100 shadow-xl sticky top-8">
                  <div className="card-body">
                    <h2 className="card-title">Purchase Tickets</h2>
                    {!currentUser ? (
                      <div className="alert alert-info">
                        <div>
                          <h3 className="font-bold">Sign in to Purchase</h3>
                          <div className="text-sm mt-2">
                            Please sign in or create an account to purchase tickets.
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => navigate('/login')}
                              className="btn btn-primary btn-sm"
                            >
                              Sign In
                            </button>
                            <button
                              onClick={() => navigate('/signup')}
                              className="btn btn-ghost btn-sm"
                            >
                              Create Account
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Quantity</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={event.capacity || 10}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="input input-bordered w-full"
                          />
                        </div>
                        <div className="mt-4">
                          <div className="text-xl font-bold">
                            Total: ${(event.price * quantity).toFixed(2)}
                          </div>
                        </div>
                        <div className="mt-6">
                          <button
                            onClick={handlePurchase}
                            className={`btn btn-primary w-full ${ticketLoading ? 'loading' : ''}`}
                            disabled={ticketLoading}
                          >
                            {ticketLoading ? 'Processing...' : 'Purchase Tickets'}
                          </button>
                        </div>
                        {ticketError && (
                          <div className="alert alert-error mt-4">
                            <span>{ticketError}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <div className="alert alert-error">
              <span>Event not found</span>
            </div>
          </div>
        )}
      </div>

      {/* Purchased Tickets Modal */}
      {purchasedTickets && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Your Tickets</h3>
            <div className="space-y-4">
              {purchasedTickets.map((ticket) => (
                <TicketDisplay key={ticket.id} ticket={ticket} />
              ))}
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setPurchasedTickets(null);
                  navigate('/user-tickets');
                }}
              >
                View All My Tickets
              </button>
              <button
                className="btn"
                onClick={() => setPurchasedTickets(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserTicketsDetail;
