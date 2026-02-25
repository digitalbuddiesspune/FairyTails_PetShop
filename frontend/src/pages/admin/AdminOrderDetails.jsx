import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const STATUS_FLOW = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_CONFIG = {
  placed:     { label: 'Placed',     color: 'bg-blue-100 text-blue-700',   selectBg: 'bg-blue-50 border-blue-300 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700', selectBg: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-700', selectBg: 'bg-indigo-50 border-indigo-300 text-indigo-700' },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700',  selectBg: 'bg-green-50 border-green-300 text-green-700' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700',     selectBg: 'bg-red-50 border-red-300 text-red-700' },
};

const PAYMENT_CONFIG = {
  unpaid: { label: 'Unpaid', selectBg: 'bg-orange-50 border-orange-300 text-orange-700' },
  paid:   { label: 'Paid',   selectBg: 'bg-green-50 border-green-300 text-green-700' },
  failed: { label: 'Failed', selectBg: 'bg-red-50 border-red-300 text-red-700' },
};

const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '\n' +
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/admin/signin';
        return;
      }
      const data = await res.json();
      if (data.success) setOrder(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/admin/signin'); return; }
    fetchOrder();
    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id, token]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) setOrder(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentChange = async (newPayment) => {
    try {
      setUpdating(true);
      const res = await fetch(`${API_BASE}/admin/orders/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus: newPayment }),
      });
      const data = await res.json();
      if (data.success) setOrder(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Order not found.</div>;
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const historyMap = {};
  (order.statusHistory || []).forEach(h => { historyMap[h.status] = h.timestamp; });
  if (!historyMap.placed) historyMap.placed = order.createdAt;

  const totalQty = (order.items || []).reduce((s, i) => s + i.quantity, 0);
  const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);

  return (
    <div className="animate-fadeIn space-y-4 sm:space-y-5">
      {/* ─── Header with Order ID, Status Dropdown, Payment Dropdown ─── */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-gray-100 rounded-lg shrink-0" aria-label="Back to orders">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Order ID</p>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">#{displayOrderId}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Order Status Dropdown */}
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Order Status</p>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating || order.status === 'delivered' || order.status === 'cancelled' || order.paymentStatus === 'failed'}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${STATUS_CONFIG[order.status]?.selectBg || 'bg-gray-50'} disabled:opacity-60`}
              >
                {STATUS_FLOW.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>

            {/* Payment Status Dropdown */}
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Payment Status</p>
              <select
                value={order.paymentStatus || 'unpaid'}
                onChange={(e) => handlePaymentChange(e.target.value)}
                disabled={updating || order.paymentStatus === 'paid' || order.paymentStatus === 'failed'}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${PAYMENT_CONFIG[order.paymentStatus || 'unpaid']?.selectBg || 'bg-gray-50'} disabled:opacity-60`}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Order Meta Row */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div>
            <p className="text-gray-400 font-semibold mb-0.5">Date</p>
            <p className="text-gray-700 font-medium">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
              {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold mb-0.5">Customer</p>
            <p className="text-gray-700 font-medium">{order.user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold mb-0.5">Phone</p>
            <p className="text-gray-700 font-medium">{order.user?.phone || order.shippingAddress?.phone || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold mb-0.5">Payment Mode</p>
            <p className="text-gray-700 font-medium">{order.paymentMethod === 'cash_on_delivery' ? 'Cash' : 'Online'}</p>
          </div>
        </div>
      </div>

      {/* ─── Progress Bar (no scroll, fits viewport) ─── */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-start w-full gap-0">
          {STATUS_FLOW.map((s, i) => {
            const done = currentIdx >= i;
            const isCancelled = s === 'cancelled';
            const ts = historyMap[s];
            const rightDone = currentIdx > i;
            return (
              <React.Fragment key={s}>
                {i > 0 && (
                  <div className={`h-0.5 flex-1 min-w-0 shrink mt-[0.85rem] -mx-0.5 ${rightDone && !isCancelled ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
                <div className="flex flex-col items-center flex-1 min-w-0 shrink-0">
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs border-2 transition-all shrink-0 ${
                    done && !isCancelled
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCancelled && order.status === 'cancelled'
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-gray-100 border-gray-200 text-gray-300'
                  }`}>
                    {done && !isCancelled ? (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : isCancelled && order.status === 'cancelled' ? (
                      <span className="text-[10px] font-bold">✕</span>
                    ) : (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    )}
                  </div>
                  <p className={`text-[9px] sm:text-[10px] mt-1.5 font-bold text-center truncate w-full px-0.5 ${done && !isCancelled ? 'text-gray-800' : isCancelled && order.status === 'cancelled' ? 'text-red-500' : 'text-gray-300'}`} title={STATUS_CONFIG[s].label}>
                    {STATUS_CONFIG[s].label}
                  </p>
                  {ts && (done || (isCancelled && order.status === 'cancelled')) && (
                    <p className="text-[8px] sm:text-[9px] text-gray-400 text-center mt-0.5 truncate w-full px-0.5" title={formatDate(ts)}>{formatDate(ts).replace('\n', ', ')}</p>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ─── Order Info Grid ─── */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs">
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Order ID</p>
            <p className="text-gray-700 font-bold">#{displayOrderId}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Order Count</p>
            <p className="text-gray-700 font-bold">{totalQty}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Customer</p>
            <p className="text-gray-700 font-bold">{order.user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Phone</p>
            <p className="text-gray-700 font-bold">{order.user?.phone || order.shippingAddress?.phone || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Email</p>
            <p className="text-gray-700 font-bold truncate">{order.user?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Payment Status</p>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 
              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-600' : 
              'bg-orange-100 text-orange-600'
            }`}>
              {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Unpaid'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Payment Mode</p>
            <p className="text-gray-700 font-bold">{order.paymentMethod === 'cash_on_delivery' ? 'Cash' : 'Online'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Order Status</p>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_CONFIG[order.status]?.color || 'bg-gray-100'}`}>
              {STATUS_CONFIG[order.status]?.label}
            </span>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Order Date & Time</p>
            <p className="text-gray-700 font-bold">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
              {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-3 min-w-0">
            <p className="text-gray-400 font-semibold uppercase mb-0.5">Address</p>
            <p className="text-gray-700 font-medium leading-relaxed line-clamp-2" title={`${order.shippingAddress?.streetAddress}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}`}>
              {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Order Items (no scroll, card on mobile / table on larger) ─── */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Order Items</h3>
        </div>

        {/* Mobile: Card layout */}
        <div className="sm:hidden divide-y divide-gray-100">
          {order.items.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 shrink-0 overflow-hidden">
                {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-contain p-0.5" /> : <span className="flex items-center justify-center h-full text-sm">🐾</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate" title={item.productName}>{item.productName}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString()} = ₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table layout (no overflow) */}
        <div className="hidden sm:block">
          <table className="w-full text-left table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase w-[45%]">Item</th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase text-center w-[12%]">Qty</th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase text-right w-[20%]">Unit Price</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase text-right w-[23%]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 shrink-0 overflow-hidden">
                        {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-contain p-0.5" /> : <span className="flex items-center justify-center h-full text-sm">🐾</span>}
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate" title={item.productName}>{item.productName}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600 text-center">{item.quantity}</td>
                  <td className="px-3 py-3 text-xs text-gray-600 text-right">₹{item.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-800 text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Billing Summary with GST ─── */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Billing Summary</h3>
        <div className="space-y-2 text-xs max-w-sm">
          <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-gray-700">₹{order.subtotal?.toLocaleString()}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span className="text-green-500">Discount</span><span className="text-green-500">-₹{order.discount?.toLocaleString()}</span></div>}
          <div className="flex justify-between"><span className="text-gray-400">GST (18%)</span><span className="text-gray-700">₹{order.gst?.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Shipping Charges</span><span className="text-gray-700">{order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge}`}</span></div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-sm">
            <span>Total Amount</span>
            <span>₹{order.total?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AdminOrderDetails;
