import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../context/authContext';

function CreateEvent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      setEventDetails((prev) => ({
        ...prev,
        image: file,
      }));
      setPreview(URL.createObjectURL(file)); // Generate a local preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate form data
      if (!eventDetails.title || !eventDetails.date || !eventDetails.time || 
          !eventDetails.location || !eventDetails.description || !eventDetails.price || 
          !eventDetails.tickets) {
        throw new Error('Please fill in all required fields');
      }

      // Validate ticket fields
      const ticketsAvailable = parseInt(eventDetails.tickets);
      if (isNaN(ticketsAvailable) || ticketsAvailable <= 0) {
        throw new Error("Number of tickets must be greater than 0");
      }

      if (eventDetails.price < 0) {
        throw new Error("Price cannot be negative");
      }

      // Format date and time for Firebase
      const combinedDateTime = new Date(`${eventDetails.date}T${eventDetails.time}`);
      
      // Validate date is in the future
      if (combinedDateTime <= new Date()) {
        throw new Error("Event date must be in the future");
      }

      let imageUrl = null;
      // Handle image upload if an image was selected
      if (eventDetails.image) {
        const imageRef = ref(storage, `events/${Date.now()}_${eventDetails.image.name}`);
        await uploadBytes(imageRef, eventDetails.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Create event document
      const eventRef = await addDoc(collection(db, 'events'), {
        title: eventDetails.title,
        date: combinedDateTime.toISOString(),
        time: eventDetails.time,
        location: eventDetails.location,
        description: eventDetails.description,
        tickets: ticketsAvailable,
        ticketsAvailable: ticketsAvailable,
        ticketsSold: 0,
        price: parseFloat(eventDetails.price),
        imageUrl, // Store the image URL instead of the file
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'active'
      });

      // Log success
      console.log('Event created successfully:', {
        eventId: eventRef.id,
        totalTickets: ticketsAvailable
      });

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

      // Navigate back to events list
      navigate("/admin-view-events");
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.message || "Error creating event");
    } finally {
      setIsSubmitting(false);
    }
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

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
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
              min="0"
              disabled={isSubmitting}
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
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className={`btn btn-primary w-1/2 ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CreateEvent;
