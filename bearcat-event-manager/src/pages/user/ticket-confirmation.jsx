import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTickets } from '../../context/ticketContext';
import { useEvents } from '../../context/eventContext';
import NavbarUser from '../../components/navbar-user';
import TicketDisplay from '../../components/TicketDisplay';

function TicketConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketIds = useMemo(() => searchParams.get('tickets')?.split(',') || [], [searchParams]);
  const { tickets } = useTickets();
  const [purchasedTickets, setPurchasedTickets] = useState([]);

  useEffect(() => {
    // Find the purchased tickets from the ticket IDs in the URL
    const foundTickets = tickets.filter(ticket => ticketIds.includes(ticket.id));
    setPurchasedTickets(foundTickets);
  }, [tickets, ticketIds]);

  return (
    <>
      <NavbarUser />
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Purchase Confirmation</h1>
            <button
              onClick={() => navigate('/user-tickets')}
              className="btn btn-primary"
            >
              View All Tickets
            </button>
          </div>

          {purchasedTickets.length > 0 ? (
            <div className="space-y-8">
              <div className="alert alert-success">
                <span>Thank you for your purchase! Your tickets are ready.</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {purchasedTickets.map((ticket) => (
                  <div key={ticket.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <TicketDisplay ticket={ticket} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-base-100 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Important Information</h2>
                <ul className="space-y-2 list-disc list-inside text-gray-600">
                  <li>A confirmation email has been sent to your registered email address.</li>
                  <li>Each ticket has a unique QR code that will be scanned at the event.</li>
                  <li>Please keep your tickets safe and do not share the QR codes.</li>
                  <li>You can always access your tickets from the "My Tickets" section.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="alert alert-error">
              <span>No ticket information found. Please check your purchase details.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TicketConfirmation; 