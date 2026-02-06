import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const categories = [
    { name: 'Toys', hasDropdown: true },
    { name: 'Clothes', hasDropdown: true },
    { name: 'House', hasDropdown: true },
    { name: 'Petscare', hasDropdown: true },
    { name: 'Pet Food', hasDropdown: true },
  ];

  const handleCategoryClick = (index) => {
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
  };

  const handleProfileClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/profile');
    } else {
      navigate('/signin');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-[#a3e635] w-full">
        <div className="w-full px-4 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img 
                src={"https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288839/LOGO-2_l5wmxs.png"} 
                alt="FairyTails Pet Shop" 
                className="h-14 md:h-16 w-auto object-contain"
              />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl hidden md:block">
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
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              {/* Contact Us */}
              <Link 
                to="/contact" 
                className="hidden lg:flex items-center gap-1 text-gray-800 hover:text-black font-medium text-sm transition-colors"
              >
                <PhoneIcon />
                <span>Contact</span>
              </Link>

              {/* About Us */}
              <Link 
                to="/about" 
                className="hidden lg:flex items-center gap-1 text-gray-800 hover:text-black font-medium text-sm transition-colors"
              >
                <InfoIcon />
                <span>About</span>
              </Link>

              {/* Location */}
              <button className="text-gray-800 hover:text-black transition-colors" title="Location">
                <LocationIcon />
              </button>

              {/* Cart */}
              <button className="text-gray-800 hover:text-black transition-colors" title="Cart">
                <CartIcon />
              </button>

              {/* Profile */}
              <button 
                onClick={handleProfileClick}
                className="text-gray-800 hover:text-black transition-colors" 
                title="Profile"
              >
                <UserIcon />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-2">
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white text-gray-800 focus:outline-none placeholder-gray-500 text-sm"
              />
              <button className="bg-black px-3 py-2 hover:bg-gray-800 transition-colors">
                <SearchIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-black text-white w-full border-b border-gray-800">
        <div className="w-full px-4 lg:px-8">
          <ul className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.map((category, index) => (
              <li key={index} className="relative">
                <button
                  onClick={() => handleCategoryClick(index)}
                  className="flex items-center gap-1 px-4 md:px-6 py-3 text-sm font-medium text-white hover:text-[#a3e635] hover:bg-gray-900 transition-colors whitespace-nowrap"
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
            
            {/* Mobile Contact & About */}
            <li className="lg:hidden">
              <Link to="/contact" className="px-4 py-3 text-sm font-medium text-white hover:text-[#a3e635] whitespace-nowrap block">
                Contact
              </Link>
            </li>
            <li className="lg:hidden">
              <Link to="/about" className="px-4 py-3 text-sm font-medium text-white hover:text-[#a3e635] whitespace-nowrap block">
                About
              </Link>
            </li>
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

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDownIcon = ({ isOpen }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={`h-4 w-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default Navbar;
