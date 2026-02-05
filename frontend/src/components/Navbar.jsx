import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const ChevronDownIcon = ({ isOpen }) => {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
};


  const categories = [
    { name: 'Toys', hasDropdown: true },
    { name: 'Clothes', hasDropdown: true },
    { name: 'House', hasDropdown: true },
    { name: 'Petscare', hasDropdown: true },
    { name: 'Pet Food', hasDropdown: true },
    {name:"Belt",hasDropdown:true}
  ];

  const handleCategoryClick = (index) => {
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate to signin page
    navigate('/signin');
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-[#D6EFD8] w-full">
        <div className="w-full px-4 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center shrink-0">
              <img 
                src={"https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288839/LOGO-2_l5wmxs.png"} 
                alt="FairyTails Pet Shop" 
                className="h-14 md:h-16 w-auto object-contain"
              />
            </a>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for pet food, toys, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white text-gray-800 focus:outline-none placeholder-gray-500"
                />
                <button className="bg-black px-4 py-2.5 hover:bg-gray-800 transition-colors">
                  <SearchIcon />
                </button>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Location - Only Icon */}
              <button className="text-gray-700 hover:text-[#65a30d] transition-colors" title="Location">
                <LocationIcon />
              </button>

              {/* Cart */}
              <button className="text-gray-700 hover:text-[#65a30d] transition-colors" title="Cart">
                <CartIcon />
              </button>

              {/* Profile */}
              <button className="text-gray-700 hover:text-[#65a30d] transition-colors" title="Profile">
                <UserIcon />
              </button>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-black hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
              >
                <LogoutIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-black text-white w-full border-b border-gray-800">
        <div className="w-full px-4 lg:px-8">
          <ul className="flex items-center justify-center gap-1">
            {categories.map((category, index) => (
              <li key={index} className="relative">
                <button
                  onClick={() => handleCategoryClick(index)}
                  className="flex items-center gap-1 px-6 py-3 text-sm font-medium text-white hover:text-white hover:bg-gray-900 transition-colors whitespace-nowrap"
                >
                  {category.name}
                  <ChevronDownIcon isOpen={activeDropdown === index} />
                </button>

                {activeDropdown === index && (
                  <div className="absolute left-0 mt-0 bg-white text-gray-800 rounded-b-lg shadow-xl py-2 min-w-[180px] z-[60] border border-gray-100">
                    <a
                      href={`#${category.name.toLowerCase()}-dogs`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#D6EFD8] transition-colors"
                    >
                      <span className="text-xl">🐕</span>
                      <span className="font-medium">Dogs</span>
                    </a>

                    <a
                      href={`#${category.name.toLowerCase()}-cats`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#D6EFD8] transition-colors"
                    >
                      <span className="text-xl">🐱</span>
                      <span className="font-medium">Cats</span>
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Click outside to close dropdown */}
      {activeDropdown !== null && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </header>
  );
};

// Icon Components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);


export default Navbar;
