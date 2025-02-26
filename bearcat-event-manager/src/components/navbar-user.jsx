import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import SearchBar from "./searchbar";

function NavbarUser() {
    const [isOpen, setIsOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // Load cart count from localStorage on mount
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalTickets = storedCart.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalTickets);
    }, []);

    return (
        <nav className="navbar bg-base-200 px-4 md:px-8 relative">
            {/* Left Section - Logo & Menu Button */}
            <div className="flex items-center md:pr-6">
                <button className="md:hidden btn btn-ghost btn-circle" onClick={() => setIsOpen(!isOpen)}>
                    <Bars3Icon className="h-6 w-6 text-gray-600" />
                </button>
                <Link to="/" className="btn btn-ghost text-xl">
                    🎟️ Bearcat Event Manager
                </Link>
            </div>

            {/* Center - SearchBar (Visible only on md+ screens) */}
            <div className="flex-1 hidden md:flex justify-center">
                <SearchBar />
            </div>

            {/* Right Section - Tickets, Cart, Profile */}
            <div className="flex gap-4 items-center">
                <Link to="/user-tickets" className="btn btn-secondary hidden md:flex">Tickets</Link>
                <Link to="/login" className="btn btn-primary hidden md:flex">Sign In / Register</Link>

                {/* Cart Icon with Badge */}
                <div className="relative">
                    <Link to="/user-view-tickets" className="btn btn-ghost btn-circle tooltip tooltip-bottom" data-tip="View Cart">
                        <ShoppingCartIcon className="h-6 w-6 text-gray-600" />
                        {cartCount > 0 && (
                            <span className="badge badge-error absolute -top-1 -right-1">{cartCount}</span>
                        )}
                    </Link>
                </div>

                {/* Profile Avatar Dropdown */}
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
                        <li><Link to="/profile">Profile</Link></li>
                        <li><Link to="/settings">Settings</Link></li>
                        <li><Link to="/logout">Logout</Link></li>
                    </ul>
                </div>
            </div>

            {/* Mobile Menu - Smooth Expand */}
            <div
                className={`absolute top-16 left-0 w-full bg-base-100 shadow-md md:hidden transition-all duration-300 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            >
                <ul className="menu menu-sm p-4">
                    <li><Link to="/user-tickets">Tickets</Link></li>
                    <li><Link to="/view-tickets">View Cart</Link></li>
                    <li><Link to="/login">Sign In / Register</Link></li>
                    <li><Link to="/admin-view-events">View Events</Link></li>
                    <li><Link to="/attendance">Attendance</Link></li>
                </ul>
            </div>
        </nav>
    );
}

export default NavbarUser;
