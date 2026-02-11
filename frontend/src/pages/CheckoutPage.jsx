import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

// ─── Pricing helpers (same as CartPage) ──────────────────────────────────────
const getItemPricing = (item) => {
  const product = item.product;
  if (!product) return { mrp: 0, discountedPrice: 0 };
  if (product.prices?.length > 0) { const p = product.prices[item.selectedSize] || product.prices[0]; return { mrp: p.mrp, discountedPrice: p.discountedPrice }; }
  if (product.sizes?.length > 0) { const s = product.sizes[item.selectedSize] || product.sizes[0]; return { mrp: s.mrp, discountedPrice: s.discountedPrice }; }
  if (product.variants?.length > 0) { const v = product.variants[item.selectedSize] || product.variants[0]; return { mrp: v.mrp, discountedPrice: v.discountedPrice }; }
  const mrp = product.price || 0;
  return { mrp, discountedPrice: product.discountedPrice || product.discountPrice || mrp };
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useSaved, setUseSaved] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Use ref for form values to avoid full-page re-renders on every keystroke
  const formRef = useRef({
    addressType: 'home',
    firstName: '',
    lastName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cash_on_delivery',
  });

  // Only these two need visual re-render (toggle buttons / radio cards)
  const [addressType, setAddressType] = useState('home');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  // Fetch cart + saved addresses
  useEffect(() => {
    if (!token) { navigate('/signin'); return; }
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cartRes, addrRes] = await Promise.all([
          axios.get(`${API_BASE}/cart`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/addresses`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (cartRes.data.success) setCart(cartRes.data.data);
        if (addrRes.data.success && addrRes.data.data.length > 0) {
          setSavedAddresses(addrRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  // DOM refs for text inputs so we can set values without re-rendering
  const inputRefs = useRef({});

  // Select a saved address → populate form + DOM inputs
  const selectSavedAddress = (addr) => {
    setUseSaved(addr._id);
    const updated = {
      addressType: addr.addressType,
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      paymentMethod: paymentMethod,
    };
    formRef.current = updated;
    setAddressType(addr.addressType);
    // Push values into DOM inputs
    Object.entries(updated).forEach(([k, v]) => {
      if (inputRefs.current[k]) inputRefs.current[k].value = v;
    });
    setErrors({});
  };

  // For text inputs — write directly to ref (no re-render)
  const setField = useCallback((field, value) => {
    formRef.current[field] = value;
    // Clear single error without full re-render (only if currently showing one)
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // For toggle/radio fields that need visual update
  const setToggle = useCallback((field, value) => {
    formRef.current[field] = value;
    if (field === 'addressType') setAddressType(value);
    if (field === 'paymentMethod') setPaymentMethod(value);
  }, []);

  // ─── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const f = formRef.current;
    const e = {};
    if (!f.firstName || f.firstName.trim().length < 3) e.firstName = 'First name must be at least 3 characters';
    if (!f.lastName || f.lastName.trim().length < 1) e.lastName = 'Last name is required';
    if (!f.phone || !/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit Indian phone number';
    if (!f.streetAddress?.trim()) e.streetAddress = 'Street address is required';
    if (!f.city?.trim()) e.city = 'City is required';
    if (!f.state?.trim()) e.state = 'State is required';
    if (!f.pincode || !/^[1-9][0-9]{5}$/.test(f.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    if (!f.paymentMethod) e.paymentMethod = 'Select a payment method';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!validate()) return;

    const f = formRef.current;

    if (f.paymentMethod !== 'cash_on_delivery') {
      setServerError('Only Cash on Delivery is available right now.');
      return;
    }

    try {
      setSubmitting(true);
      setServerError('');

      // Save address (backend skips if duplicate)
      await axios.post(`${API_BASE}/addresses`, f, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Place order
      const { addressType: at, firstName, lastName, phone, streetAddress, city, state, pincode } = f;
      const orderRes = await axios.post(
        `${API_BASE}/orders`,
        {
          shippingAddress: { addressType: at, firstName, lastName, phone, streetAddress, city, state, pincode },
          paymentMethod: f.paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (orderRes.data.success) {
        // Update cart badge in navbar
        window.dispatchEvent(new Event('cart-wishlist-update'));
        // Show success popup
        setOrderSuccess(true);
        // Redirect to orders page after 2.5 seconds
        setTimeout(() => navigate('/orders'), 2500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Cart totals ───────────────────────────────────────────────────────────
  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((s, i) => s + getItemPricing(i).discountedPrice * i.quantity, 0);
  const mrpTotal = cartItems.reduce((s, i) => s + getItemPricing(i).mrp * i.quantity, 0);
  const savings = mrpTotal - subtotal;
  const delivery = subtotal >= 500 ? 0 : 50;
  const total = subtotal + delivery;

  // ─── States ────────────────────────────────────────────────────────────────
  if (!token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products before checking out.</p>
          <Link to="/" className="inline-block bg-[#65a30d] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#4d7c0f] transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ─── Helper: field wrapper ─────────────────────────────────────────────────
  const Field = ({ label, error, children, className = '' }) => (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
      errors[field]
        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-gray-200 bg-white focus:border-[#65a30d] focus:ring-2 focus:ring-[#65a30d]/10'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] py-8">
        <div className="container mx-auto px-4">
          <nav className="mb-3 text-white/60 text-sm flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-white transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-white font-medium">Checkout</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white">📦 Checkout</h1>
          <p className="mt-1 text-white/70">Enter your delivery address to complete the order</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ─── LEFT: Address Form ───────────────────────────────────── */}
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">

                {serverError && (
                  <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm">
                    {serverError}
                  </div>
                )}

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Saved Addresses</h3>
                    <div className="space-y-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr._id}
                          type="button"
                          onClick={() => selectSavedAddress(addr)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            useSaved === addr._id
                              ? 'border-[#65a30d] bg-[#65a30d]/5'
                              : 'border-gray-100 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              addr.addressType === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>{addr.addressType}</span>
                            <span className="font-semibold text-gray-900 text-sm">{addr.firstName} {addr.lastName}</span>
                          </div>
                          <p className="text-sm text-gray-600">{addr.streetAddress}, {addr.city}, {addr.state} — {addr.pincode}</p>
                          <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUseSaved(null);
                        const blank = { addressType: 'home', firstName: '', lastName: '', phone: '', streetAddress: '', city: '', state: '', pincode: '', paymentMethod: paymentMethod };
                        formRef.current = blank;
                        setAddressType('home');
                        Object.keys(blank).forEach((k) => { if (inputRefs.current[k]) inputRefs.current[k].value = ''; });
                      }}
                      className="mt-3 text-sm text-[#65a30d] hover:text-[#4d7c0f] font-medium"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* Address Type */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>

                  <div className="flex gap-3 mb-5">
                    {['home', 'office'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setToggle('addressType', t)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          addressType === t
                            ? 'border-[#65a30d] bg-[#65a30d]/5 text-[#65a30d]'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {t === 'home' ? '🏠' : '🏢'} {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="First Name *" error={errors.firstName}>
                      <input ref={(el) => (inputRefs.current.firstName = el)} className={inputClass('firstName')} defaultValue={formRef.current.firstName} onChange={(e) => setField('firstName', e.target.value)} placeholder="John" />
                    </Field>
                    <Field label="Last Name *" error={errors.lastName}>
                      <input ref={(el) => (inputRefs.current.lastName = el)} className={inputClass('lastName')} defaultValue={formRef.current.lastName} onChange={(e) => setField('lastName', e.target.value)} placeholder="Doe" />
                    </Field>
                    <Field label="Phone Number *" error={errors.phone}>
                      <input ref={(el) => (inputRefs.current.phone = el)} className={inputClass('phone')} defaultValue={formRef.current.phone} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); e.target.value = v; setField('phone', v); }} placeholder="9876543210" maxLength={10} />
                    </Field>
                    <Field label="Pincode *" error={errors.pincode}>
                      <input ref={(el) => (inputRefs.current.pincode = el)} className={inputClass('pincode')} defaultValue={formRef.current.pincode} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); e.target.value = v; setField('pincode', v); }} placeholder="110001" maxLength={6} />
                    </Field>
                    <Field label="Street Address *" error={errors.streetAddress} className="md:col-span-2">
                      <input ref={(el) => (inputRefs.current.streetAddress = el)} className={inputClass('streetAddress')} defaultValue={formRef.current.streetAddress} onChange={(e) => setField('streetAddress', e.target.value)} placeholder="House No., Building, Street" />
                    </Field>
                    <Field label="City *" error={errors.city}>
                      <input ref={(el) => (inputRefs.current.city = el)} className={inputClass('city')} defaultValue={formRef.current.city} onChange={(e) => setField('city', e.target.value)} placeholder="Mumbai" />
                    </Field>
                    <Field label="State *" error={errors.state}>
                      <select ref={(el) => (inputRefs.current.state = el)} className={inputClass('state')} defaultValue={formRef.current.state} onChange={(e) => setField('state', e.target.value)}>
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                  {errors.paymentMethod && <p className="text-xs text-red-500 mb-2">{errors.paymentMethod}</p>}
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-[#65a30d] bg-[#65a30d]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input type="radio" name="payment" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setToggle('paymentMethod', 'cash_on_delivery')} className="w-4 h-4 accent-[#65a30d]" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">💵 Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when you receive your order</p>
                      </div>
                    </label>
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'online'
                          ? 'border-[#65a30d] bg-[#65a30d]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setToggle('paymentMethod', 'online')} className="w-4 h-4 accent-[#65a30d]" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">💳 Pay Online</p>
                        <p className="text-xs text-gray-500">UPI, Cards, Net Banking</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit (mobile only — desktop uses sidebar button) */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="lg:hidden w-full bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white font-bold py-4 rounded-xl hover:from-[#4d7c0f] hover:to-[#3f6212] active:scale-[0.98] transition-all text-sm disabled:opacity-60"
                >
                  {submitting ? 'Placing Order...' : `Place Order · ₹${total.toLocaleString()}`}
                </button>
              </form>
            </div>

            {/* ─── RIGHT: Order Summary (sticky) ────────────────────────── */}
            <div className="lg:w-96">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                {/* Mini cart items */}
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                  {cartItems.map((item) => {
                    const product = item.product;
                    if (!product) return null;
                    const pricing = getItemPricing(item);
                    const name = product.productName || product.name || 'Product';
                    const img = product.images?.[0] || product.image;
                    return (
                      <div key={item._id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                          {img ? <img src={img} alt="" className="w-full h-full object-contain" /> : <span className="flex items-center justify-center h-full text-lg">🐾</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 shrink-0">₹{(pricing.discountedPrice * item.quantity).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                    <span>₹{mrpTotal.toLocaleString()}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- ₹{savings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span className="text-gray-500 text-xs italic">Included</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">Inclusive of 18% GST</p>
                  {savings > 0 && (
                    <p className="text-xs text-green-600 mt-1">You're saving ₹{savings.toLocaleString()} on this order!</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="hidden lg:block w-full mt-6 bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white font-bold py-3.5 rounded-xl hover:from-[#4d7c0f] hover:to-[#3f6212] active:scale-[0.98] transition-all text-sm disabled:opacity-60"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>

                <Link to="/cart" className="block mt-3 text-center text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                  ← Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Order Success Popup ──────────────────────────────────── */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-popIn">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 text-sm mb-1">Your order has been placed successfully.</p>
            <p className="text-gray-400 text-xs mb-6">Redirecting to your orders...</p>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white font-bold py-3 rounded-xl hover:from-[#4d7c0f] hover:to-[#3f6212] transition-all text-sm"
            >
              View My Orders
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-popIn {
          animation: popIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
