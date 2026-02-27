import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
    ExternalLink,
    Eye,
    EyeOff,
    Lock,
    Mail
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [admin, setAdmin] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const profileRef = useRef(null);

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

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        navigate('/admin/signin');
    };

    const handleChangePassword = async () => {
        setPwError('');
        setPwSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPwError('All fields are required');
            return;
        }
        if (newPassword.length < 6) {
            setPwError('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError('New passwords do not match');
            return;
        }

        setPwLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(`${API_BASE}/admin/change-password`, {
                currentPassword,
                newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPwSuccess('Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPwSuccess('');
                }, 1500);
            }
        } catch (err) {
            setPwError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setPwLoading(false);
        }
    };

    const isProductPage = location.pathname.includes('/admin/my-products') || location.pathname.includes('/admin/products');

    const getPageTitle = () => {
        if (location.pathname.includes('/admin/my-products')) return 'My Products';
        if (location.pathname.includes('/admin/products')) return 'Add Product';
        if (location.pathname.includes('/admin/dashboard')) return 'Dashboard';
        if (location.pathname.includes('/admin/categories')) return 'Categories';
        if (location.pathname.includes('/admin/orders')) return 'Orders';
        if (location.pathname.includes('/admin/order-details')) return 'Order Details';
        if (location.pathname.includes('/admin/payments')) return 'Payments';
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

                        {/* Payments */}
                        <button
                            onClick={() => { navigate('/admin/payments'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                location.pathname === '/admin/payments'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Payments
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
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm hover:ring-2 hover:ring-purple-300 transition-all cursor-pointer"
                        >
                            {admin.email?.charAt(0).toUpperCase()}
                        </button>

                        {/* Profile Dropdown */}
                        {profileDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                                            {admin.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800">Admin</p>
                                            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setProfileDropdownOpen(false); setShowPasswordModal(true); setPwError(''); setPwSuccess(''); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Lock size={16} className="text-gray-400" />
                                    Change Password
                                </button>
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowPasswordModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-purple-100 rounded-xl">
                                    <Lock size={20} className="text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPw ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 pr-10"
                                            placeholder="Enter current password"
                                        />
                                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPw ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 pr-10"
                                            placeholder="Enter new password"
                                        />
                                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPw ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 pr-10"
                                            placeholder="Confirm new password"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {pwError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}
                                {pwSuccess && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{pwSuccess}</p>}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => { setShowPasswordModal(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwError(''); setPwSuccess(''); }}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={pwLoading}
                                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {pwLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
