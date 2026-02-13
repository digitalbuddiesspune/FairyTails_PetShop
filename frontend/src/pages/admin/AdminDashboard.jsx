import { useState, useEffect } from 'react';
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
    CreditCard
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayPending: 0,
        todayDelivered: 0,
        todayCancelled: 0,
        totalUsers: 0,
        totalProducts: 0
    });
    const [chartData, setChartData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('adminToken');

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
                    const usersData = await usersRes.json();
                    userCount = usersData.count || 0;
                } catch {}

                // Fetch all orders
                let orders = [];
                try {
                    const ordersRes = await fetch(`${API_BASE}/admin/orders`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const ordersData = await ordersRes.json();
                    if (ordersData.success) {
                        orders = ordersData.data || [];
                    }
                } catch {}

                processOrderData(orders, totalProducts, userCount);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                processOrderData([], 0, 0);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedYear]);

    const processOrderData = (orders, productCount, userCount) => {
        const today = new Date();
        const todayDateString = today.toDateString();

        let todayOrders = 0;
        let todayPending = 0;
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

    const isPending =
        order.status === 'placed' ||
        order.status === 'processing' ||
        order.status === 'shipped';

    // ⭐ Pending = ANY date
    if (isPending) {
        todayPending++;
    }

    // ⭐ Today-specific stats
    if (dateString === todayDateString) {
        todayOrders++;

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
            todayPending,
            todayDelivered,
            todayCancelled,
            totalUsers: userCount,
            totalProducts: productCount
        });

        setChartData(chartArray);
    };

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
                />
                <StatCard
                    title="Pending"
                    value={stats.todayPending}
                    icon={<Clock className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-r from-orange-400 to-orange-500"
                />
                <StatCard
                    title="Today's Delivered"
                    value={stats.todayDelivered}
                    icon={<CheckCircle className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-r from-emerald-500 to-emerald-600"
                />
                <StatCard
                    title="Today's Cancelled"
                    value={stats.todayCancelled}
                    icon={<XCircle className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-r from-red-500 to-red-600"
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

const StatCard = ({ title, value, icon, color }) => (
    <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex items-center justify-between z-10 relative">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${color}`}>
                {icon}
            </div>
        </div>
        {/* Decorative background element */}
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 ${color}`} />
    </div>
);

export default AdminDashboard;
