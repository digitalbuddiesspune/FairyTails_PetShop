import { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, X, Check } from 'lucide-react';
import AdminImageUrlField from '../../components/admin/AdminImageUrlField';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminBanner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formError, setFormError] = useState('');
    
    const [formData, setFormData] = useState({
        image: '',
        deviceType: 'desktop'
    });

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/banners`, {
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
                setBanners(data.data);
            }
        } catch (err) {
            console.error('Error fetching banners:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingBanner 
                ? `${API_BASE}/admin/banners/${editingBanner._id}`
                : `${API_BASE}/admin/banners`;
            
            const method = editingBanner ? 'PUT' : 'POST';
            
            // Send only image and deviceType, with defaults for other fields
            const payload = {
                image: formData.image,
                deviceType: formData.deviceType,
                link: '#',
                isActive: true,
                order: 0
            };
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            if (data.success) {
                fetchBanners();
                setShowModal(false);
                resetForm();
            }
        } catch (err) {
            console.error('Error saving banner:', err);
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            image: banner.image,
            deviceType: banner.deviceType
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchBanners();
                setDeleteConfirm(null);
            }
        } catch (err) {
            console.error('Error deleting banner:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            image: '',
            deviceType: 'desktop'
        });
        setEditingBanner(null);
        setFormError('');
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const mobileBanners = banners.filter(b => b.deviceType === 'mobile').sort((a, b) => a.order - b.order);
    const desktopBanners = banners.filter(b => b.deviceType === 'desktop').sort((a, b) => a.order - b.order);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-end mb-6">
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus size={18} />
                    Add Banner
                </button>
            </div>

            {/* Desktop Banners */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Desktop Banners</h3>
                {desktopBanners.length === 0 ? (
                    <p className="text-gray-500 text-sm">No desktop banners yet. Add one to get started.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {desktopBanners.map((banner) => (
                            <div key={banner._id} className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="relative aspect-[1920/600] bg-gray-100 max-h-[150px]">
                                    <img
                                        src={banner.image}
                                        alt="Banner"
                                        className="w-full h-full object-cover"
                                    />
                                    {!banner.isActive && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white font-bold">Inactive</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Order: {banner.order}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            banner.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(banner)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Banners */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mobile Banners</h3>
                {mobileBanners.length === 0 ? (
                    <p className="text-gray-500 text-sm">No mobile banners yet. Add one to get started.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {mobileBanners.map((banner) => (
                            <div key={banner._id} className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="relative bg-gray-100 h-[150px] w-full">
                                    <img
                                        src={banner.image}
                                        alt="Banner"
                                        className="w-full h-full object-cover"
                                    />
                                    {!banner.isActive && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white font-bold">Inactive</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Order: {banner.order}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            banner.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(banner)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingBanner ? 'Edit Banner' : 'Add Banner'}
                            </h3>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{formError}</p>
                            )}
                            <AdminImageUrlField
                                label="Banner Image URL"
                                value={formData.image}
                                onChange={(image) => setFormData({ ...formData, image })}
                                onError={setFormError}
                                required
                                placeholder="https://cdn.fairytailspetshop.com/..."
                                previewWrapperClassName={
                                    formData.deviceType === 'mobile'
                                        ? 'w-40 h-40'
                                        : 'w-full max-w-md aspect-[1920/600]'
                                }
                            />
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.deviceType}
                                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    required
                                >
                                    <option value="desktop">Desktop</option>
                                    <option value="mobile">Mobile</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    {editingBanner ? 'Update' : 'Add'} Banner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Banner?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                This will permanently delete this banner. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm._id)}
                                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
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

export default AdminBanner;
