import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/products', label: 'Catalog', icon: CatalogIcon, isCatalog: true },
  { path: '/cart', label: 'Cart', icon: CartIcon },
  { path: '/orders', label: 'Orders', icon: OrdersIcon },
  { path: '/signin', label: 'Log in', icon: UserIcon, altPath: '/account-settings', altLabel: 'Profile' },
];

export default function MobileBottomNav({ cartCount = 0, isLoggedIn = false, onCatalogClick }) {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (item) => {
    if (item.path === '/') return pathname === '/' || pathname === '/home';
    if (item.path === '/products') return pathname === '/products' || pathname.startsWith('/category/');
    if (item.path === '/cart') return pathname === '/cart';
    if (item.path === '/orders') return pathname === '/orders' || pathname.startsWith('/order-details/');
    if (item.path === '/signin') {
      if (isLoggedIn) return pathname === '/account-settings' || pathname === '/profile';
      return pathname === '/signin' || pathname === '/signup';
    }
    return pathname.startsWith(item.path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const useAlt = item.altPath && isLoggedIn;
          const to = useAlt ? item.altPath : item.path;
          const label = useAlt ? item.altLabel : item.label;
          const active = isActive({ ...item, path: useAlt ? item.altPath : item.path });
          const isCatalogButton = item.isCatalog && onCatalogClick;

          const linkClassName = `flex flex-col items-center justify-center flex-1 gap-0.5 py-2 transition-colors min-w-0 ${
            active ? 'text-orange-500' : 'text-gray-400'
          }`;

          if (isCatalogButton) {
            return (
              <button
                key={item.path}
                type="button"
                onClick={onCatalogClick}
                className={linkClassName}
              >
                <item.icon active={active} />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.path + (useAlt ? '-alt' : '')}
              to={to}
              className={linkClassName}
            >
              {item.label === 'Cart' && cartCount > 0 ? (
                <span className="relative inline-block">
                  <item.icon active={active} />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                </span>
              ) : (
                <item.icon active={active} />
              )}
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }) {
  const color = active ? 'text-orange-500' : 'text-gray-400';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CatalogIcon({ active }) {
  const color = active ? 'text-orange-500' : 'text-gray-400';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function CartIcon({ active }) {
  const color = active ? 'text-orange-500' : 'text-gray-400';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function OrdersIcon({ active }) {
  const color = active ? 'text-orange-500' : 'text-gray-400';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function UserIcon({ active }) {
  const color = active ? 'text-orange-500' : 'text-gray-400';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
