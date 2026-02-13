import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import CatalogMenuContent from './CatalogMenuContent';

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
  // Always pass subCategory so the category page filters correctly
  return `/category/${categorySlug}?subCategory=${encodeURIComponent(subName)}`;
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalogPanelOpen, setCatalogPanelOpen] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const mobileSearchInputRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Fetch categories from backend API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_API}/categories`);
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
          fetch(`${import.meta.env.VITE_BACKEND_API}/cart`, { headers }),
          fetch(`${import.meta.env.VITE_BACKEND_API}/wishlist`, { headers }),
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
      setUserDropdownOpen(prev => !prev);
    } else {
      navigate('/signin');
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    const q = searchQuery.trim();
    if (q.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setMobileSearchExpanded(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserDropdownOpen(false);
    setCartCount(0);
    setWishlistCount(0);
    navigate('/signin');
  };

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  // Focus mobile search input when expanded
  useEffect(() => {
    if (mobileSearchExpanded && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchExpanded]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-[#a3e635] w-full">
        <div className="w-full px-4 lg:px-8 py-2">
          {/* Desktop layout */}
          <div className="hidden md:flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img 
                src={"https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288839/LOGO-2_l5wmxs.png"} 
                alt="FairyTails Pet Shop" 
                className="h-14 md:h-16 w-auto object-contain"
              />
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for pet food, toys, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white text-gray-800 focus:outline-none placeholder-gray-500"
                />
                <button type="submit" className="bg-black px-4 py-2.5 hover:bg-gray-800 transition-colors">
                  <SearchIcon />
                </button>
              </div>
            </form>

            {/* Right Icons - Desktop */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <Link to="/contact" className="hidden lg:flex items-center gap-1 text-gray-800 hover:text-black font-medium text-sm transition-colors">
                <PhoneIcon />
                <span>Contact</span>
              </Link>
              <Link to="/about" className="hidden lg:flex items-center text-gray-800 hover:text-black font-medium text-sm transition-colors">
                About
              </Link>
              <Link to="/wishlist" className="text-gray-800 hover:text-black transition-colors relative" title="Wishlist">
                <HeartIcon />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="text-gray-800 hover:text-black transition-colors relative" title="Cart">
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <div className="relative" ref={userDropdownRef}>
                <button onClick={handleProfileClick} className="text-gray-800 hover:text-black transition-colors" title="Profile">
                  <UserIcon />
                </button>
                {userDropdownOpen && localStorage.getItem('token') && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100]" style={{ animation: 'dropIn .2s ease-out' }}>
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">
                        {(() => { try { const u = JSON.parse(localStorage.getItem('user')); return `Hi, ${u?.name?.split(' ')[0] || 'User'}`; } catch { return 'Hi, User'; } })()}
                      </p>
                      <p className="text-[11px] text-gray-400">Welcome back!</p>
                    </div>
                    <button onClick={() => { setUserDropdownOpen(false); navigate('/orders'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      My Orders
                    </button>
                    <button onClick={() => { setUserDropdownOpen(false); navigate('/account-settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Account Settings
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile layout: Logo centered, Search icon right. Search bar appears below when expanded. */}
          <div className="md:hidden flex flex-col gap-2">
            {/* Top row: always visible */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-gray-800 hover:text-black hover:bg-black/5 rounded-lg transition-colors shrink-0"
                aria-label="Open menu"
              >
                <HamburgerIcon />
              </button>
              <Link to="/" className="flex-1 flex justify-center shrink-0">
                <img 
                  src={"https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288839/LOGO-2_l5wmxs.png"} 
                  alt="FairyTails Pet Shop" 
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileSearchExpanded(true)}
                className="p-2 text-gray-800 hover:text-black hover:bg-black/5 rounded-lg transition-colors shrink-0"
                aria-label="Search"
              >
                <SearchIconGray />
              </button>
            </div>
            {/* Search bar row: appears below when expanded */}
            {mobileSearchExpanded && (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 animate-slideDown">
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Search for pet food, toys, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white text-gray-800 rounded-lg focus:outline-none placeholder-gray-500 text-sm border border-gray-300"
                />
                <button type="submit" className="bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 shrink-0">
                  <SearchIcon />
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileSearchExpanded(false); setSearchQuery(''); }}
                  className="p-2.5 text-gray-800 hover:bg-black/5 rounded-lg shrink-0"
                  aria-label="Close search"
                >
                  <CloseIcon />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <nav className="bg-black text-white w-full border-b border-gray-800 relative hidden md:block">
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-[70] bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="fixed top-0 left-0 bottom-0 w-[min(320px,85vw)] z-[80] bg-white shadow-2xl md:hidden flex flex-col animate-slideInLeft overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-4 space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                Home
              </Link>
              <div className="py-2">
                <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catalog</p>
                <CatalogMenuContent
                  categories={categories}
                  getSubcategoryLink={getSubcategoryLink}
                  onSubcategoryClick={() => setMobileMenuOpen(false)}
                  onClose={() => setMobileMenuOpen(false)}
                />
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-0.5">
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                  <HeartIcon />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                  <CartIcon />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (localStorage.getItem('token')) {
                      navigate('/account-settings');
                    } else {
                      navigate('/signin');
                    }
                  }}
                  className="w-full flex items-center gap-3 py-3 px-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg text-left"
                >
                  <UserIcon />
                  <span>Account</span>
                </button>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 px-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                  <PhoneIcon />
                  Contact
                </Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                  About
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Catalog Bottom Sheet - opened from bottom nav Catalog button */}
      {catalogPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-[75] bg-black/50 md:hidden"
            onClick={() => setCatalogPanelOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-0 left-0 right-0 z-[80] bg-white rounded-t-2xl shadow-2xl md:hidden max-h-[70vh] flex flex-col animate-slideUp">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <span className="font-bold text-gray-900">Catalog</span>
              <button
                onClick={() => setCatalogPanelOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <CatalogMenuContent
                categories={categories}
                getSubcategoryLink={getSubcategoryLink}
                onSubcategoryClick={() => setCatalogPanelOpen(false)}
                onClose={() => setCatalogPanelOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation - fixed at bottom on small screens */}
      <MobileBottomNav
        cartCount={cartCount}
        isLoggedIn={!!localStorage.getItem('token')}
        onCatalogClick={() => setCatalogPanelOpen(true)}
      />
    </header>
  );
};

// Icon Components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SearchIconGray = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
