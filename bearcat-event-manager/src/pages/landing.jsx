import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import NavbarUser from "../components/navbar-user";
import { useEvents } from "../context/eventContext";

function Landing() {
  const { currentUser, isAdmin } = useAuth();
  const { events, loading } = useEvents();
  const navigate = useNavigate();

  // Get featured events (most recent 6 events)
  const featuredEvents = events
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <>
      <NavbarUser />
      <div className="min-h-screen bg-base-200">
        {/* Hero Section */}
        <div className="hero bg-base-100 py-12">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">
                Welcome to Bearcat Event Manager
              </h1>
              <p className="text-lg mb-6">
                Your one-stop destination for all Northwest Missouri State University events.
              </p>
              {!currentUser && (
                <div className="flex justify-center gap-4">
                  <button onClick={() => navigate('/login')} className="btn btn-primary">
                    Sign In
                  </button>
                  <button onClick={() => navigate('/signup')} className="btn btn-ghost">
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Events Section */}
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Events</h2>
            <button
              onClick={() => navigate('/user-events')}
              className="btn btn-primary btn-sm"
            >
              View All Events
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <div key={event.id} className="card bg-base-100 shadow-xl">
                <figure className="px-4 pt-4">
                  <img
                    src={event.imageUrl || "https://placehold.co/600x400?text=Event"}
                    alt={event.title}
                    className="rounded-xl h-48 w-full object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h3 className="card-title">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="line-clamp-2">{event.description}</p>
                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => navigate(`/user-tickets/${event.id}`)}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Landing; 