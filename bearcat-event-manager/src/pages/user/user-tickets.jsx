import { Link } from "react-router-dom";
import NavbarUser from "../../components/navbar-user";

export const testEvents = [
    { id: 1, title: "Music Fest 2025", date: "April 10, 2025", image: "https://source.unsplash.com/400x300/?concert" },
    { id: 2, title: "Tech Conference", date: "May 15, 2025", image: "https://source.unsplash.com/400x300/?technology" },
    { id: 3, title: "Art Expo", date: "June 20, 2025", image: "https://source.unsplash.com/400x300/?art" },
    { id: 4, title: "Food Carnival", date: "July 5, 2025", image: "https://source.unsplash.com/400x300/?food" },
    { id: 5, title: "Sports Championship", date: "August 18, 2025", image: "https://source.unsplash.com/400x300/?sports" },
    { id: 6, title: "Film Festival", date: "September 12, 2025", image: "https://source.unsplash.com/400x300/?movie" },
    { id: 7, title: "Gaming Expo", date: "October 30, 2025", image: "https://source.unsplash.com/400x300/?gaming" },
    { id: 8, title: "Fashion Show", date: "November 22, 2025", image: "https://source.unsplash.com/400x300/?fashion" },
    { id: 9, title: "Comedy Night", date: "December 10, 2025", image: "https://source.unsplash.com/400x300/?comedy" },
    { id: 10, title: "New Year's Bash", date: "December 31, 2025", image: "./paw.png" }
];

function Tickets() {
    return (
        <>
            <NavbarUser />
            <div className="p-8">
                <h1 className="text-4xl font-bold text-center mb-8">Events</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {testEvents.map(event => (
                        <Link key={event.id} to={`/user-tickets/${event.id}`} className="relative block group">
                            <div
                                className="h-56 rounded-lg bg-cover bg-center shadow-lg transition-opacity duration-300 group-hover:opacity-80"
                                style={{ backgroundImage: `url(${event.image})` }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-end p-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">{event.title}</h2>
                                        <p className="text-sm text-gray-300">{event.date}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Tickets;
