import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const STATUS_FLOW = ['placed', 'processing', 'shipped', 'delivered'];
const ALL_STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_CONFIG = {
  placed: { label: 'Placed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📦', dot: 'bg-blue-500', selectBg: 'bg-blue-50 border-blue-300 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '⚙️', dot: 'bg-yellow-500', selectBg: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '🚚', dot: 'bg-indigo-500', selectBg: 'bg-indigo-50 border-indigo-300 text-indigo-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: '✅', dot: 'bg-green-500', selectBg: 'bg-green-50 border-green-300 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: '❌', dot: 'bg-red-500', selectBg: 'bg-red-50 border-red-300 text-red-700' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        setSuccessMsg(`Order updated to "${STATUS_CONFIG[newStatus]?.label}"`);
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchOrders} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center gap-2 self-start">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all shrink-0 ${filter === 'all' ? 'bg-gray-800 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
          All ({orders.length})
        </button>
        {ALL_STATUSES.map(s => {
          const conf = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all shrink-0 flex items-center gap-1.5 ${filter === s ? conf.color + ' border-current' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
              <span>{conf.icon}</span>
              {conf.label} ({statusCounts[s] || 0})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <span className="text-5xl mb-4 block">📦</span>
          <p className="text-gray-500 text-lg font-medium">
            {filter === 'all' ? 'No orders yet' : `No ${STATUS_CONFIG[filter]?.label.toLowerCase()} orders`}
          </p>
          <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
            const isExpanded = expandedOrder === order._id;
            const userName = order.user?.name || 'Unknown User';
            const userEmail = order.user?.email || '';
            const userId = order.user?._id || order.user || '';

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Order Header */}
                <div
                  className="p-4 sm:p-5 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${st.dot}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${st.color}`}>
                            {st.icon} {st.label}
                          </span>
                        </div>
                        {/* User Name + ID */}
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-xs font-semibold text-gray-700">{userName}</span>
                          {userEmail && <span className="text-[10px] text-gray-400">({userEmail})</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                          User ID: {typeof userId === 'string' ? userId : userId.toString?.() || '—'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{order.total?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 sm:px-5 pb-5 pt-4 space-y-5 animate-fadeIn">

                    {/* Status Update Dropdown */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">Update Order Status</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          disabled={updating === order._id}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 outline-none cursor-pointer transition-all disabled:opacity-50 ${STATUS_CONFIG[order.status]?.selectBg || 'bg-gray-50 border-gray-300 text-gray-700'}`}
                        >
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>
                              {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                            </option>
                          ))}
                        </select>
                        {updating === order._id && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            Updating...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Progress Bar */}
                    {order.status !== 'cancelled' && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Order Progress</p>
                        <div className="flex items-center gap-1">
                          {STATUS_FLOW.map((s, i) => {
                            const done = STATUS_FLOW.indexOf(order.status) >= i;
                            const conf = STATUS_CONFIG[s];
                            return (
                              <div key={s} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${done ? conf.color + ' border-current' : 'bg-gray-50 border-gray-200 text-gray-300'}`}>
                                    {conf.icon}
                                  </div>
                                  <p className={`text-[10px] mt-1 font-semibold ${done ? 'text-gray-700' : 'text-gray-300'}`}>{conf.label}</p>
                                </div>
                                {i < STATUS_FLOW.length - 1 && (
                                  <div className={`h-0.5 flex-1 mx-1 rounded ${STATUS_FLOW.indexOf(order.status) > i ? 'bg-green-400' : 'bg-gray-200'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="flex items-center gap-2 bg-red-50 rounded-xl p-3 border border-red-100">
                        <span className="text-lg">❌</span>
                        <p className="text-sm font-semibold text-red-600">This order has been cancelled</p>
                      </div>
                    )}

                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Customer</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-base font-bold text-gray-600 shrink-0">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900">{userName}</p>
                          {userEmail && <p className="text-xs text-gray-500">{userEmail}</p>}
                          <p className="text-[10px] text-gray-400 font-mono">ID: {typeof userId === 'string' ? userId : userId.toString?.() || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                      <div className="space-y-2">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 shrink-0 overflow-hidden">
                              {item.productImage ? (
                                <img src={item.productImage} alt="" className="w-full h-full object-contain p-1" />
                              ) : (
                                <span className="flex items-center justify-center h-full text-lg">🐾</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                              <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Payment Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Shipping Address</p>
                        {order.shippingAddress && (
                          <>
                            <p className="text-sm font-semibold text-gray-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p className="text-xs text-gray-600">{order.shippingAddress.streetAddress}</p>
                            <p className="text-xs text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                            <p className="text-xs text-gray-400 mt-1">📞 {order.shippingAddress.phone}</p>
                          </>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Payment</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.paymentMethod === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Online'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Summary</p>
                        <p className="text-xs text-gray-600">Subtotal: ₹{order.subtotal?.toLocaleString()}</p>
                        {order.discount > 0 && <p className="text-xs text-green-600">Discount: -₹{order.discount?.toLocaleString()}</p>}
                        <p className="text-xs text-gray-600">Delivery: {order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge}`}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">Total: ₹{order.total?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[80]" style={{ animation: 'slideDown .35s ease-out' }}>
          <div className="bg-green-600 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-sm">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            {successMsg}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-20px); } to { opacity:1; transform:translate(-50%,0); } }
      `}</style>
    </div>
  );
};

export default AdminOrders;
