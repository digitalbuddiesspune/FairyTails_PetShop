import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initial check and subscription to updates
    useEffect(() => {
        const checkAuthAndCounts = () => {
            const token = localStorage.getItem('token');
            setIsAuthenticated(!!token);

            if (token) {
                // Fetch cart count if logged in
                fetch(`${import.meta.env.VITE_BACKEND_API}/cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setCartCount(data.data?.items?.length || 0);
                        }
                    })
                    .catch(() => setCartCount(0));
            } else {
                setCartCount(0);
            }
        };

        checkAuthAndCounts();

        const onUpdate = () => checkAuthAndCounts();
        window.addEventListener('cart-wishlist-update', onUpdate);
        // Also listen for storage events in case of logout in another tab
        window.addEventListener('storage', onUpdate);

        return () => {
            window.removeEventListener('cart-wishlist-update', onUpdate);
            window.removeEventListener('storage', onUpdate);
        };
    }, []); // Only run on mount, internal logic handles updates

    const navItems = [
        {
            name: 'Home',
            path: '/',
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-[#eab308]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Catalog',
            path: '/catalog',
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-[#eab308]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            name: 'Cart',
            path: '/cart',
            icon: (active) => (
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-[#eab308]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                            {cartCount > 9 ? '9+' : cartCount}
                        </span>
                    )}
                </div>
            )
        },
        {
            name: 'Orders',
            path: '/orders',
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-[#eab308]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        },
        {
            name: isAuthenticated ? 'Profile' : 'Log in',
            path: isAuthenticated ? '/account-settings' : '/signin',
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-[#eab308]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full py-1 ${isActive ? 'text-[#eab308]' : 'text-gray-500'}`}
                    >
                        {({ isActive }) => (
                            <>
                                {item.icon(isActive)}
                                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
