import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    List,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Menu,
    PawPrint
} from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [admin, setAdmin] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const adminData = localStorage.getItem('admin');
        const adminToken = localStorage.getItem('adminToken');
        if (!adminData || !adminToken) {
            navigate('/admin/signin');
            return;
        }
        setAdmin(JSON.parse(adminData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        navigate('/admin/signin');
    };

    const menuItems = [
        { id: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: '/admin/products', label: 'Products', icon: <Package size={20} /> },
        { id: '/admin/categories', label: 'Categories', icon: <List size={20} /> },
        { id: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
        { id: '/admin/users', label: 'Users', icon: <Users size={20} /> },
        { id: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo */}
                <div className="p-5 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                            <PawPrint size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm">FairyTails</h1>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Admin Info */}
                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-300 font-bold text-sm">
                            {admin.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{admin.email}</p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="p-3 flex-1">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    navigate(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === item.id
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-700/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                            <Menu size={20} className="text-gray-600" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900 capitalize">
                            {menuItems.find(item => item.id === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 hidden sm:inline">Welcome, <span className="font-semibold text-gray-700">Admin</span></span>
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                            {admin.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
