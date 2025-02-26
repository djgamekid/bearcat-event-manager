import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import { useEvents } from "../../context/eventContext"; // Import useEvents

function CreateEvent() {
  const navigate = useNavigate();
  const { addEvent } = useEvents(); // Get addEvent from context

  const [eventDetails, setEventDetails] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    tickets: 0,
    price: 0,
    image: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventDetails((prev) => ({
        ...prev,
        image: file,
      }));
      setPreview(URL.createObjectURL(file)); // Generate a local preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    addEvent(eventDetails); // Add event to global state
    console.log("Event Created:", eventDetails);

    // Reset form
    setEventDetails({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      tickets: 0,
      price: 0,
      image: null,
    });
    setPreview(null);

    navigate("/admin-view-events"); // Redirect after submission
  };

  return (
    <>
      <Navbar />
      <div className="p-6 md:p-12 bg-base-100 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-center flex-1">Create Event</h2>
          <button
            onClick={() => navigate("/admin-view-events")}
            className="btn btn-secondary"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
          <div>
            <label htmlFor="title" className="block text-lg font-semibold">
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={eventDetails.title}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-lg font-semibold">
              Event Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={eventDetails.date}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-lg font-semibold">
              Event Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={eventDetails.time}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-lg font-semibold">
              Event Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={eventDetails.location}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-lg font-semibold">
              Event Description
            </label>
            <textarea
              id="description"
              name="description"
              value={eventDetails.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              required
            />
          </div>

           {/* Image Upload */}
           <div>
            <label htmlFor="image" className="block text-lg font-semibold">
              Upload Event Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full"
            />
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="flex justify-center mt-4">
              <img
                src={preview}
                alt="Event Preview"
                className="w-full max-h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          <div>
            <label htmlFor="tickets" className="block text-lg font-semibold">
              Tickets Available
            </label>
            <input
              type="number"
              id="tickets"
              name="tickets"
              value={eventDetails.tickets}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-lg font-semibold">
              Ticket Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={eventDetails.price}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="flex justify-center">
            <button type="submit" className="btn btn-primary w-1/2">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CreateEvent;
