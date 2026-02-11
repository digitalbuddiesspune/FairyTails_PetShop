import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import cattImage from '../assets/catt.png';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const STATUS_CONFIG = {
  placed: { label: 'Placed', color: 'bg-blue-100 text-blue-700', icon: '📦' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700', icon: '⚙️' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
};

const STATUS_FLOW = ['placed', 'processing', 'shipped', 'delivered'];

/* ── Decorative SVG icons ────────────────────────────────────────────────── */
const PawIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C10.5 2 9.5 3.5 9.5 5C9.5 6.5 10.5 8 12 8C13.5 8 14.5 6.5 14.5 5C14.5 3.5 13.5 2 12 2Z" />
    <path d="M4.5 6C3 6 2 7.5 2 9C2 10.5 3 12 4.5 12C6 12 7 10.5 7 9C7 7.5 6 6 4.5 6Z" />
    <path d="M19.5 6C18 6 17 7.5 17 9C17 10.5 18 12 19.5 12C21 12 22 10.5 22 9C22 7.5 21 6 19.5 6Z" />
    <path d="M6 14.5C6 12.567 8.686 11 12 11C15.314 11 18 12.567 18 14.5C18 16.433 15.314 22 12 22C8.686 22 6 16.433 6 14.5Z" />
  </svg>
);

const BoneIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
    <path d="M50.4 6.8a8 8 0 0 0-11.3 0L13.6 32.3a8 8 0 0 0 0 11.3 8 8 0 0 0 0 11.3 8 8 0 0 0 11.3 0 8 8 0 0 0 11.3 0L61.7 29.4a8 8 0 0 0 0-11.3 8 8 0 0 0 0-11.3z" />
  </svg>
);

const OrdersPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/signin'); return; }
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setOrders(res.data.data);
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, navigate]);

  if (!token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* ── Scattered paw & bone decorations ───────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PawIcon className="absolute top-16 left-[5%] w-10 h-10 text-gray-200/60 rotate-12" />
        <BoneIcon className="absolute top-32 right-[8%] w-12 h-12 text-gray-200/50 -rotate-[25deg]" />
        <PawIcon className="absolute top-[22%] right-[18%] w-8 h-8 text-gray-100/80 rotate-45" />
        <BoneIcon className="absolute top-[35%] left-[3%] w-9 h-9 text-gray-200/40 rotate-[60deg]" />
        <PawIcon className="absolute top-[45%] right-[5%] w-11 h-11 text-gray-100/70 -rotate-12" />
        <BoneIcon className="absolute top-[55%] left-[12%] w-10 h-10 text-gray-200/50 rotate-[30deg]" />
        <PawIcon className="absolute top-[65%] right-[15%] w-9 h-9 text-gray-200/40 rotate-[70deg]" />
        <BoneIcon className="absolute top-[75%] left-[7%] w-11 h-11 text-gray-100/60 -rotate-[40deg]" />
        <PawIcon className="absolute top-[85%] right-[10%] w-8 h-8 text-gray-200/50 rotate-[20deg]" />
        <BoneIcon className="absolute top-[90%] left-[20%] w-10 h-10 text-gray-100/50 rotate-[50deg]" />
        <PawIcon className="absolute top-[28%] left-[45%] w-7 h-7 text-gray-100/60 -rotate-[15deg]" />
        <BoneIcon className="absolute top-[50%] left-[55%] w-8 h-8 text-gray-200/30 rotate-[80deg]" />
      </div>

      {/* ── Page Title with cat image ──────────────────────────────────────── */}
      <div className="container mx-auto px-4 pt-8 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <img src={cattImage} alt="Cat" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-400 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <section className="pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Once you place an order, it will appear here.</p>
              <Link to="/" className="inline-block bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white font-bold py-3 px-8 rounded-xl hover:from-[#4d7c0f] hover:to-[#3f6212] transition-all">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                return (
                  <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Order Header */}
                    <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                        <span className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Status Progress Bar */}
                   
                    {/* Order Items */}
                    <div className="p-5">
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                              {item.productImage ? (
                                <img src={item.productImage} alt="" className="w-full h-full object-contain p-1" />
                              ) : (
                                <span className="flex items-center justify-center h-full text-xl">🐾</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${item.product}`} className="font-semibold text-gray-900 text-sm hover:text-[#65a30d] transition-colors line-clamp-1">
                                {item.productName}
                              </Link>
                              <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                            </div>
                            
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Delivery Address</p>
                            <p className="text-gray-800 font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p>{order.shippingAddress.streetAddress}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} </p>
                            <p className="text-gray-400">📞 {order.shippingAddress.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Payment</p>
                            <p className="text-gray-800 font-medium">
                              {order.paymentMethod === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Online'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Summary</p>
                            <p>Subtotal: ₹{order.subtotal.toLocaleString()}</p>
                            {order.discount > 0 && <p className="text-green-600">Discount: -₹{order.discount.toLocaleString()}</p>}
                            <p>Delivery: {order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge}`}</p>
                          </div>
                        </div>
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

export default OrdersPage;
