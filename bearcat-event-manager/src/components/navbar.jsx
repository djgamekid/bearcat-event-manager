import { useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import SearchBar from "./searchbar"; // Assuming you have a SearchBar component

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
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
      <div className="hidden md:flex items-center">
        <Link to="/admin-view-events" className="btn btn-ghost">View Events</Link>
        <Link to="/attendance" className="btn btn-ghost">Attendance</Link>
      </div>

      {/* Right Side - Avatar */}
      <div className="flex items-center md:flex-shrink-0">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="User avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
          >
            <li><a>Profile</a></li>
            <li><a>Settings</a></li>
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-base-100 shadow-md md:hidden">
          <ul className="menu menu-sm p-4">
            <li><Link to="/admin-view-events">View Events</Link></li>
            <li><Link to="/attendance">Attendance</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
