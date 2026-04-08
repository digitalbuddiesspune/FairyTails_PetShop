import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart, getGuestCartCount } from '../utils/guestCart';
import { getApiBearerToken } from '../auth/session';
import LoginRequiredModal from '../components/LoginRequiredModal';

const API_BASE = import.meta.env.VITE_BACKEND_API;

// ─── Helper: extract pricing from any product type ───────────────────────────
const getItemPricing = (item) => {
  const product = item.product;
  if (!product) return { mrp: 0, discountedPrice: 0, label: '' };

  // Food: prices[] → { capacity, mrp, discountedPrice }
  if (product.prices?.length > 0) {
    const p = product.prices[item.selectedSize] || product.prices[0];
    return { mrp: p.mrp, discountedPrice: p.discountedPrice, label: p.capacity || '' };
  }

  // Clothes / Accessories: sizes[] → { size, mrp, discountedPrice, availableStock }
  if (product.sizes?.length > 0) {
    const s = product.sizes[item.selectedSize] || product.sizes[0];
    return { mrp: s.mrp, discountedPrice: s.discountedPrice, label: s.size || '' };
  }

  // Grooming Essentials: variants[] → { volume, mrp, discountedPrice }
  if (product.variants?.length > 0) {
    const v = product.variants[item.selectedSize] || product.variants[0];
    return { mrp: v.mrp, discountedPrice: v.discountedPrice, label: v.volume || '' };
  }

  // Flat price: Toy (price, discountedPrice), House/HealthSupplement (price, discountPrice)
  const mrp = product.price || 0;
  const discountedPrice = product.discountedPrice || product.discountPrice || mrp;
  return { mrp, discountedPrice, label: product.size || '' };
};

// ─── Helper: get display name ───────────────────────────────────────────────
const getDisplayName = (product) => product?.productName || product?.name || 'Unnamed Product';

// ─── Helper: get first image ────────────────────────────────────────────────
const getDisplayImage = (product) => product?.images?.[0] || product?.image || null;

