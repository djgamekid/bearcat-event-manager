import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Bars3Icon, 
    ShoppingCartIcon, 
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    TicketIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/solid";
import SearchBar from "./searchbar";
import { useAuth } from '../context/authContext';

function NavbarUser() {
    const [isOpen, setIsOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    const { currentUser, logout, isAdmin, viewingAsUser, returnToAdminView } = useAuth();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalTickets = storedCart.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalTickets);
    }, []);

    const handleReturnToAdmin = () => {
        returnToAdminView();
        navigate('/admin');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <>
            {viewingAsUser && (
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
                            <ArrowLeftIcon className="h-4 w-4 mr-1" />
                            Return to Admin
                        </button>
                    </div>
                </div>
            )}

            <nav className="navbar bg-base-200 px-4 md:px-8 relative">
                {/* Left Section - Logo & Menu Button */}
                <div className="flex-none">
                    <button className="md:hidden btn btn-ghost btn-circle" onClick={() => setIsOpen(!isOpen)}>
                        <Bars3Icon className="h-6 w-6 text-gray-600" />
                    </button>
                    <Link to="/" className="btn btn-ghost text-xl">
                        🎟️ Bearcat Event Manager
                    </Link>
                </div>

                {/* Center Section - Search Bar */}
                <div className="flex-1 hidden md:flex justify-center px-4 max-w-2xl mx-auto">
                    <SearchBar />
                </div>

                {/* Right Section - Navigation & Profile */}
                <div className="flex-none flex items-center gap-3">
                    {currentUser ? (
                        <>
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/user-events" className="btn btn-primary">
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                    Find Events
                                </Link>
                                <Link to="/user-tickets" className="btn btn-secondary">
                                    <TicketIcon className="h-5 w-5" />
                                    My Tickets
                                </Link>
                                <Link to="/user-view-tickets" className="btn btn-accent">
                                    <ShoppingCartIcon className="h-5 w-5" />
                                    Cart
                                    {cartCount > 0 && (
                                        <span className="badge badge-sm ml-1">{cartCount}</span>
                                    )}
                                </Link>
                            </div>

                            <div className="relative md:hidden">
                                <Link to="/user-view-tickets" className="btn btn-ghost btn-circle tooltip tooltip-bottom" data-tip="View Cart">
                                    <ShoppingCartIcon className="h-6 w-6 text-gray-600" />
                                    {cartCount > 0 && (
                                        <span className="badge badge-error badge-sm absolute -top-1 -right-1">{cartCount}</span>
                                    )}
                                </Link>
                            </div>

                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    <div className="w-10 rounded-full">
                                        <img
                                            alt="User avatar"
                                            src={currentUser.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                                        />
                                    </div>
                                </div>
                                <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
                                    <li>
                                        <Link to="/user-profile" className="flex items-center gap-2">
                                            <UserCircleIcon className="h-5 w-5" />
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/user-settings" className="flex items-center gap-2">
                                            <Cog6ToothIcon className="h-5 w-5" />
                                            Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout} className="flex items-center gap-2">
                                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="btn btn-primary">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-ghost">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {currentUser && isOpen && (
                    <div className="absolute top-16 left-0 w-full bg-base-100 shadow-md md:hidden">
                        <div className="p-4 space-y-3">
                            <div className="mb-4">
                                <SearchBar />
                            </div>
                            <Link to="/user-events" className="btn btn-primary w-full flex items-center justify-center gap-2">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                                Find Events
                            </Link>
                            <Link to="/user-tickets" className="btn btn-secondary w-full flex items-center justify-center gap-2">
                                <TicketIcon className="h-5 w-5" />
                                My Tickets
                            </Link>
                            <Link to="/user-view-tickets" className="btn btn-accent w-full flex items-center justify-center gap-2">
                                <ShoppingCartIcon className="h-5 w-5" />
                                View Cart
                            </Link>
                            <div className="divider"></div>
                            <Link to="/user-profile" className="btn btn-ghost w-full justify-start">
                                <UserCircleIcon className="h-5 w-5 mr-2" />
                                Profile
                            </Link>
                            <Link to="/user-settings" className="btn btn-ghost w-full justify-start">
                                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                                Settings
                            </Link>
                            <button onClick={handleLogout} className="btn btn-ghost w-full justify-start text-error">
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}

export default NavbarUser; 