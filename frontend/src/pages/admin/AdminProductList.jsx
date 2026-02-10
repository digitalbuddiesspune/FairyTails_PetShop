import { useState, useEffect } from 'react';
import { categories } from './AdminCategorySelection';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminProductList = ({ categoryData, onBack, onEdit }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [categoryData]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/${categoryData.endpoint}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/${categoryData.endpoint}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProducts(prev => prev.filter(p => p._id !== id));
                setDeleteConfirm(null);
            }
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    // Helper to extract display price
    const getDisplayPrice = (product) => {
        if (product.prices && product.prices.length > 0) {
            return `₹${product.prices[0].discountedPrice}`;
        }
        if (product.variants && product.variants.length > 0) {
            return `₹${product.variants[0].discountedPrice}`;
        }
        if (product.sizes && product.sizes.length > 0) { // Clothes/Accessory
            return `₹${product.sizes[0].discountedPrice}`;
        }
        if (product.discountedPrice || product.discountPrice) {
            return `₹${product.discountedPrice || product.discountPrice}`;
        }
        return 'N/A';
    };

    // Helper to get image
    const getDisplayImage = (product) => {
        if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
        if (typeof product.image === 'string') return product.image;
        if (Array.isArray(product.image) && product.image.length > 0) return product.image[0];
        return 'https://via.placeholder.com/150';
    };

    // Helper to get extra info (Expiry, Size, etc.)
    const getExtraInfo = (product) => {
        if (product.expiryDate) return `Exp: ${new Date(product.expiryDate).toLocaleDateString()}`;
        if (product.sizes) return `Sizes: ${product.sizes.map(s => s.size).join(', ')}`;
        if (product.variants) return `Vol: ${product.variants.map(v => v.volume).join(', ')}`;
        if (product.dimensions) return `${product.dimensions.height}x${product.dimensions.width}`;
        return '';
    };

    const renderDeleteConfirm = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
                <p className="text-sm text-gray-500 mb-6">This will permanently delete <span className="font-semibold text-gray-700">"{deleteConfirm?.productName || deleteConfirm?.name}"</span>.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => handleDeleteProduct(deleteConfirm._id)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn">
            {deleteConfirm && renderDeleteConfirm()}

            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{categoryData.label}</h2>
                    <p className="text-sm text-gray-500">Manage your {categoryData.label.toLowerCase()} inventory</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
                    <span className="text-4xl block mb-2">📦</span>
                    <p className="text-gray-500">No products found in this category.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 p-1 border border-gray-200 shrink-0">
                                                <img src={getDisplayImage(product)} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm line-clamp-1">{product.productName || product.name}</p>
                                                <p className="text-xs text-gray-500">{product.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {product.subCategory || product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{getExtraInfo(product)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{getDisplayPrice(product)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => setDeleteConfirm(product)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProductList;