// ─── Helper: product type label for badge ───────────────────────────────────
const TYPE_BADGES = {
  Food: { label: 'Food', color: 'bg-[#203D5B]/10 text-[#203D5B] border-[#203D5B]/20' },
  Clothes: { label: 'Clothes', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  Toy: { label: 'Toy', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  House: { label: 'House', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  Accessory: { label: 'Accessory', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  GroomingEssential: { label: 'Grooming', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  HealthSupplement: { label: 'Health', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // itemId being updated
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guestCart, setGuestCart] = useState([]);
  const [guestCartProducts, setGuestCartProducts] = useState([]);
  const [authEpoch, setAuthEpoch] = useState(0);

  useEffect(() => {
    const onAuth = () => setAuthEpoch((e) => e + 1);
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  const token = getApiBearerToken();

  // Map productType to API endpoint
  const PRODUCT_TYPE_TO_ENDPOINT = {
    'Food': '/food',
    'Clothes': '/clothes',
    'Toy': '/toys',
    'Accessory': '/accessories',
    'GroomingEssential': '/grooming-essentials',
    'HealthSupplement': '/health-supplements',
    'House': '/houses',
  };

  // Fetch product details for guest cart items
  const fetchGuestCartProducts = async () => {
    try {
      setLoading(true);
      const guest = getGuestCart();
      setGuestCart(guest);
      
      if (guest.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch product details for each item
      const productPromises = guest.map(async (item) => {
        try {
          // Ensure productId is a string
          const productId = String(item.productId || item._id || '');
          if (!productId || productId === 'undefined' || productId === 'null') {
            return null;
          }
          
          const endpoint = PRODUCT_TYPE_TO_ENDPOINT[item.productType] || '/food';
          const res = await axios.get(`${API_BASE}${endpoint}/${productId}`, { validateStatus: () => true });
          if (res.status === 200 && res.data?.success) {
            return {
              _id: productId,
              quantity: item.quantity,
              selectedSize: item.selectedSize || 0,
              productType: item.productType,
              product: res.data.data,
            };
          }
          return null;
        } catch (err) {
          console.error('Error fetching product:', err);
          return null;
        }
      });

      const products = (await Promise.all(productPromises)).filter(Boolean);
      setGuestCartProducts(products);
    } catch (err) {
      console.error('Error fetching guest cart products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = getApiBearerToken();
    if (!t) {
      fetchGuestCartProducts();
      return;
    }
    fetchCart();
  }, [authEpoch]);

  // Listen for cart updates
  useEffect(() => {
    const handleUpdate = () => {
      const t = getApiBearerToken();
      if (!t) {
        fetchGuestCartProducts();
      } else {
        fetchCart();
      }
    };
    window.addEventListener('cart-wishlist-update', handleUpdate);
    return () => window.removeEventListener('cart-wishlist-update', handleUpdate);
  }, []);

  const fetchCart = async () => {
    const t = getApiBearerToken();
    if (!t) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/cart`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      setUpdating(itemId);
      const t = getApiBearerToken();
      if (!t) {
        updateGuestCartItem(itemId, newQuantity);
        await fetchGuestCartProducts();
      } else {
        const res = await axios.put(
          `${API_BASE}/cart/${itemId}`,
          { quantity: newQuantity },
          { headers: { Authorization: `Bearer ${t}` } }
        );
        if (res.data.success) {
          setCart(res.data.data);
          window.dispatchEvent(new Event('cart-wishlist-update'));
        }
      }
    } catch (err) {
      console.error('Update cart error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(itemId);
      const t = getApiBearerToken();
      if (!t) {
        removeFromGuestCart(itemId);
        await fetchGuestCartProducts();
      } else {
        const res = await axios.delete(`${API_BASE}/cart/${itemId}`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.data.success) {
          setCart(res.data.data);
          window.dispatchEvent(new Event('cart-wishlist-update'));
        }
      }
    } catch (err) {
      console.error('Remove item error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      const t = getApiBearerToken();
      if (!t) {
        clearGuestCart();
        setGuestCart([]);
        setGuestCartProducts([]);
      } else {
        const res = await axios.delete(`${API_BASE}/cart`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.data.success) {
          setCart(res.data.data);
          window.dispatchEvent(new Event('cart-wishlist-update'));
        }
      }
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  // Build a unified cartItems array from backend cart or guest cart
  const cartItems = token ? (cart?.items || []) : guestCartProducts;

  // Calculate totals using the universal pricing helper
  const subtotal = cartItems.reduce((sum, item) => {
    const pricing = getItemPricing(item);
    return sum + pricing.discountedPrice * item.quantity;
  }, 0);
  const mrpTotal = cartItems.reduce((sum, item) => {
    const pricing = getItemPricing(item);
    return sum + pricing.mrp * item.quantity;
  }, 0);
  const savings = mrpTotal - subtotal;
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryCharge; // GST is already included in subtotal


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#203D5B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading your cart...</p>
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
          <button onClick={fetchCart} className="bg-[#203D5B] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1a3149]">
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
            <span className="text-gray-900 font-medium">Cart</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            Shopping Cart
          </h1>
          <p className="mt-1 text-gray-500 text-sm">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Start adding products for your beloved pets!</p>
              <Link to="/" className="inline-block bg-gradient-to-r from-[#203D5B] to-[#1a3149] text-white font-bold py-3 px-8 rounded-xl hover:from-[#1a3149] hover:to-[#152639] transition-all">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const product = item.product;
                    if (!product) return null;
                    const pricing = getItemPricing(item);
                    const isUpdating = updating === item._id;
                    const displayName = getDisplayName(product);
                    const displayImage = getDisplayImage(product);
                    const badge = TYPE_BADGES[item.productType] || TYPE_BADGES.Food;

                    return (
                      <div
                        key={item._id}
                        className={`bg-white rounded-2xl border border-gray-100 p-4 md:p-6 flex gap-4 md:gap-6 shadow-sm transition-opacity ${isUpdating ? 'opacity-50' : ''}`}
                      >
                        {/* Product Image */}
                        <Link to={`/product/${product._id}`} className="shrink-0">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-50">
                            {displayImage ? (
                              <img src={displayImage} alt={displayName} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🐾</div>
                            )}
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                {product.brand && (
                                  <p className="text-xs font-semibold text-[#203D5B] uppercase tracking-wide">{product.brand}</p>
                                )}
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <Link to={`/product/${product._id}`}>
                                <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight hover:text-[#203D5B] transition-colors line-clamp-2">
                                  {displayName}
                                </h3>
                              </Link>
                              {pricing.label && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {product.prices ? 'Size' : product.sizes ? 'Size' : product.variants ? 'Volume' : 'Size'}: {pricing.label}
                                </p>
                              )}
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item._id)}
                              className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {/* Price & Quantity */}
                          <div className="flex items-end justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={isUpdating}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={isUpdating}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                ₹{(pricing.discountedPrice * item.quantity).toLocaleString()}
                              </p>
                              {pricing.mrp > pricing.discountedPrice && (
                                <p className="text-xs text-gray-400 line-through">
                                  ₹{(pricing.mrp * item.quantity).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-96">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h3>

                  <div className="space-y-3 text-sm">
                    
                    {savings > 0 && (
                      <div className="flex justify-between text-[#203D5B]">
                        <span>Discount</span>
                        <span>- ₹{savings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>18% GST</span>
                      <span className="text-gray-500 text-xs">Included</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Charges</span>
                      <div className="flex items-center gap-2">
                        {subtotal >= 500 ? (
                          <>
                            <span className="text-gray-400 line-through text-xs">₹50</span>
                            <span className="text-blue-600 font-medium">Free</span>
                          </>
                        ) : (
                          <span>₹{deliveryCharge}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                    {savings > 0 && (
                      <p className="text-xs text-[#203D5B] mt-1">You're saving ₹{savings.toLocaleString()} on this order!</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!token) {
                        setShowLoginModal(true);
                      } else {
                        navigate('/checkout');
                      }
                    }}
                    className="w-full mt-6 bg-[#2f5a87] text-white font-bold py-3.5 rounded-xl hover:from-[#5ba8d4] hover:to-[#4a8bb8] active:scale-[0.98] transition-all text-sm"
                  >
                    Proceed to Checkout
                  </button>

                  <Link
                    to="/"
                    className="block w-full mt-3 text-center text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="You are not logged in. Please log in first to proceed to checkout."
      />
    </div>
  );
};

export default CartPage;
