import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_API;
const USERS_PAGE_SIZE = 100;

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [sortOrder, setSortOrder] = useState('default'); // 'default', 'asc', 'desc'
    const [listPage, setListPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setListPage(1);
    }, [sortOrder]);

    const fetchUsers = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('admin');
                window.location.href = '/admin/signin';
                return;
            }
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.filter(user => user._id !== id));
                setDeleteConfirm(null);
            }
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    // ─── Sort Users by Total Ordered ───
    const sortedUsers = useMemo(() => {
        if (sortOrder === 'default') {
            return users;
        }
        return [...users].sort((a, b) => {
            const aTotal = a.totalOrderedQuantity || 0;
            const bTotal = b.totalOrderedQuantity || 0;
            if (sortOrder === 'asc') {
                return aTotal - bTotal;
            }
            return bTotal - aTotal;
        });
    }, [users, sortOrder]);

    const totalListPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PAGE_SIZE));
    const effectiveListPage = Math.min(listPage, totalListPages);

    useEffect(() => {
        const tp = Math.max(1, Math.ceil(sortedUsers.length / USERS_PAGE_SIZE));
        setListPage((p) => Math.min(p, tp));
    }, [sortedUsers.length]);

    const paginatedUsers = useMemo(() => {
        const start = (effectiveListPage - 1) * USERS_PAGE_SIZE;
        return sortedUsers.slice(start, start + USERS_PAGE_SIZE);
    }, [sortedUsers, effectiveListPage]);

    const listRangeStart = sortedUsers.length === 0 ? 0 : (effectiveListPage - 1) * USERS_PAGE_SIZE + 1;
    const listRangeEnd = sortedUsers.length === 0 ? 0 : Math.min(effectiveListPage * USERS_PAGE_SIZE, sortedUsers.length);

    // ─── Delete Confirmation Modal ───
    const renderDeleteConfirm = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center animate-fadeIn">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
                <p className="text-sm text-gray-500 mb-6">This will permanently delete <span className="font-semibold text-gray-700">{deleteConfirm?.name}</span>. This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => handleDeleteUser(deleteConfirm._id)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn">
            {deleteConfirm && renderDeleteConfirm()}

            {/* Filter/Sort Section */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Sort by Total Orders:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors cursor-pointer"
                    >
                        <option value="default">Default</option>
                        <option value="asc">Ascending (Low to High)</option>
                        <option value="desc">Descending (High to Low)</option>
                    </select>
                </div>
            </div>

            {!loading && sortedUsers.length > 0 && (
                <div className="mb-4 space-y-2">
                    <p className="text-xs text-gray-500">
                        Showing <span className="font-semibold text-gray-800">{listRangeStart}</span>–
                        <span className="font-semibold text-gray-800">{listRangeEnd}</span> of{' '}
                        <span className="font-semibold text-gray-800">{sortedUsers.length}</span>
                        {' '}(page {effectiveListPage} of {totalListPages}, {USERS_PAGE_SIZE} per page)
                    </p>
                    {sortedUsers.length > USERS_PAGE_SIZE && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                            <span className="text-[11px] text-gray-500">
                                Page <span className="font-semibold text-gray-800">{effectiveListPage}</span> / {totalListPages}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={effectiveListPage <= 1}
                                    onClick={() => setListPage(1)}
                                    className="px-2 py-1 rounded-md text-[11px] font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
                                    className="px-2 py-1 rounded-md text-[11px] font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <span className="text-5xl mb-4 block">👥</span>
                    <p className="text-gray-500 text-lg font-medium">No users found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Total Ordered</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">ID: {user._id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {user.totalOrderedQuantity || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setDeleteConfirm(user)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
        </div>
    );
};

export default AdminUsers;
