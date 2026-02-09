import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Icon mapping for subcategory names in the dropdown
// Items with a `src` key render as images; others render as emoji text
const subIconMap = {
  'Dry Food': '🥫', 'Wet Food': '🍖', 'Dog Clothes': '👕', 'Cat Clothes': '👗',
  'Treats': '🦴',
  'Dogs': { src: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg', alt: 'Dogs' },
  'Cats': { src: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg', alt: 'Cats' },
};

// Helper to render a subcategory icon (image or emoji)
const SubIcon = ({ name }) => {
  const icon = subIconMap[name];
  if (icon && typeof icon === 'object' && icon.src) {
    return <img src={icon.src} alt={icon.alt || name} className="w-6 h-6 object-contain" />;
  }
  return <span className="text-xl">{icon || '📦'}</span>;
};

// Map category slug → Food model category value for product links
const slugToFoodCategory = {
  'dogs': 'Dog',
  'cats': 'Cat',
};

// SubCategory names that exist in the Food collection
const foodSubCategories = ['Dry Food', 'Wet Food', 'Treats'];

// Build the product link for a subcategory
const getSubcategoryLink = (categorySlug, subName) => {
  const foodCategory = slugToFoodCategory[categorySlug];
  if (foodCategory && foodSubCategories.includes(subName)) {
    return `/products?category=${foodCategory}&subCategory=${encodeURIComponent(subName)}`;
  }
  // For non-food subcategories, link to the category page
  return `/category/${categorySlug}`;
};

// Dropdown component rendered outside overflow container
const DropdownMenu = ({ category, index, onClose }) => {
  const [position, setPosition] = useState({ left: 0 });

  useEffect(() => {
    const btn = document.querySelector(`[data-idx="${index}"]`);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const navRect = btn.closest('nav').getBoundingClientRect();
      setPosition({ left: rect.left - navRect.left });
    }
  }, [index]);

  return (
    <div
      className="absolute top-full bg-white text-gray-800 rounded-b-lg shadow-xl py-2 min-w-[220px] z-[60] border border-gray-100"
      style={{ left: position.left }}
    >
      {category.subcategories.map((sub, subIdx) => (
        <div key={subIdx}>
          <Link
            to={getSubcategoryLink(category.slug, sub.name)}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#D6EFD8] transition-colors"
          >
            <SubIcon name={sub.name} />
            <span className="font-medium">{sub.name}</span>
          </Link>
          {/* Sub-subcategories (e.g., Treats -> Dental, Biscuits, Healthy) */}
          {sub.subSubCategories?.length > 0 && (
            <div className="pl-12 pb-1">
              {sub.subSubCategories.map((subSub, ssIdx) => (
                <Link
                  key={ssIdx}
                  to={getSubcategoryLink(category.slug, sub.name)}
                  onClick={onClose}
                  className="block px-3 py-1.5 text-sm text-gray-500 hover:text-[#65a30d] transition-colors"
                >
                  {subSub}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch categories from backend API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/categories');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch cart & wishlist counts for logged-in users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const fetchCounts = async () => {
      try {
        const [cartRes, wishRes] = await Promise.all([
          fetch('http://localhost:3000/api/cart', { headers }),
          fetch('http://localhost:3000/api/wishlist', { headers }),
        ]);
        const cartData = await cartRes.json();
        const wishData = await wishRes.json();
        if (cartData.success) setCartCount(cartData.data?.items?.length || 0);
        if (wishData.success) setWishlistCount(wishData.data?.items?.length || 0);
      } catch (err) {
        // silently fail
      }
    };
    fetchCounts();

    // Re-check counts when the page regains focus (e.g. after adding to cart)
    const onFocus = () => fetchCounts();
    window.addEventListener('focus', onFocus);
    // Listen to a custom event for instant updates from same tab
    const onCountUpdate = () => fetchCounts();
    window.addEventListener('cart-wishlist-update', onCountUpdate);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('cart-wishlist-update', onCountUpdate);
    };
  }, []);

  const handleCategoryClick = (index, slug) => {
    // Toggle dropdown
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
    // Navigate to category page without closing dropdown
    // Use setTimeout so dropdown state is applied before navigation re-render
    setTimeout(() => {
      navigate(`/category/${slug}`);
    }, 0);
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

              {/* About Us - text only, no icon */}
              <Link 
                to="/about" 
                className="hidden lg:flex items-center text-gray-800 hover:text-black font-medium text-sm transition-colors"
              >
                About
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="text-gray-800 hover:text-black transition-colors relative" title="Wishlist">
                <HeartIcon />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="text-gray-800 hover:text-black transition-colors relative" title="Cart">
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

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

      <nav className="bg-black text-white w-full border-b border-gray-800 relative">
        <div className="w-full px-4 lg:px-8">
          <ul className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.map((category, index) => (
              <li key={category._id || index} className="relative" data-idx={index}>
                <button
                  onClick={() => handleCategoryClick(index, category.slug)}
                  className="flex items-center gap-1 px-4 md:px-6 py-3 text-sm font-medium text-white hover:text-[#a3e635] hover:bg-gray-900 transition-colors whitespace-nowrap"
                >
                  {category.name}
                  {category.subcategories?.length > 0 && (
                    <ChevronDownIcon isOpen={activeDropdown === index} />
                  )}
                </button>
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

        {/* Dropdown rendered OUTSIDE the overflow container */}
        {activeDropdown !== null && categories[activeDropdown]?.subcategories?.length > 0 && (
          <DropdownMenu 
            category={categories[activeDropdown]} 
            index={activeDropdown}
            onClose={() => setActiveDropdown(null)}
          />
        )}
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

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
