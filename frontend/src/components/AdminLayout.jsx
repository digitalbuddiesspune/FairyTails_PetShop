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
    PawPrint,
    ChevronDown,
    PackageSearch,
    PlusCircle,
    ExternalLink
} from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [admin, setAdmin] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);

    useEffect(() => {
        const adminData = localStorage.getItem('admin');
        const adminToken = localStorage.getItem('adminToken');
        if (!adminData || !adminToken) {
            navigate('/admin/signin');
            return;
        }
        setAdmin(JSON.parse(adminData));
    }, [navigate]);

    // Auto-expand products accordion if on a product page
    useEffect(() => {
        if (location.pathname.includes('/admin/my-products') || location.pathname.includes('/admin/products')) {
            setProductsOpen(true);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        navigate('/admin/signin');
    };

    const isProductPage = location.pathname.includes('/admin/my-products') || location.pathname.includes('/admin/products');

    const getPageTitle = () => {
        if (location.pathname.includes('/admin/my-products')) return 'My Products';
        if (location.pathname.includes('/admin/products')) return 'Add Product';
        if (location.pathname.includes('/admin/dashboard')) return 'Dashboard';
        if (location.pathname.includes('/admin/categories')) return 'Categories';
        if (location.pathname.includes('/admin/orders')) return 'Orders';
        if (location.pathname.includes('/admin/users')) return 'Users';
        if (location.pathname.includes('/admin/settings')) return 'Settings';
        return 'Dashboard';
    };

    if (!admin) return null;

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 flex flex-col h-screen lg:h-full shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
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
<nav className="p-3 flex-1 overflow-y-auto no-scrollbar">                    <div className="space-y-1">
                        {/* Dashboard */}
                        <button
                            onClick={() => { navigate('/admin/dashboard'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                location.pathname === '/admin/dashboard'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </button>

                        {/* Products - Accordion */}
                        <div>
                            <button
                                onClick={() => setProductsOpen(!productsOpen)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    isProductPage
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Package size={20} />
                                    Products
                                </div>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            <div className={`overflow-hidden transition-all duration-200 ${productsOpen ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                                <div className="ml-4 space-y-1">
                                    <button
                                        onClick={() => { navigate('/admin/my-products'); setSidebarOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            location.pathname === '/admin/my-products'
                                                ? 'bg-purple-500/10 text-purple-300'
                                                : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <PackageSearch size={16} />
                                        My Products
                                    </button>
                                    <button
                                        onClick={() => { navigate('/admin/products'); setSidebarOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            location.pathname === '/admin/products'
                                                ? 'bg-purple-500/10 text-purple-300'
                                                : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <PlusCircle size={16} />
                                        Add Product
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                       

                        {/* Orders */}
                        <button
                            onClick={() => { navigate('/admin/orders'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                location.pathname === '/admin/orders'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <ShoppingBag size={20} />
                            Orders
                        </button>

                        {/* Users */}
                        <button
                            onClick={() => { navigate('/admin/users'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                location.pathname === '/admin/users'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Users size={20} />
                            Users
                        </button>

                        {/* Settings */}
                        

                        {/* Visit Site */}
                        <button
                            onClick={() => { window.open('/', '_blank'); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                        >
                            <ExternalLink size={20} />
                            Visit Site
                        </button>
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
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                            <Menu size={20} className="text-gray-600" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">
                            {getPageTitle()}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 hidden sm:inline">Welcome, <span className="font-semibold text-gray-700">Admin</span></span>
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                            {admin.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content — my-products uses internal scroll; other pages scroll normally */}
                <main className={`flex-1 min-h-0 p-4 sm:p-6 ${
                    location.pathname === '/admin/my-products'
                        ? 'flex flex-col overflow-hidden'
                        : 'overflow-y-auto'
                }`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
