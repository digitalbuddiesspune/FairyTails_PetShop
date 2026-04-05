import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getGuestWishlist, removeFromGuestWishlist, addToGuestCart } from '../utils/guestCart';
import { getApiBearerToken } from '../auth/session';

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
          <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={fetchWishlist} className="bg-[#65a30d] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#4d7c0f]">
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
        <div className="container mx-auto px-4 py-6">
          <nav className="mb-2 text-gray-400 text-sm flex items-center gap-2">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Wishlist</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-red-500">♥</span> My Wishlist
          </h1>
          <p className="mt-1 text-gray-500 text-sm">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Browse our collection and add products you love!</p>
              <Link to="/" className="inline-block bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white font-bold py-3 px-8 rounded-xl hover:from-[#4d7c0f] hover:to-[#3f6212] transition-all">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {items.map((product) => {
                if (!product) return null;
                const startingPrice = product.prices?.reduce(
                  (min, p) => (p.discountedPrice < min.discountedPrice ? p : min),
                  product.prices[0]
                );
                const discountPercent = startingPrice
                  ? Math.round(((startingPrice.mrp - startingPrice.discountedPrice) / startingPrice.mrp) * 100)
                  : 0;
                const isRemoving = removing === product._id;
                const isAdding = addingToCart === product._id;

                return (
                  <div
                    key={product._id}
                    className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 min-w-0 ${isRemoving ? 'opacity-50 scale-95' : ''}`}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden bg-gray-50">
                      <Link to={`/product/${product._id}`}>
                        <div className="aspect-square flex items-center justify-center p-2 sm:p-4">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.productName}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🐾</div>
                          )}
                        </div>
                      </Link>

                      {discountPercent > 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          {discountPercent}% OFF
                        </span>
                      )}

                      {/* Remove from Wishlist */}
                      <button
                        onClick={() => removeItem(product._id)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                        title="Remove from Wishlist"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      <p className="text-xs font-semibold text-[#65a30d] uppercase tracking-wide mb-1">{product.brand}</p>
                      <Link to={`/product/${product._id}`}>
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight mb-2 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hover:text-[#65a30d] transition-colors">
                          {product.productName}
                        </h3>
                      </Link>

                      <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full mb-3">
                        {product.subCategory}
                      </span>

                      {startingPrice && (
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-base sm:text-xl font-bold text-gray-900">₹{startingPrice.discountedPrice}</span>
                          {startingPrice.mrp > startingPrice.discountedPrice && (
                            <span className="text-sm text-gray-400 line-through">₹{startingPrice.mrp}</span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(product._id)}
                          disabled={isAdding}
                          className="flex-1 bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white font-semibold py-2.5 rounded-xl hover:from-[#4d7c0f] hover:to-[#3f6212] active:scale-[0.98] transition-all text-sm disabled:opacity-50"
                        >
                          {isAdding ? 'Adding...' : '🛒 Add to Cart'}
                        </button>
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="px-4 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-all text-sm border border-gray-200"
                        >
                          View
                        </button>
                      </div>
                    </div>
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
