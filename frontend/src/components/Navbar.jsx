import { useState } from 'react';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const categories = [
    { name: 'Cats', hasDropdown: true },
    { name: 'Dogs', hasDropdown: true },
    { name: 'Small Pets', hasDropdown: false },
    { name: 'Pet Food', hasDropdown: true },
    { name: 'Accessories', hasDropdown: true },
    { name: 'Health & Wellness', hasDropdown: true },
    { name: 'Grooming', hasDropdown: false },
    { name: 'Consult a Vet', hasDropdown: false },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-3xl">🧚</span>
              <span className="text-2xl font-bold text-[#a3e635]">
                fairy<span className="text-white">tails</span>
              </span>
            </a>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search for pet food, toys, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-l-md text-gray-800 focus:outline-none"
                />
                <button className="bg-[#a3e635] px-4 py-2.5 rounded-r-md hover:bg-[#84cc16] transition-colors">
                  <SearchIcon />
                </button>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Location */}
              <button className="hidden md:flex items-center gap-2 text-sm hover:text-[#a3e635] transition-colors">
                <LocationIcon />
                <span className="hidden lg:inline">Detect location</span>
              </button>

              {/* Phone */}
              <a href="tel:+919876543210" className="hover:text-[#a3e635] transition-colors">
                <PhoneIcon />
              </a>

              {/* User */}
              <button className="hover:text-[#a3e635] transition-colors">
                <UserIcon />
              </button>

              {/* Cart */}
              <button className="relative hover:text-[#a3e635] transition-colors">
                <CartIcon />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#2d2d2d] text-white">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.map((category, index) => (
              <li
                key={index}
                className="relative"
                onMouseEnter={() => category.hasDropdown && setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={`#${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-medium hover:text-[#a3e635] transition-colors whitespace-nowrap"
                >
                  {category.name}
                  {category.hasDropdown && <ChevronDownIcon />}
                </a>
                
                {/* Dropdown placeholder */}
                {category.hasDropdown && activeDropdown === index && (
                  <div className="absolute top-full left-0 bg-white text-gray-800 rounded-md shadow-lg py-2 min-w-[200px] z-50">
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">View All {category.name}</a>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">Popular Items</a>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">New Arrivals</a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

// Icon Components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default Navbar;
