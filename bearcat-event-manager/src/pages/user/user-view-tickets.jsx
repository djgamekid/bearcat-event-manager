import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ViewTickets() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Handle quantity change
  const updateQuantity = (id, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  return (
    <div className="p-6 md:p-12 bg-base-100 space-y-6">
      <h2 className="text-3xl font-bold text-center">Your Tickets</h2>
      {cart.length === 0 ? (
        <p className="text-center text-gray-600">No tickets in cart</p>
      ) : (
        <div className="space-y-4">
          {cart.map((ticket) => (
            <div key={ticket.id} className="card bg-white shadow-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">{ticket.title}</h3>
                <p>{ticket.date} - {ticket.location}</p>
                <p className="text-gray-600">${ticket.price} per ticket</p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={ticket.quantity}
                  onChange={(e) => updateQuantity(ticket.id, parseInt(e.target.value))}
                  className="input input-bordered w-20"
                />
                <button onClick={() => removeFromCart(ticket.id)} className="btn btn-error">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate("/user-tickets")} className="btn btn-secondary">
        ← Back to Tickets
      </button>
    </div>
  );
}

export default ViewTickets;
