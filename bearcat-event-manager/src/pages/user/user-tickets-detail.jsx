import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { testEvents } from "./user-tickets"; // Import testEvents

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = testEvents.find((ticket) => ticket.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);

  if (!event) {
    return <div className="text-center text-xl font-bold">Event not found</div>;
  }

  const handleAddToCart = () => {
    console.log(`Added ${quantity} ticket(s) for ${event.title} to cart`);
    navigate("/user-tickets");
  };

  return (
    <div className="p-6 md:p-12 bg-base-100 space-y-6">
      <button onClick={() => navigate("/user-tickets")} className="btn btn-secondary">
        ← Back to Tickets
      </button>
      <div className="card bg-white shadow-xl p-6">
        <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded-md" />
        <h2 className="text-3xl font-bold mt-4">{event.title}</h2>
        <p className="text-gray-600">{event.date}</p>
        <p className="text-gray-600">{event.location}</p>
        <p className="text-lg mt-4">{event.description}</p>
        <p className="text-xl font-semibold mt-2">${event.price} per ticket</p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input input-bordered w-20"
          />
          <button onClick={handleAddToCart} className="btn btn-primary">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketDetails;
