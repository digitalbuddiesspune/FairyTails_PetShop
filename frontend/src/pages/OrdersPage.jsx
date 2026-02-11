import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const STATUS_CONFIG = {
  placed: { label: 'Order Placed', color: 'bg-blue-100 text-blue-700', icon: '📦' },
  confirmed: { label: 'Confirmed', color: 'bg-purple-100 text-purple-700', icon: '✅' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: '🚚' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700', icon: '🛵' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
};

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] py-8">
        <div className="container mx-auto px-4">
          <nav className="mb-3 text-white/60 text-sm flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">My Orders</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white">📋 My Orders</h1>
          <p className="mt-1 text-white/70">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                            <p className="text-sm font-bold text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
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
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
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
