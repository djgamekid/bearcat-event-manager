import { useState } from 'react';
import { useEvents } from '../context/eventContext';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';

function TicketDisplay({ ticket }) {
  const { events } = useEvents();
  const [showQR, setShowQR] = useState(false);
  const event = events.find(e => e.id === ticket.eventId);

  if (!event) {
    return <div>Loading event details...</div>;
  }

  const handleDownloadQR = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `ticket-${ticket.checkInCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{event.title}</h2>
        <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
        <p className="text-gray-600">{new Date(event.date).toLocaleTimeString()}</p>
        <p className="text-gray-600">{event.location}</p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Check-in Code:</span>
          <span className="font-mono font-bold">{ticket.checkInCode}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Purchase Date:</span>
          <span>{new Date(ticket.purchaseDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded ${
            ticket.checkedIn 
              ? 'bg-green-100 text-green-800' 
              : ticket.status === 'active'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {ticket.checkedIn ? 'Checked In' : ticket.status}
          </span>
        </div>
        {ticket.checkedIn && (
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Checked In At:</span>
            <span>{new Date(ticket.checkedInAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="btn btn-primary flex-1"
          >
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>
          <button
            onClick={handleDownloadQR}
            className="btn btn-secondary"
            title="Download QR Code"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
        </div>
        
        {showQR && (
          <div className="flex flex-col items-center space-y-2">
            <img
              src={ticket.qrCode}
              alt="Ticket QR Code"
              className="max-w-[200px] mx-auto"
            />
            <p className="text-sm text-gray-500">
              Show this QR code at the event entrance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketDisplay;