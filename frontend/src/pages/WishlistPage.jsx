import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getGuestWishlist, removeFromGuestWishlist, addToGuestCart } from '../utils/guestCart';
import { getApiBearerToken } from '../auth/session';
import ProductCard from '../components/ProductCard';
import { type } from '../styles/typography';

const PRODUCT_ENDPOINTS = [
  '/food',
  '/clothes',
  '/toys',
  '/accessories',
  '/grooming-essentials',
  '/health-supplements',
  '/houses',
];

const API_BASE = import.meta.env.VITE_BACKEND_API;

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [guestItems, setGuestItems] = useState([]);
  const [guestProducts, setGuestProducts] = useState([]);
  const [authEpoch, setAuthEpoch] = useState(0);

  useEffect(() => {
    const onAuth = () => setAuthEpoch((e) => e + 1);
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  const token = getApiBearerToken();

  // Fetch product details for guest wishlist items
  const fetchGuestWishlistProducts = async () => {
    try {
      setLoading(true);
      const guest = getGuestWishlist();
      setGuestItems(guest);
      
      if (guest.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch product details for each productId
      const productPromises = guest.map(async (item) => {
        // Extract productId - handle both string and object formats
        let productId = null;
        if (typeof item === 'string') {
          productId = item;
        } else if (item && typeof item === 'object') {
          productId = String(item._id || item.productId || '');
        }
        
        if (!productId || productId === 'undefined' || productId === 'null') {
          return null;
        }
        
        // Try each endpoint to find the product
        for (const endpoint of PRODUCT_ENDPOINTS) {
          try {
            const res = await axios.get(`${API_BASE}${endpoint}/${productId}`, { validateStatus: () => true });
            if (res.status === 200 && res.data?.success) {
              return res.data.data;
            }
          } catch (err) {
            continue;
          }
        }
        return null;
      });

      const products = (await Promise.all(productPromises)).filter(Boolean);
      setGuestProducts(products);
    } catch (err) {
      console.error('Error fetching guest wishlist products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = getApiBearerToken();
    if (!t) {
      fetchGuestWishlistProducts();
      return;
    }
    fetchWishlist();
  }, [authEpoch]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleUpdate = () => {
      const t = getApiBearerToken();
      if (!t) {
        fetchGuestWishlistProducts();
      } else {
        fetchWishlist();
      }
    };
    window.addEventListener('cart-wishlist-update', handleUpdate);
    return () => window.removeEventListener('cart-wishlist-update', handleUpdate);
  }, []);

  const fetchWishlist = async () => {
    const t = getApiBearerToken();
    if (!t) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.data.success) {
        setWishlist(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      setRemoving(productId);
      const t = getApiBearerToken();
      if (!t) {
        removeFromGuestWishlist(productId);
        await fetchGuestWishlistProducts();
      } else {
        const res = await axios.delete(`${API_BASE}/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.data.success) {
          setWishlist(res.data.data);
          window.dispatchEvent(new Event('cart-wishlist-update'));
        }
      }
    } catch (err) {
      console.error('Remove from wishlist error:', err);
    } finally {
      setRemoving(null);
    }
  };

  const addToCart = async (product) => {
    try {
      const id = product._id || product.productId;
      setAddingToCart(id);
      
      // Determine product type
      let productType = 'Food';
      for (const endpoint of PRODUCT_ENDPOINTS) {
        try {
          const res = await axios.get(`${API_BASE}${endpoint}/${id}`, { validateStatus: () => true });
          if (res.status === 200 && res.data?.success) {
            const endpointMap = {
              '/food': 'Food',
              '/clothes': 'Clothes',
              '/toys': 'Toy',
              '/accessories': 'Accessory',
              '/grooming-essentials': 'GroomingEssential',
              '/health-supplements': 'HealthSupplement',
              '/houses': 'House',
            };
            productType = endpointMap[endpoint] || 'Food';
            break;
          }
        } catch (err) {
          continue;
        }
      }
      
      const t = getApiBearerToken();
      if (!t) {
        // Guest cart
        addToGuestCart({
          productId: id,
          quantity: 1,
          selectedSize: 0,
          productType: productType,
        });
      } else {
        await axios.post(
          `${API_BASE}/cart`,
          { productId: id, quantity: 1, selectedSize: 0 },
          { headers: { Authorization: `Bearer ${t}` } }
        );
      }
      window.dispatchEvent(new Event('cart-wishlist-update'));
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAddingToCart(null);
    }
  };

  const items = token ? (wishlist?.items || []) : guestProducts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-gray-500 ${type.body}`}>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h3 className={`${type.h3} text-gray-800 mb-2`}>Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={fetchWishlist} className="bg-[#205EA9] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1d4f8f]">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className={`mb-2 text-gray-400 ${type.bodySm} flex items-center gap-2`}>
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Wishlist</span>
          </nav>
          <h1 className={`${type.h1} text-gray-900 flex items-center gap-3`}>
            <span className="text-red-500">♥</span> My Wishlist
          </h1>
          <p className={`mt-1 text-gray-500 ${type.bodySm}`}>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className={`${type.h3} text-gray-800 mb-2`}>Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Browse our collection and add products you love!</p>
              <Link to="/" className="inline-block bg-gradient-to-r from-[#205EA9] to-[#1d4f8f] text-white font-bold py-3 px-8 rounded-xl hover:from-[#1d4f8f] hover:to-[#203D5B] transition-all">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {items.map((product) => {
                if (!product) return null;
                const isRemoving = removing === product._id;

                return (
                  <div
                    key={product._id}
                    className={isRemoving ? 'opacity-50 scale-95 transition-all' : ''}
                  >
                    <ProductCard
                      product={product}
                      wishlistIds={items.map((p) => p?._id).filter(Boolean)}
                      onWishlistToggle={() => removeItem(product._id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WishlistPage;
