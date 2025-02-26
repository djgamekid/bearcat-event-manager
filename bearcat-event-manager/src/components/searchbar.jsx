import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

function SearchBar() {
  return (
    <div className="flex items-center w-full max-w-md border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
      {/* Magnifying Glass Icon */}
      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        className="flex-1 bg-transparent border-none outline-none pl-2 text-gray-700 placeholder-gray-400"
      />
    </div>
  );
}

export default SearchBar;
