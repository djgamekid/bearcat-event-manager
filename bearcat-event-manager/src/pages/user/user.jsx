import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import NavbarUser from "../../components/navbar-user";

function User() {
    const featuredEvents = [
        { id: 1, title: "Music Festival", date: "April 15, 2025", img: "./paw.png" },
        { id: 2, title: "Tech Conference", date: "May 20, 2025", img: "./paw.png" },
        { id: 3, title: "Art Exhibition", date: "June 5, 2025", img: "./paw.png" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredEvents.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [featuredEvents.length]);

    return (
        <div className="min-h-screen flex flex-col">
            <NavbarUser />

            {/* Featured Events Carousel */}
            <div className="relative w-full h-96 bg-gray-200 overflow-hidden">
                {featuredEvents.map((event, index) => (
                    <div
                        key={event.id}
                        className={`absolute w-full h-full flex items-center justify-center transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
                        <div className="absolute bg-black bg-opacity-50 text-white p-4 rounded">
                            <h2 className="text-2xl font-bold">{event.title}</h2>
                            <p className="text-lg">{event.date}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <footer className="bg-base-200 p-4 mt-auto text-center relative">
                <p>© {new Date().getFullYear()} EventFinder. All rights reserved.</p>
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="absolute right-4 bottom-4 btn btn-circle btn-primary"
                >
                    <ChevronUpIcon className="w-6 h-6" />
                </button>
            </footer>
        </div>
    );
}

export default User;
