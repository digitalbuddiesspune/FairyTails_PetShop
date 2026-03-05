import { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, X, Check, Star } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminTestimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        comment: '',
        rating: 5,
        isActive: true,
        order: 0
    });

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/testimonials`, {
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
                setTestimonials(data.data);
            }
        } catch (err) {
            console.error('Error fetching testimonials:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingTestimonial 
                ? `${API_BASE}/admin/testimonials/${editingTestimonial._id}`
                : `${API_BASE}/admin/testimonials`;
            
            const method = editingTestimonial ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            if (data.success) {
                fetchTestimonials();
                setShowModal(false);
                resetForm();
            }
        } catch (err) {
            console.error('Error saving testimonial:', err);
        }
    };

    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({
            name: testimonial.name,
            comment: testimonial.comment,
            rating: testimonial.rating,
            isActive: testimonial.isActive,
            order: testimonial.order || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchTestimonials();
                setDeleteConfirm(null);
            }
        } catch (err) {
            console.error('Error deleting testimonial:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            comment: '',
            rating: 5,
            isActive: true,
            order: 0
        });
        setEditingTestimonial(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
        ));
    };

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
                    Add Testimonial
                </button>
            </div>

            {testimonials.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <span className="text-5xl mb-4 block">💬</span>
                    <p className="text-gray-500 text-lg font-medium">No testimonials yet. Add one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{testimonial.name}</h3>
                                    <div className="flex items-center gap-1 mb-2">
                                        {renderStars(testimonial.rating)}
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    testimonial.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {testimonial.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-4">{testimonial.comment}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                <span>Order: {testimonial.order}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(testimonial)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(testimonial)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                            </h3>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Comment/Testimonial *
                                </label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                                    placeholder="Enter testimonial comment"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Rating (Stars) *
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                size={32}
                                                className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">({formData.rating} stars)</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
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
                                    {editingTestimonial ? 'Update' : 'Add'} Testimonial
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
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Testimonial?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                This will permanently delete this testimonial. This action cannot be undone.
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

export default AdminTestimonials;
