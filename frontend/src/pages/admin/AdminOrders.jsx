import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const STATUS_CONFIG = {
  placed:     { label: 'Confirm',    bg: 'bg-blue-50 text-blue-600 border-blue-200' },
  processing: { label: 'Processing', bg: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  shipped:    { label: 'Shipped',    bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  delivered:  { label: 'Delivered',  bg: 'bg-green-50 text-green-600 border-green-200' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-50 text-red-600 border-red-200' },
};

const PAYMENT_CONFIG = {
  unpaid:  { label: 'Unpaid',  bg: 'bg-orange-50 text-orange-600 border-orange-200' },
  paid:    { label: 'Paid',    bg: 'bg-green-50 text-green-600 border-green-200' },
  refund:  { label: 'Refund',  bg: 'bg-purple-50 text-purple-600 border-purple-200' },
  failed:  { label: 'Failed',  bg: 'bg-red-50 text-red-600 border-red-200' },
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

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
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // Apply all filters
  const filteredOrders = orders.filter(order => {
    // Date range filter
    if (startDate) {
      const orderDate = new Date(order.createdAt);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (orderDate < start) return false;
    }
    if (endDate) {
      const orderDate = new Date(order.createdAt);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (orderDate > end) return false;
    }

    // Order status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;

    // Payment status filter
    if (paymentFilter !== 'all') {
      const isPaymentFailed = order.paymentStatus === 'failed' ||
        (order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId);

      if (paymentFilter === 'failed') {
        if (!isPaymentFailed && order.paymentStatus !== 'failed') return false;
      } else {
        if (isPaymentFailed) return false;
        if (order.paymentStatus !== paymentFilter) return false;
      }
    }

    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setPaymentFilter('all');
  };

  const hasActiveFilters = startDate || endDate || statusFilter !== 'all' || paymentFilter !== 'all';

  // Download XLS
  const downloadXLS = () => {
    if (filteredOrders.length === 0) return;

    const xlsData = filteredOrders.map(order => {
      const isPaymentFailed = order.paymentStatus === 'failed' ||
        (order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId);
      const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);
      const userName = order.user?.name || 'Unknown';
      const userPhone = order.user?.phone || order.shippingAddress?.phone || '—';
      const userEmail = order.user?.email || '—';
      const totalQty = (order.items || []).reduce((s, i) => s + i.quantity, 0);
      const products = (order.items || []).map(i => `${i.productName} (x${i.quantity})`).join(', ');
      const statusLabel = STATUS_CONFIG[order.status]?.label || order.status;
      const paymentLabel = isPaymentFailed ? 'Failed' : (PAYMENT_CONFIG[order.paymentStatus]?.label || order.paymentStatus);

      return {
        'Order ID': `#${displayOrderId}`,
        'Customer': userName,
        'Email': userEmail,
        'Phone': userPhone,
        'Products': products,
        'Quantity': totalQty,
        'Price (₹)': order.total || 0,
        'Order Status': statusLabel,
        'Payment Status': paymentLabel,
        'Payment Method': order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Online',
        'Date': new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        'Time': new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
    });

    const ws = XLSX.utils.json_to_sheet(xlsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');

    // Auto-adjust column widths
    const colWidths = Object.keys(xlsData[0]).map(key => ({
      wch: Math.max(key.length, ...xlsData.map(row => String(row[key]).length)) + 2
    }));
    ws['!cols'] = colWidths;

    const fileName = `Orders_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

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
        <div className="flex items-center gap-2 self-start">
          <button onClick={fetchOrders} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          {/* Date Range */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-gray-50"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-gray-50"
              />
            </div>
          </div>

          {/* Order Status */}
          <div className="flex-1 min-w-0 sm:max-w-[180px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-gray-50"
            >
              <option value="all">All Status</option>
              <option value="placed">Confirm</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="flex-1 min-w-0 sm:max-w-[180px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-gray-50"
            >
              <option value="all">All Payment</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refund">Refund</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={downloadXLS}
              disabled={filteredOrders.length === 0}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download XLS
            </button>
          </div>
        </div>

        {/* Active filter summary */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">Showing:</span>
            <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
            </span>
            {startDate && <span className="bg-gray-100 px-2 py-0.5 rounded-full">From: {startDate}</span>}
            {endDate && <span className="bg-gray-100 px-2 py-0.5 rounded-full">To: {endDate}</span>}
            {statusFilter !== 'all' && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{STATUS_CONFIG[statusFilter]?.label}</span>}
            {paymentFilter !== 'all' && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{PAYMENT_CONFIG[paymentFilter]?.label}</span>}
          </div>
        )}
      </div>

      {/* Orders Table / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
          <span className="text-4xl mb-3 block">📦</span>
          <p className="text-gray-400 text-sm font-medium">No orders found for the selected filters</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
              const pay = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.unpaid;
              const isPaymentFailed = order.paymentStatus === 'failed' || 
                (order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId);
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
                      {isPaymentFailed ? (
                        <>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-600 border-red-200">Failed</span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-600 border-red-200">Failed</span>
                        </>
                      ) : (
                        <>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg}`}>{st.label}</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${pay.bg}`}>{pay.label}</span>
                        </>
                      )}
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
                    const isPaymentFailed = order.paymentStatus === 'failed' || 
                      (order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId);
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
                          {isPaymentFailed ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-600 border-red-200">
                              Failed
                            </span>
                          ) : (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg}`}>
                              {st.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isPaymentFailed ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-600 border-red-200">
                              Failed
                            </span>
                          ) : (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${pay.bg}`}>
                              {pay.label}
                            </span>
                          )}
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
