import { useState, useEffect, useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    ShoppingBag,
    Clock,
    CheckCircle,
    XCircle,
    Users,
    Package,
    TrendingUp,
    CreditCard,
    X,
    Eye
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayConfirmed: 0,
        todayDelivered: 0,
        todayCancelled: 0,
        totalUsers: 0,
        totalProducts: 0
    });
    const [chartData, setChartData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [allOrders, setAllOrders] = useState([]);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalOrders, setModalOrders] = useState([]);

    const fetchDashboardData = useCallback(async (showLoader = false) => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        if (showLoader) setLoading(true);

        try {
            // Fetch product counts from ALL categories
            const endpoints = ['food', 'clothes', 'grooming-essentials', 'health-supplements', 'houses', 'toys', 'accessories'];
            const productResults = await Promise.allSettled(
                endpoints.map(ep => fetch(`${API_BASE}/${ep}?limit=1`).then(r => r.json()))
            );
            const totalProducts = productResults.reduce((sum, r) => {
                if (r.status === 'fulfilled') {
                    const d = r.value;
                    return sum + (d.total || d.count || (Array.isArray(d.data) ? d.data.length : 0));
                }
                return sum;
            }, 0);

            let userCount = 0;
            try {
                const usersRes = await fetch(`${API_BASE}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (usersRes.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('admin');
                    window.location.href = '/admin/signin';
                    return;
                }
                const usersData = await usersRes.json();
                userCount = usersData.count || 0;
            } catch {}

            // Fetch all orders
            let orders = [];
            try {
                const ordersRes = await fetch(`${API_BASE}/admin/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (ordersRes.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('admin');
                    window.location.href = '/admin/signin';
                    return;
                }
                const ordersData = await ordersRes.json();
                if (ordersData.success) {
                    orders = ordersData.data || [];
                }
            } catch {}

            setAllOrders(orders);
            processOrderData(orders, totalProducts, userCount);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            processOrderData([], 0, 0);
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    // Initial fetch + auto-refresh every 10 seconds
    useEffect(() => {
        fetchDashboardData(true);
        const interval = setInterval(() => fetchDashboardData(false), 10000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const processOrderData = (orders, productCount, userCount) => {
        const today = new Date();
        const todayDateString = today.toDateString();

        let todayOrders = 0;
        let todayConfirmed = 0;
        let todayDelivered = 0;
        let todayCancelled = 0;

        // Initialize all 12 months with 0 for selected year
        const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = monthsOrder.reduce((acc, month) => {
            acc[month] = { name: month, revenue: 0, orders: 0 };
            return acc;
        }, {});

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const dateString = orderDate.toDateString();
            const orderYear = orderDate.getFullYear();
            const monthKey = orderDate.toLocaleString('default', { month: 'short' });

            // Today-specific stats
            if (dateString === todayDateString) {
                todayOrders++;
                if (order.status === 'placed') todayConfirmed++;
                if (order.status === 'delivered') todayDelivered++;
                if (order.status === 'cancelled') todayCancelled++;
            }

            // Monthly Aggregation
            if (orderYear === selectedYear && monthlyData[monthKey]) {
                monthlyData[monthKey].revenue += order.total || 0;
                monthlyData[monthKey].orders += 1;
            }
        });

        // Convert to array in correct order
        const chartArray = monthsOrder.map(month => monthlyData[month]);

        setStats({
            todayOrders,
            todayConfirmed,
            todayDelivered,
            todayCancelled,
            totalUsers: userCount,
            totalProducts: productCount
        });

        setChartData(chartArray);
    };

    // Filter orders for each stat card click
    const handleStatCardClick = (type) => {
        const today = new Date();
        const todayDateString = today.toDateString();
        let filtered = [];
        let title = '';

        switch (type) {
            case 'todayOrders':
                title = "Today's Orders";
                filtered = allOrders.filter(o => new Date(o.createdAt).toDateString() === todayDateString);
                break;
            case 'confirmed':
                title = "Today's Confirmed Orders";
                filtered = allOrders.filter(o =>
                    new Date(o.createdAt).toDateString() === todayDateString && o.status === 'placed'
                );
                break;
            case 'todayDelivered':
                title = "Today's Delivered Orders";
                filtered = allOrders.filter(o =>
                    new Date(o.createdAt).toDateString() === todayDateString && o.status === 'delivered'
                );
                break;
            case 'todayCancelled':
                title = "Today's Cancelled Orders";
                filtered = allOrders.filter(o =>
                    new Date(o.createdAt).toDateString() === todayDateString && o.status === 'cancelled'
                );
                break;
            default:
                return;
        }

        setModalTitle(title);
        setModalOrders(filtered);
        setModalOpen(true);
    };

    const formatDateTime = (dateString) => {
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

    const getStatusLabel = (status) => {
        const labels = { placed: 'Confirm', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
        return labels[status] || status;
    };

    const getStatusBadge = (status) => {
        const map = {
            placed: 'bg-blue-100 text-blue-700',
            processing: 'bg-yellow-100 text-yellow-700',
            shipped: 'bg-indigo-100 text-indigo-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-700'}`}>
                {getStatusLabel(status)}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const map = {
            paid: 'bg-green-100 text-green-700',
            unpaid: 'bg-yellow-100 text-yellow-700',
            failed: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${map[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    // Get today's orders for Recent Orders section
    const todayDateString = new Date().toDateString();
    const recentOrders = allOrders.filter(o => new Date(o.createdAt).toDateString() === todayDateString);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
            </div>

            {/* Today's Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Orders"
                    value={stats.todayOrders}
                    icon={<ShoppingBag className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => handleStatCardClick('todayOrders')}
                />
                <StatCard
                    title="Confirmed"
                    value={stats.todayConfirmed}
                    icon={<Clock className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-r from-orange-400 to-orange-500"
                    onClick={() => handleStatCardClick('confirmed')}
                />
                <StatCard
                    title="Today's Delivered"
                    value={stats.todayDelivered}
                    icon={<CheckCircle className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-r from-emerald-500 to-emerald-600"
                    onClick={() => handleStatCardClick('todayDelivered')}
                />
                <StatCard
                    title="Today's Cancelled"
                    value={stats.todayCancelled}
                    icon={<XCircle className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-r from-red-500 to-red-600"
                    onClick={() => handleStatCardClick('todayCancelled')}
                />
            </div>

            {/* Secondary Stats (Users & Products) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalUsers}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                        <Users className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Products</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</h3>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-xl">
                        <Package className="w-6 h-6 text-pink-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Revenue (Est.)</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">
                            ₹{chartData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                        <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Bar Chart Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Orders & Sales Graph</h3>
                        <p className="text-sm text-gray-500">Monthly breakdown of performance</p>
                    </div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {[2023, 2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="h-[280px] sm:h-[350px] lg:h-[400px] w-full min-w-[280px] min-h-[280px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={280} initialDimension={{ width: 400, height: 350 }}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#8B5CF6"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#10B981"
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ fill: '#F3F4F6' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar yAxisId="right" dataKey="orders" name="Total Orders" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                            <Bar yAxisId="left" dataKey="revenue" name="Total Sales Amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Orders (Today) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                        <p className="text-sm text-gray-500">Orders placed today</p>
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                        {recentOrders.length} order{recentOrders.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="text-center py-10">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No orders placed today yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-semibold text-purple-600">
                                            #{order.orderNumber || parseInt(order._id.slice(-8), 16)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-800">
                                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-400">{order.user?.email || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                            ₹{order.total?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getPaymentBadge(order.paymentStatus)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal - Table Format */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setModalOpen(false)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{modalTitle}</h3>
                                <p className="text-sm text-gray-500">{modalOrders.length} order{modalOrders.length !== 1 ? 's' : ''} found</p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto">
                            {modalOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400">No orders found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[900px]">
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
                                            {modalOrders.map(order => {
                                                const isPaymentFailed = order.paymentStatus === 'failed' ||
                                                    (order.paymentMethod !== 'cash_on_delivery' && !order.razorpayPaymentId);
                                                const userName = order.shippingAddress
                                                    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                                                    : (order.user?.name || 'Unknown');
                                                const userEmail = order.user?.email || 'N/A';
                                                const userPhone = order.shippingAddress?.phone || order.user?.phone || '—';
                                                const totalQty = (order.items || []).reduce((s, i) => s + i.quantity, 0);
                                                const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);

                                                return (
                                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <p className="text-xs font-bold text-gray-800">#{displayOrderId}</p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-xs font-semibold text-gray-800">{userName}</p>
                                                            <p className="text-[10px] text-gray-400">{userEmail}</p>
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
                                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-600 border-red-200">Failed</span>
                                                            ) : (
                                                                getStatusBadge(order.status)
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {isPaymentFailed ? (
                                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-600 border-red-200">Failed</span>
                                                            ) : (
                                                                getPaymentBadge(order.paymentStatus)
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
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, onClick }) => (
    <div
        onClick={onClick}
        className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer group"
    >
        <div className="flex items-center justify-between z-10 relative">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
        <p className="text-xs text-purple-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to view details →</p>
        {/* Decorative background element */}
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 ${color}`} />
    </div>
);

export default AdminDashboard;