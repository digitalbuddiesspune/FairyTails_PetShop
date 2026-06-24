import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatRupee } from '../../utils/formatPrice';
import { type } from '../../styles/typography';

const API_BASE = import.meta.env.VITE_BACKEND_API;
const PAYMENTS_PAGE_SIZE = 100;

const AdminPayments = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All Methods');
  const [listPage, setListPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setListPage(1);
  }, [searchTerm, paymentStatusFilter, methodFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const paidRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Filter orders
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toString().includes(searchTerm) ||
      order._id?.includes(searchTerm) ||
      order.razorpayOrderId?.includes(searchTerm) ||
      order.razorpayPaymentId?.includes(searchTerm);

    // Payment status filter
    if (paymentStatusFilter !== 'All') {
      const isPaymentFailed = order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId;

      if (paymentStatusFilter === 'Failed') {
        if (!isPaymentFailed && order.paymentStatus !== 'failed') return false;
      } else {
        if (isPaymentFailed) return false;
        if (order.paymentStatus !== paymentStatusFilter.toLowerCase()) return false;
      }
    }

    const matchesMethod =
      methodFilter === 'All Methods' ||
      (methodFilter === 'Online' && order.paymentMethod !== 'cash_on_delivery') ||
      (methodFilter === 'COD' && order.paymentMethod === 'cash_on_delivery');

    return matchesSearch && matchesMethod;
  }), [orders, searchTerm, paymentStatusFilter, methodFilter]);

  const totalListPages = Math.max(1, Math.ceil(filteredOrders.length / PAYMENTS_PAGE_SIZE));
  const effectiveListPage = Math.min(listPage, totalListPages);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredOrders.length / PAYMENTS_PAGE_SIZE));
    setListPage((p) => Math.min(p, tp));
  }, [filteredOrders.length]);

  const paginatedOrders = useMemo(() => {
    const start = (effectiveListPage - 1) * PAYMENTS_PAGE_SIZE;
    return filteredOrders.slice(start, start + PAYMENTS_PAGE_SIZE);
  }, [filteredOrders, effectiveListPage]);

  const listRangeStart = filteredOrders.length === 0 ? 0 : (effectiveListPage - 1) * PAYMENTS_PAGE_SIZE + 1;
  const listRangeEnd = filteredOrders.length === 0 ? 0 : Math.min(effectiveListPage * PAYMENTS_PAGE_SIZE, filteredOrders.length);

  // Download XLS
  const downloadXLS = () => {
    if (filteredOrders.length === 0) return;

    const xlsData = filteredOrders.map(order => {
      const isPaymentFailed = order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId;
      const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);
      const paymentStatus = isPaymentFailed ? 'Failed' : (order.paymentStatus || 'Unpaid');

      return {
        'Order ID': `#${displayOrderId}`,
        'Customer': `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim(),
        'Email': order.user?.email || 'N/A',
        'Phone': order.shippingAddress?.phone || order.user?.phone || '—',
        'Amount (₹)': order.total || 0,
        'Payment Method': order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Online',
        'Payment Status': paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
        'Transaction ID': order.razorpayPaymentId || '—',
        'Gateway Order ID': order.razorpayOrderId || '—',
        'Date': new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        'Time': new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
    });

    const ws = XLSX.utils.json_to_sheet(xlsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');

    // Auto-adjust column widths
    const colWidths = Object.keys(xlsData[0]).map(key => ({
      wch: Math.max(key.length, ...xlsData.map(row => String(row[key]).length)) + 2
    }));
    ws['!cols'] = colWidths;

    const fileName = `Payments_${paymentStatusFilter === 'All' ? 'All' : paymentStatusFilter}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getStatusBadge = (order) => {
    // If online payment and no transaction ID, it means payment failed
    if (order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId) {
      return <span className={`${type.caption} px-3 py-1 rounded-full bg-red-100 text-red-700`}>Failed</span>;
    }
    
    const status = order.paymentStatus;
    if (status === 'paid') {
      return <span className={`${type.caption} px-3 py-1 rounded-full bg-blue-100 text-blue-700`}>Paid</span>;
    } else if (status === 'unpaid') {
      return <span className={`${type.caption} px-3 py-1 rounded-full bg-yellow-100 text-yellow-700`}>Unpaid</span>;
    } else if (status === 'refund') {
      return <span className={`${type.caption} px-3 py-1 rounded-full bg-purple-100 text-purple-700`}>Refunded</span>;
    } else if (status === 'failed') {
      return <span className={`${type.caption} px-3 py-1 rounded-full bg-red-100 text-red-700`}>Failed</span>;
    } else {
      return <span className={`${type.caption} px-3 py-1 rounded-full bg-gray-100 text-gray-700`}>Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className={`${type.nav}`}>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`${type.h2} text-gray-900`}>Payments</h2>
        <button 
          onClick={downloadXLS}
          disabled={filteredOrders.length === 0}
          className={`${type.nav} flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Download size={16} />
          Download XLS
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className={`${type.bodySm} text-gray-500 mb-1`}>TOTAL ORDERS</p>
          <h3 className={`${type.h1} text-gray-900`}>{totalOrders}</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className={`${type.bodySm} text-gray-500 mb-1`}>PAID REVENUE</p>
          <h3 className={`${type.h1} text-blue-600`}>{formatRupee(paidRevenue)}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search order no / transaction id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${type.bodySm} flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100`}
          />
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className={`${type.bodySm} px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100`}
          >
            <option value="All">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refund">Refunded</option>
            <option value="Failed">Failed</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className={`${type.bodySm} px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100`}
          >
            <option>All Methods</option>
            <option>Online</option>
            <option>COD</option>
          </select>
        </div>
        {paymentStatusFilter !== 'All' && (
          <div className={`${type.caption} mt-3 pt-3 border-t border-gray-100 text-gray-500`}>
            Showing <span className={`${type.label} text-purple-600`}>{filteredOrders.length}</span> order{filteredOrders.length !== 1 ? 's' : ''} with status: <span className={`${type.label}`}>{paymentStatusFilter}</span>
          </div>
        )}
      </div>

      {filteredOrders.length > 0 && (
        <div className="space-y-2">
          <p className={`${type.caption} text-gray-500`}>
            Showing <span className={`${type.label} text-gray-800`}>{listRangeStart}</span>–
            <span className={`${type.label} text-gray-800`}>{listRangeEnd}</span> of{' '}
            <span className={`${type.label} text-gray-800`}>{filteredOrders.length}</span>
            {' '}(page {effectiveListPage} of {totalListPages}, {PAYMENTS_PAGE_SIZE} per page)
          </p>
          {filteredOrders.length > PAYMENTS_PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <span className={`${type.bodySm} text-gray-500`}>
                Page <span className={`${type.label} text-gray-800`}>{effectiveListPage}</span> / {totalListPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={effectiveListPage <= 1}
                  onClick={() => setListPage(1)}
                  className={`${type.label} px-2 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  First
                </button>
                <button
                  type="button"
                  disabled={effectiveListPage <= 1}
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  disabled={effectiveListPage >= totalListPages}
                  onClick={() => setListPage((p) => Math.min(totalListPages, p + 1))}
                  className="p-1.5 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  disabled={effectiveListPage >= totalListPages}
                  onClick={() => setListPage(totalListPages)}
                  className={`${type.label} px-2 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={`${type.captionMedium} px-4 py-3 text-left text-gray-600 uppercase tracking-wider`}>Order ID</th>
                <th className={`${type.captionMedium} px-4 py-3 text-left text-gray-600 uppercase tracking-wider`}>Customer</th>
                <th className={`${type.captionMedium} px-4 py-3 text-left text-gray-600 uppercase tracking-wider`}>Amount</th>
                <th className={`${type.captionMedium} px-4 py-3 text-left text-gray-600 uppercase tracking-wider`}>Method</th>
                <th className={`${type.captionMedium} px-4 py-3 text-left text-gray-600 uppercase tracking-wider`}>Status</th>
                <th className={`${type.captionMedium} px-4 py-3 text-left text-gray-600 uppercase tracking-wider`}>Transaction ID</th>
                <th className={`${type.captionMedium} px-4 py-3 text-left text-gray-600 uppercase tracking-wider`}>Gateway Order ID</th>
                <th className={`${type.captionMedium} px-4 py-3 text-left text-gray-600 uppercase tracking-wider`}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className={`${type.bodySm} px-4 py-8 text-center text-gray-500`}>
                    No payments found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className={`${type.nav} px-4 py-3 text-gray-900`}>
                      #{order.orderNumber || parseInt(order._id.slice(-8), 16)}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`${type.bodySm}`}>
                        <p className={`${type.nav} text-gray-900`}>
                          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </p>
                        <p className={`${type.caption} text-gray-500`}>{order.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className={`${type.bodySm} px-4 py-3 text-gray-900`}>
                      {formatRupee(order.total)}
                    </td>
                    <td className={`${type.bodySm} px-4 py-3 text-gray-600`}>
                      {order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Online'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(order)}
                    </td>
                    <td className={`${type.bodySm} px-4 py-3 text-gray-600`}>
                      {order.razorpayPaymentId || '—'}
                    </td>
                    <td className={`${type.bodySm} px-4 py-3 text-gray-600`}>
                      {order.razorpayOrderId || '—'}
                    </td>
                    <td className={`${type.bodySm} px-4 py-3 text-gray-600`}>
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
