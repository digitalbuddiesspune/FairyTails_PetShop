import React, { useState, useEffect } from 'react';

import { Link, useParams, useNavigate } from 'react-router-dom';

import axios from 'axios';
import cattImg from '../assets/catt.png';
import { formatRupee } from '../utils/formatPrice';
import { type } from '../styles/typography';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const STATUS_FLOW = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_CONFIG = {

  placed:     { label: 'Confirm',    color: 'bg-blue-100 text-blue-700' },

  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },

  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-700' },

  delivered:  { label: 'Delivered',  color: 'bg-blue-100 text-blue-700' },

  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700' },

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

        <div className="w-16 h-16 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin" />

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
        <PawIcon className="absolute top-16 left-[5%] w-10 h-10 text-gray-300/50 rotate-12" />
        <PawIcon className="absolute top-28 right-[8%] w-12 h-12 text-gray-300/40 -rotate-[25deg]" />
        <PawIcon className="absolute top-[20%] right-[22%] w-8 h-8 text-gray-300/45 rotate-45" />
        <PawIcon className="absolute top-[30%] left-[3%] w-9 h-9 text-gray-300/35 rotate-[60deg]" />
        <PawIcon className="absolute top-[38%] right-[5%] w-11 h-11 text-gray-300/50 -rotate-12" />
        <PawIcon className="absolute top-[48%] left-[12%] w-10 h-10 text-gray-300/40 rotate-[30deg]" />
        <PawIcon className="absolute top-[55%] right-[15%] w-9 h-9 text-gray-300/35 rotate-[70deg]" />
        <PawIcon className="absolute top-[65%] left-[7%] w-11 h-11 text-gray-300/45 -rotate-[40deg]" />
        <PawIcon className="absolute top-[73%] right-[10%] w-8 h-8 text-gray-300/40 rotate-[20deg]" />
        <PawIcon className="absolute top-[82%] left-[20%] w-10 h-10 text-gray-300/35 rotate-[50deg]" />
        <PawIcon className="absolute top-[25%] left-[45%] w-7 h-7 text-gray-300/40 -rotate-[15deg]" />
        <PawIcon className="absolute top-[42%] left-[55%] w-8 h-8 text-gray-300/30 rotate-[80deg]" />
        <PawIcon className="absolute top-[60%] left-[35%] w-9 h-9 text-gray-300/35 rotate-[110deg]" />
        <PawIcon className="absolute top-[90%] right-[30%] w-7 h-7 text-gray-300/40 -rotate-[55deg]" />
        <PawIcon className="absolute top-[15%] left-[65%] w-8 h-8 text-gray-300/30 rotate-[40deg]" />
      </div>

      <section className="relative z-10 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img src={cattImg} alt="" className="w-20 h-20 object-contain" />
              <div>
                <h1 className={`${type.h2} text-gray-900`}>
                  Order #{displayOrderId}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full ${type.caption} font-bold ${STATUS_CONFIG[order.status]?.color || 'bg-gray-100'}`}>
                    {STATUS_CONFIG[order.status]?.label}
                  </span>
                  {order.status === 'placed' && (
                    <button
                      onClick={handleCancel}
                      disabled={cancellingId}
                      className={`${type.caption} px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50`}
                    >
                      {cancellingId ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open(`/invoice/${order._id}`, '_blank')}
              className={`${type.caption} inline-flex items-center gap-2 px-5 py-2.5 bg-[#205ea9] text-white rounded-xl shadow-lg shadow-[#205EA9]/25 hover:from-[#1d4f8f] hover:to-[#203D5B] hover:shadow-[#205EA9]/30 active:scale-[0.98] transition-all`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Invoice
            </button>
          </div>

          {/* Progress Bar */}
          {order.status !== 'cancelled' ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-6">
              <div className="flex items-center justify-between">
                {STATUS_FLOW.filter(s => s !== 'cancelled').map((s, i, arr) => {
                  const done = currentIdx >= STATUS_FLOW.indexOf(s);
                  const ts = historyMap[s];
                  return (
                    <React.Fragment key={s}>
                      {i > 0 && (
                        <div className={`h-0.5 flex-1 mx-1 rounded ${done ? 'bg-blue-400' : 'bg-gray-200'}`} />
                      )}
                      <div className="flex flex-col items-center shrink-0 w-[80px]">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type.input} border-2 transition-all ${
                          done ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-300'
                        }`}>
                          {done ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className={`${type.caption}`}>{i + 1}</span>
                          )}
                        </div>
                        <p className={`${type.caption} mt-2 font-bold text-center ${done ? 'text-gray-800' : 'text-gray-300'}`}>{STATUS_CONFIG[s].label}</p>
                        {ts && done && (
                          <p className={`${type.bodySm} text-gray-400 text-center mt-0.5 whitespace-pre-line`}>{formatDate(ts)}</p>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-center">
              <span className={`${type.h4} text-red-500`}>Order Cancelled</span>
              {historyMap.cancelled && (
                <p className={`${type.caption} text-red-400 mt-1`}>{formatDate(historyMap.cancelled)}</p>
              )}
            </div>
          )}

          {/* Order Items (product + price) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <h3 className={`${type.button} text-gray-900 mb-4`}>Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                    {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-contain p-1" /> : <span className={`${type.bodySm} flex items-center justify-center h-full`}>🐾</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${type.bodySm} text-gray-900 truncate`}>{item.productName}</p>
                    <p className={`${type.caption} text-gray-400`}>Qty: {item.quantity} × {formatRupee(item.price || 0)}</p>
                  </div>
                  <p className={`${type.caption} text-gray-900 shrink-0`}>{formatRupee((item.price || 0) * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <h3 className={`${type.button} text-gray-900 mb-3`}>Customer & Delivery</h3>
            <div className={`${type.bodySm} space-y-2`}>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24 shrink-0">Name</span>
                <span className={`${type.nav} text-gray-800`}>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24 shrink-0">Phone</span>
                <span className={`${type.nav} text-gray-800`}>{order.shippingAddress?.phone}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24 shrink-0">Address</span>
                <span className={`${type.body} text-gray-800`}>
                  {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Summary with GST */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <h3 className={`${type.button} text-gray-900 mb-3`}>Price Breakdown</h3>
            <div className={`${type.bodySm} space-y-2`}>
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-800">{formatRupee(order.subtotal || 0)}</span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-500">Discount</span>
                  <span className="text-blue-500">-{formatRupee(order.discount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">18% GST</span>
                <span className={`${type.caption} text-gray-500`}>Included</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Charges</span>
                <div className="flex items-center gap-2">
                  {(order.subtotal || 0) >= 500 ? (
                    <>
                      <span className={`${type.caption} text-gray-400 line-through`}>₹50</span>
                      <span className={`${type.nav} text-blue-600`}>Free</span>
                    </>
                  ) : (
                    <span className="text-gray-800">
                      {(order.deliveryCharge || 0) === 0 ? 'Free' : formatRupee(order.deliveryCharge || 0)}
                    </span>
                  )}
                </div>
              </div>
              <div className={`${type.button} flex justify-between text-gray-900 pt-2 border-t border-gray-100`}>
                <span>Total</span>
                <span>{formatRupee(order.total || 0)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${type.caption} text-gray-400`}>Payment Method</p>
                  <p className={`${type.nav} text-gray-800`}>
                    {order.paymentMethod === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Online'}
                  </p>
                </div>
                {order.paymentStatus === 'failed' && (
                  <span className={`${type.caption} px-3 py-1 rounded-full bg-red-100 text-red-700`}>
                    Payment Failed
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link to="/orders" className={`${type.bodySm} inline-flex items-center gap-1 hover:underline`}>

            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>

            Back to Orders

          </Link>

        </div>

      </section>

    </div>

  );

};

export default OrderDetailsPage;