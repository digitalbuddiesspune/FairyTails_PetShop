import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const STATUS_CONFIG = {
  placed:     { label: 'Placed',     bg: 'bg-blue-50 text-blue-600 border-blue-200' },
  processing: { label: 'Processing', bg: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  shipped:    { label: 'Shipped',    bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  delivered:  { label: 'Delivered',  bg: 'bg-green-50 text-green-600 border-green-200' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-50 text-red-600 border-red-200' },
};

const PAYMENT_CONFIG = {
  unpaid: { label: 'Unpaid', bg: 'bg-orange-50 text-orange-600 border-orange-200' },
  paid:   { label: 'Paid',   bg: 'bg-green-50 text-green-600 border-green-200' },
};

const ALL_STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('adminToken');

  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/admin/signin';
        return;
      }
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchOrders} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors flex items-center gap-1.5 self-start">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${filter === 'all' ? 'bg-gray-800 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
          All ({orders.length})
        </button>
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${filter === s ? STATUS_CONFIG[s].bg + ' border-current' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
            {STATUS_CONFIG[s].label} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Orders Table / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
          <span className="text-4xl mb-3 block">📦</span>
          <p className="text-gray-400 text-sm font-medium">
            {filter === 'all' ? 'No orders yet' : `No ${STATUS_CONFIG[filter]?.label.toLowerCase()} orders`}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
              const pay = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.unpaid;
              const userName = order.user?.name || 'Unknown';
              const totalQty = (order.items || []).reduce((s, i) => s + i.quantity, 0);
              const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);
              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/admin/order-details/${order._id}`)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 active:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs font-bold text-gray-800">#{displayOrderId}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{userName}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg}`}>{st.label}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${pay.bg}`}>{pay.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
                    <span className="font-bold text-gray-800">₹{order.total?.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Products</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Price</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Payment</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                  const pay = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.unpaid;
                  const userName = order.user?.name || 'Unknown';
                  const userPhone = order.user?.phone || order.shippingAddress?.phone || '—';
                  const totalQty = (order.items || []).reduce((s, i) => s + i.quantity, 0);
                  const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);

                  return (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/admin/order-details/${order._id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-gray-800">#{displayOrderId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-gray-800">{userName}</p>
                        <p className="text-[10px] text-gray-400">{userPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5 max-w-[200px]">
                          {(order.items || []).slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded bg-gray-50 border border-gray-200 shrink-0 overflow-hidden">
                                {item.productImage ? (
                                  <img src={item.productImage} alt="" className="w-full h-full object-contain" />
                                ) : (
                                  <span className="flex items-center justify-center h-full text-[10px]">🐾</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-700 truncate">{item.productName}</p>
                            </div>
                          ))}
                          {(order.items || []).length > 2 && (
                            <p className="text-[10px] text-gray-400 pl-9">+{order.items.length - 2} more</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-gray-600">{totalQty}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-gray-800">₹{order.total?.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${pay.bg}`}>
                          {pay.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-gray-300">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AdminOrders;
