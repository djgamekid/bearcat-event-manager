import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid"; 
import Navbar from "../../components/navbar"; 
import { useEvents } from "../../context/eventContext"; // Import global events
import Skeleton from "../../components/skeleton";
import { useLocation, useNavigate } from "react-router-dom";

function AdminViewEvents() {
  const { events, loading, deleteEvent, updateEvent } = useEvents(); // Use global events
  const [sortOption, setSortOption] = useState("name"); // Default sorting by name
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle editEventId from navigation state
  useEffect(() => {
    if (location.state?.editEventId) {
      const eventToEdit = events.find(event => event.id === location.state.editEventId);
      if (eventToEdit) {
        setEditingEvent(eventToEdit);
      }
    }
  }, [location.state, events]);

  // Sorting logic
  const sortedEvents = [...events].sort((a, b) => {
    if (sortOption === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortOption === "tickets") {
      return a.ticketsSold - b.ticketsSold;
    } else {
      return a.title.localeCompare(b.title);
    } 
  });

  // Group events into rows (2 events per row)
  const groupedEvents = [];
  for (let i = 0; i < sortedEvents.length; i += 2) {
    groupedEvents.push(sortedEvents.slice(i, i + 2));
  }

  const handleEdit = (event) => {
    setEditingEvent(event);
  };

  const handleDelete = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id);
        setShowDeleteModal(false);
        setEventToDelete(null);
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  return (
    <>
      <Navbar /> 

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          {/* Create Event Button */}
          <div className="flex items-center">
            <h2 className="text-2xl font-bold mr-4">Events</h2>
            <a href="/create-event" className="btn btn-primary flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Event
            </a>
          </div>
          
          <div className="dropdown">
            <button className="btn btn-ghost">Sort By: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</button>
            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box w-52 p-2 shadow">
              <li><button onClick={() => setSortOption("name")}>Name</button></li>
              <li><button onClick={() => setSortOption("date")}>Date</button></li>
              <li><button onClick={() => setSortOption("tickets")}>Tickets Sold</button></li>
            </ul>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton />
            <Skeleton />
          </div>
        ) : (
          /* Events Grid (2 events per row) */
          <div className="space-y-4">
            {groupedEvents.map((eventRow, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4">
                {eventRow.map((event) => (
                  <div key={event.id} className="flex-none w-1/2 bg-base-100 shadow-lg rounded-lg">
                    <figure>
                      <img 
                        src={event.imageUrl || "./paw.png"} 
                        alt={event.title} 
                        className="w-full h-48 object-cover rounded-t-lg" 
                      />
                    </figure>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">Date: {new Date(event.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Time: {new Date(event.date).toLocaleTimeString()}</p>
                      <p className="text-sm text-gray-600">Location: {event.location}</p>
                      <p className="text-sm text-gray-600">Tickets Sold: {event.ticketsSold || 0} / {event.tickets}</p>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button 
                          className="btn btn-success"
                          onClick={() => navigate(`/admin-checkin?event=${event.id}`)}
                        >
                          Check In
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleEdit(event)}
                        >
                          <PencilIcon className="h-5 w-5 mr-1" />
                          Edit
                        </button>
                        <button 
                          className="btn btn-error"
                          onClick={() => handleDelete(event)}
                        >
                          <TrashIcon className="h-5 w-5 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Event</h3>
            <p className="py-4">
              Are you sure you want to delete "{eventToDelete.title}"? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => {
                setShowDeleteModal(false);
                setEventToDelete(null);
              }}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Event</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedEvent = {
                ...editingEvent,
                title: formData.get('title'),
                date: formData.get('date'),
                time: formData.get('time'),
                location: formData.get('location'),
                description: formData.get('description'),
                tickets: parseInt(formData.get('tickets')),
                price: parseFloat(formData.get('price')),
              };
              updateEvent(editingEvent.id, updatedEvent);
              setEditingEvent(null);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingEvent.title}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date(editingEvent.date).toISOString().split('T')[0]}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={new Date(editingEvent.date).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingEvent.location}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingEvent.description}
                    className="textarea textarea-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">Available Tickets</label>
                  <input
                    type="number"
                    name="tickets"
                    defaultValue={editingEvent.tickets}
                    className="input input-bordered w-full"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingEvent.price}
                    className="input input-bordered w-full"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setEditingEvent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminViewEvents;
