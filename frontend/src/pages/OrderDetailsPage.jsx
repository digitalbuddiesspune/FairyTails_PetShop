import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const STATUS_FLOW = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_CONFIG = {
  placed:     { label: 'Placed',     color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700' },
};

/* ── Decorative Paw ─── */
const PawIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C10.5 2 9.5 3.5 9.5 5C9.5 6.5 10.5 8 12 8C13.5 8 14.5 6.5 14.5 5C14.5 3.5 13.5 2 12 2Z" />
    <path d="M4.5 6C3 6 2 7.5 2 9C2 10.5 3 12 4.5 12C6 12 7 10.5 7 9C7 7.5 6 6 4.5 6Z" />
    <path d="M19.5 6C18 6 17 7.5 17 9C17 10.5 18 12 19.5 12C21 12 22 10.5 22 9C22 7.5 21 6 19.5 6Z" />
    <path d="M6 14.5C6 12.567 8.686 11 12 11C15.314 11 18 12.567 18 14.5C18 16.433 15.314 22 12 22C8.686 22 6 16.433 6 14.5Z" />
  </svg>
);

const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '\n' +
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setOrder(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/signin'); return; }
    fetchOrder();
    // Poll every 15 seconds for real-time status updates
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id, token, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancellingId(order._id);
      const res = await axios.put(`${API_BASE}/orders/${order._id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setOrder(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const historyMap = {};
  (order.statusHistory || []).forEach(h => { historyMap[h.status] = h.timestamp; });
  if (!historyMap.placed) historyMap.placed = order.createdAt;

  const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Scattered paw decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PawIcon className="absolute top-16 left-[5%] w-8 h-8 md:w-10 md:h-10 text-gray-300/50 rotate-12" />
        <PawIcon className="absolute top-28 right-[8%] w-10 h-10 md:w-12 md:h-12 text-gray-300/40 -rotate-[25deg]" />
        <PawIcon className="absolute top-[20%] right-[22%] w-6 h-6 md:w-8 md:h-8 text-gray-300/45 rotate-45" />
        <PawIcon className="absolute top-[30%] left-[3%] w-7 h-7 md:w-9 md:h-9 text-gray-300/35 rotate-[60deg]" />
        <PawIcon className="absolute top-[38%] right-[5%] w-9 h-9 md:w-11 md:h-11 text-gray-300/50 -rotate-12" />
        <PawIcon className="absolute top-[48%] left-[12%] w-8 h-8 md:w-10 md:h-10 text-gray-300/40 rotate-[30deg]" />
        <PawIcon className="absolute top-[55%] right-[15%] w-7 h-7 md:w-9 md:h-9 text-gray-300/35 rotate-[70deg]" />
        <PawIcon className="absolute top-[65%] left-[7%] w-9 h-9 md:w-11 md:h-11 text-gray-300/45 -rotate-[40deg]" />
        <PawIcon className="absolute top-[73%] right-[10%] w-6 h-6 md:w-8 md:h-8 text-gray-300/40 rotate-[20deg]" />
        <PawIcon className="absolute top-[82%] left-[20%] w-8 h-8 md:w-10 md:h-10 text-gray-300/35 rotate-[50deg]" />
        <PawIcon className="absolute top-[25%] left-[45%] w-5 h-5 md:w-7 md:h-7 text-gray-300/40 -rotate-[15deg]" />
        <PawIcon className="absolute top-[42%] left-[55%] w-6 h-6 md:w-8 md:h-8 text-gray-300/30 rotate-[80deg]" />
        <PawIcon className="absolute top-[60%] left-[35%] w-7 h-7 md:w-9 md:h-9 text-gray-300/35 rotate-[110deg]" />
        <PawIcon className="absolute top-[90%] right-[30%] w-5 h-5 md:w-7 md:h-7 text-gray-300/40 -rotate-[55deg]" />
        <PawIcon className="absolute top-[15%] left-[65%] w-6 h-6 md:w-8 md:h-8 text-gray-300/30 rotate-[40deg]" />
      </div>

      <section className="relative z-10 py-6 sm:py-8 lg:py-10 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl lg:max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <img src="https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770976442/catt_na3yls.png" alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Order #{displayOrderId}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[order.status]?.color || 'bg-gray-100'}`}>
                  {STATUS_CONFIG[order.status]?.label}
                </span>
                {order.status === 'placed' && (
                  <button
                    onClick={handleCancel}
                    disabled={cancellingId}
                    className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {cancellingId ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar - responsive timeline */}
          {order.status !== 'cancelled' ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 md:p-6 mb-6 overflow-x-auto">
              <div className="flex items-start justify-between min-w-[320px] sm:min-w-0">
                {STATUS_FLOW.filter(s => s !== 'cancelled').map((s, i) => {
                  const done = currentIdx >= STATUS_FLOW.indexOf(s);
                  const ts = historyMap[s];
                  return (
                    <React.Fragment key={s}>
                      {i > 0 && (
                        <div className={`h-0.5 flex-1 mx-0.5 sm:mx-1 mt-4 sm:mt-5 rounded min-w-[8px] self-center ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                      )}
                      <div className="flex flex-col items-center shrink-0 w-16 sm:w-20 md:w-24">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base border-2 transition-all shrink-0 ${
                          done ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-300'
                        }`}>
                          {done ? (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className="text-xs sm:text-sm font-bold">{i + 1}</span>
                          )}
                        </div>
                        <p className={`text-[10px] sm:text-xs mt-2 font-bold text-center leading-tight ${done ? 'text-gray-800' : 'text-gray-300'}`}>{STATUS_CONFIG[s].label}</p>
                        {ts && done && (
                          <p className="text-[9px] sm:text-[10px] text-gray-400 text-center mt-0.5 leading-tight break-words max-w-full">{formatDate(ts)}</p>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-center">
              <span className="text-red-500 text-lg font-bold">Order Cancelled</span>
              {historyMap.cancelled && (
                <p className="text-xs text-red-400 mt-1">{formatDate(historyMap.cancelled)}</p>
              )}
            </div>
          )}

          {/* Main content grid - stacks on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left column: Items + Customer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items (product + price) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <h3 className="font-bold text-gray-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                        {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-contain p-1" /> : <span className="flex items-center justify-center h-full text-lg sm:text-xl">🐾</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2 sm:line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <h3 className="font-bold text-gray-900 mb-3">Customer & Delivery</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:gap-2 gap-0.5">
                    <span className="text-gray-400 w-full sm:w-24 shrink-0">Name</span>
                    <span className="text-gray-800 font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-2 gap-0.5">
                    <span className="text-gray-400 w-full sm:w-24 shrink-0">Phone</span>
                    <span className="text-gray-800 font-medium">{order.shippingAddress?.phone}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-2 gap-0.5 sm:items-start">
                    <span className="text-gray-400 w-full sm:w-24 shrink-0">Address</span>
                    <span className="text-gray-800 font-medium leading-relaxed break-words">
                      {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Price Breakdown */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 lg:sticky lg:top-24">
                <h3 className="font-bold text-gray-900 mb-3">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-gray-800">₹{order.subtotal?.toLocaleString()}</span></div>
                  {order.discount > 0 && <div className="flex justify-between"><span className="text-green-500">Discount</span><span className="text-green-500">-₹{order.discount?.toLocaleString()}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-400">Delivery</span><span className="text-gray-800">{order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge}`}</span></div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{order.total?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">18% GST included</p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Payment Method</p>
                  <p className="text-sm font-medium text-gray-800">
                    {order.paymentMethod === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Online'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-[#65a30d] font-semibold hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Orders
          </Link>
        </div>
      </section>
    </div>
  );
};

export default OrderDetailsPage;
