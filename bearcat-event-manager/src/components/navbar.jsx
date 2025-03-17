import { useState, useEffect } from "react";
import { Bars3Icon, EyeIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/authContext';
import SearchBar from "./searchbar";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin, viewingAsUser, switchToUserView, returnToAdminView } = useAuth();

  // Check if admin is viewing as user
  useEffect(() => {
    const adminViewing = localStorage.getItem('adminViewingAsUser') === 'true';
    setIsAdminView(adminViewing);
  }, []);

  // Handle viewing as user
  const handleViewAsUser = () => {
    switchToUserView();
    navigate('/');
  };

  // Handle returning to admin view
  const handleReturnToAdmin = () => {
    returnToAdminView();
    navigate('/admin');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    if (isAdmin) {
      navigate('/admin-profile');
    } else {
      navigate('/profile');
    }
  };

  // Handle settings navigation
  const handleSettingsClick = () => {
    if (isAdmin) {
      navigate('/admin-settings');
    } else {
      navigate('/settings');
    }
  };

  return (
    <>
      {/* Admin Banner */}
      {isAdminView && (
        <div className="bg-primary text-primary-content py-2 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="badge badge-secondary">Admin View</span>
              <span>Viewing as User</span>
            </div>
            <button
              onClick={handleReturnToAdmin}
              className="btn btn-sm btn-ghost text-primary-content hover:bg-primary-focus"
            >
              Return to Admin
            </button>
          </div>
        </div>
      )}

      <nav className="navbar bg-base-100 shadow-sm px-4 md:px-6">
        {/* Left Side - Logo & Mobile Menu Button */}
        <div className="flex items-center md:pr-6">
          <button className="md:hidden btn btn-ghost btn-circle" onClick={() => setIsOpen(!isOpen)}>
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          </button>
          <Link to="/admin" className="btn btn-ghost text-xl hidden md:block">
            Bearcat Event Manager
          </Link>
        </div>

        {/* Center - SearchBar */}
        <div className="flex-1 hidden md:flex justify-center">
          <SearchBar />
        </div>

        {/* Center - Navbar Links (Hidden on Mobile) */}
        {isAdmin && (
          <div className="hidden md:flex items-center gap-2 mr-8">
            <Link to="/admin-view-events" className="btn btn-ghost">View Events</Link>
            <Link to="/admin-users" className="btn btn-ghost">Users</Link>
            <Link to="/attendance" className="btn btn-ghost">Attendance</Link>
            <button
              onClick={handleViewAsUser}
              className="btn btn-primary btn-sm"
              title="View as User"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View as User
            </button>
          </div>
        )}

        {/* Right Side - Avatar */}
        <div className="flex items-center">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="User avatar"
                  src={currentUser?.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              <li><button onClick={handleProfileClick}>Profile</button></li>
              <li><button onClick={handleSettingsClick}>Settings</button></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-base-100 shadow-md md:hidden">
            <ul className="menu menu-sm p-4">
              {isAdmin && (
                <>
                  <li><Link to="/admin-view-events">View Events</Link></li>
                  <li><Link to="/admin-users">Users</Link></li>
                  <li><Link to="/attendance">Attendance</Link></li>
                  <li>
                    <button
                      onClick={handleViewAsUser}
                      className="flex items-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View as User
                    </button>
                  </li>
                </>
              )}
              <li><button onClick={handleProfileClick}>Profile</button></li>
              <li><button onClick={handleSettingsClick}>Settings</button></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar; 