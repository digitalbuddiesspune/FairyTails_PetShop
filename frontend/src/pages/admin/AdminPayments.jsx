import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminPayments = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [methodFilter, setMethodFilter] = useState('All Methods');

  useEffect(() => {
    fetchOrders();
  }, []);

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
  const unpaidCount = orders.filter(o => o.paymentStatus === 'unpaid').length;
  // Count failed: either paymentStatus is 'failed' OR online payment with no transaction ID
  const failedCount = orders.filter(o => 
    o.paymentStatus === 'failed' || 
    (o.paymentMethod !== 'cash_on_delivery' && !o.razorpayPaymentId)
  ).length;

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toString().includes(searchTerm) ||
      order._id?.includes(searchTerm) ||
      order.razorpayOrderId?.includes(searchTerm) ||
      order.razorpayPaymentId?.includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'All Status' || 
      order.paymentStatus === statusFilter.toLowerCase();
    
    const matchesMethod = 
      methodFilter === 'All Methods' || 
      (methodFilter === 'Online' && order.paymentMethod !== 'cash_on_delivery') ||
      (methodFilter === 'COD' && order.paymentMethod === 'cash_on_delivery');
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (order) => {
    // If online payment and no transaction ID, it means payment failed
    if (order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Failed</span>;
    }
    
    const status = order.paymentStatus;
    if (status === 'paid') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Paid</span>;
    } else if (status === 'unpaid') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Unpaid</span>;
    } else if (status === 'failed') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Failed</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Unknown</span>;
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
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track payment details for all orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
          <Download size={16} />
          Download XLS
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">TOTAL ORDERS</p>
          <h3 className="text-3xl font-bold text-gray-900">{totalOrders}</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">PAID REVENUE</p>
          <h3 className="text-3xl font-bold text-green-600">₹{paidRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">UNPAID</p>
          <h3 className="text-3xl font-bold text-yellow-600">{unpaidCount}</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">FAILED</p>
          <h3 className="text-3xl font-bold text-red-600">{failedCount}</h3>
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
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>Unpaid</option>
            <option>Failed</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          >
            <option>All Methods</option>
            <option>Online</option>
            <option>COD</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gateway Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500 text-sm">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      #{order.orderNumber || parseInt(order._id.slice(-8), 16)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">{order.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ₹{order.total?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Online'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(order)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.razorpayPaymentId || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.razorpayOrderId || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
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
