import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [productForm, setProductForm] = useState({
        productName: '',
        brand: '',
        category: 'Dog',
        subCategory: 'Dry Food',
        prices: [{ capacity: '', mrp: '', discountedPrice: '' }],
        details: [''],
        keyFeatures: [''],
        flavours: [''],
        nutrients: [''],
        healthBenefits: [''],
        images: [''],
        expiryDate: ''
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/food?limit=100`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setProductsLoading(false);
        }
    };

    const resetForm = () => {
        setProductForm({
            productName: '',
            brand: '',
            category: 'Dog',
            subCategory: 'Dry Food',
            prices: [{ capacity: '', mrp: '', discountedPrice: '' }],
            details: [''],
            keyFeatures: [''],
            flavours: [''],
            nutrients: [''],
            healthBenefits: [''],
            images: [''],
            expiryDate: ''
        });
        setFormError('');
    };

    const openAddForm = () => {
        resetForm();
        setEditingProduct(null);
        setShowAddForm(true);
    };

    const openEditForm = (product) => {
        setProductForm({
            productName: product.productName || '',
            brand: product.brand || '',
            category: product.category || 'Dog',
            subCategory: product.subCategory || 'Dry Food',
            prices: product.prices?.length ? product.prices.map(p => ({ capacity: p.capacity, mrp: p.mrp, discountedPrice: p.discountedPrice })) : [{ capacity: '', mrp: '', discountedPrice: '' }],
            details: product.details?.length ? [...product.details] : [''],
            keyFeatures: product.keyFeatures?.length ? [...product.keyFeatures] : [''],
            flavours: product.flavours?.length ? [...product.flavours] : [''],
            nutrients: product.nutrients?.length ? [...product.nutrients] : [''],
            healthBenefits: product.healthBenefits?.length ? [...product.healthBenefits] : [''],
            images: product.images?.length ? [...product.images] : [''],
            expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
        });
        setEditingProduct(product);
        setShowAddForm(true);
        setFormError('');
    };

    const handleFormChange = (field, value) => {
        setProductForm(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayFieldChange = (field, index, value) => {
        setProductForm(prev => {
            const arr = [...prev[field]];
            arr[index] = value;
            return { ...prev, [field]: arr };
        });
    };

    const addArrayField = (field) => {
        setProductForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayField = (field, index) => {
        setProductForm(prev => {
            const arr = prev[field].filter((_, i) => i !== index);
            return { ...prev, [field]: arr.length ? arr : [''] };
        });
    };

    const handlePriceChange = (index, key, value) => {
        setProductForm(prev => {
            const prices = [...prev.prices];
            prices[index] = { ...prices[index], [key]: value };
            return { ...prev, prices };
        });
    };

    const addPriceRow = () => {
        setProductForm(prev => ({ ...prev, prices: [...prev.prices, { capacity: '', mrp: '', discountedPrice: '' }] }));
    };

    const removePriceRow = (index) => {
        setProductForm(prev => {
            const prices = prev.prices.filter((_, i) => i !== index);
            return { ...prev, prices: prices.length ? prices : [{ capacity: '', mrp: '', discountedPrice: '' }] };
        });
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        setFormError('');

        // Validation
        if (!productForm.productName.trim()) return setFormError('Product name is required');
        if (!productForm.brand.trim()) return setFormError('Brand is required');
        if (!productForm.images[0]?.trim()) return setFormError('At least one image URL is required');
        if (!productForm.prices[0]?.capacity?.trim()) return setFormError('At least one price option is required');
        if (!productForm.expiryDate) return setFormError('Expiry date is required');

        // Clean up data
        const payload = {
            ...productForm,
            prices: productForm.prices.filter(p => p.capacity).map(p => ({
                capacity: p.capacity,
                mrp: Number(p.mrp),
                discountedPrice: Number(p.discountedPrice)
            })),
            details: productForm.details.filter(d => d.trim()),
            keyFeatures: productForm.keyFeatures.filter(k => k.trim()),
            flavours: productForm.flavours.filter(f => f.trim()),
            nutrients: productForm.nutrients.filter(n => n.trim()),
            healthBenefits: productForm.healthBenefits.filter(h => h.trim()),
            images: productForm.images.filter(i => i.trim()),
            expiryDate: new Date(productForm.expiryDate)
        };

        try {
            const token = localStorage.getItem('adminToken');
            let res;

            if (editingProduct) {
                res = await fetch(`${API_BASE}/food/${editingProduct._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_BASE}/food`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();
            if (data.success) {
                setShowAddForm(false);
                resetForm();
                setEditingProduct(null);
                fetchProducts();
            } else {
                setFormError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setFormError('Network error. Please try again.');
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/food/${id}`, {
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

    // ─── Add/Edit Product Form Modal ───
    const renderProductForm = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={() => { setShowAddForm(false); setEditingProduct(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmitProduct} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {formError && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200">
                            {formError}
                        </div>
                    )}

                    {/* Product Name & Brand */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name *</label>
                            <input type="text" value={productForm.productName} onChange={(e) => handleFormChange('productName', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" placeholder="e.g. Royal Canin Dog Food" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand *</label>
                            <input type="text" value={productForm.brand} onChange={(e) => handleFormChange('brand', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" placeholder="e.g. Royal Canin" />
                        </div>
                    </div>

                    {/* Category & SubCategory */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                            <select value={productForm.category} onChange={(e) => handleFormChange('category', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white">
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sub Category *</label>
                            <select value={productForm.subCategory} onChange={(e) => handleFormChange('subCategory', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white">
                                <option value="Dry Food">Dry Food</option>
                                <option value="Wet Food">Wet Food</option>
                                <option value="Treats">Treats</option>
                            </select>
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date *</label>
                        <input type="date" value={productForm.expiryDate} onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                    </div>

                    {/* Prices */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Prices *</label>
                            <button type="button" onClick={addPriceRow} className="text-xs font-semibold text-purple-600 hover:text-purple-700">+ Add Price</button>
                        </div>
                        <div className="space-y-2">
                            {productForm.prices.map((price, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input type="text" placeholder="Capacity (e.g. 1kg)" value={price.capacity} onChange={(e) => handlePriceChange(i, 'capacity', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                                    <input type="number" placeholder="MRP" value={price.mrp} onChange={(e) => handlePriceChange(i, 'mrp', e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                                    <input type="number" placeholder="Sale Price" value={price.discountedPrice} onChange={(e) => handlePriceChange(i, 'discountedPrice', e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                                    {productForm.prices.length > 1 && (
                                        <button type="button" onClick={() => removePriceRow(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image URLs */}
                    <ArrayField label="Image URLs *" field="images" values={productForm.images} onChange={handleArrayFieldChange} onAdd={addArrayField} onRemove={removeArrayField} placeholder="https://example.com/image.jpg" />

                    {/* Flavours */}
                    <ArrayField label="Flavours" field="flavours" values={productForm.flavours} onChange={handleArrayFieldChange} onAdd={addArrayField} onRemove={removeArrayField} placeholder="e.g. Chicken" />

                    {/* Details */}
                    <ArrayField label="Details" field="details" values={productForm.details} onChange={handleArrayFieldChange} onAdd={addArrayField} onRemove={removeArrayField} placeholder="Product detail..." />

                    {/* Key Features */}
                    <ArrayField label="Key Features" field="keyFeatures" values={productForm.keyFeatures} onChange={handleArrayFieldChange} onAdd={addArrayField} onRemove={removeArrayField} placeholder="Feature..." />

                    {/* Nutrients */}
                    <ArrayField label="Nutrients" field="nutrients" values={productForm.nutrients} onChange={handleArrayFieldChange} onAdd={addArrayField} onRemove={removeArrayField} placeholder="e.g. Protein 26%" />

                    {/* Health Benefits */}
                    <ArrayField label="Health Benefits" field="healthBenefits" values={productForm.healthBenefits} onChange={handleArrayFieldChange} onAdd={addArrayField} onRemove={removeArrayField} placeholder="e.g. Strong bones" />
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                    <button type="button" onClick={() => { setShowAddForm(false); setEditingProduct(null); resetForm(); }}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmitProduct}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg">
                        {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                </div>
            </div>
        </div>
    );

    // ─── Delete Confirmation Modal ───
    const renderDeleteConfirm = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
                <p className="text-sm text-gray-500 mb-6">This will permanently delete <span className="font-semibold text-gray-700">"{deleteConfirm?.productName}"</span>. This action cannot be undone.</p>
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
            {/* Modals */}
            {showAddForm && renderProductForm()}
            {deleteConfirm && renderDeleteConfirm()}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                    <p className="text-sm text-gray-500 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
                </div>
                <button onClick={openAddForm} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Product
                </button>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <span className="text-5xl mb-4 block">🛍️</span>
                    <p className="text-gray-500 text-lg font-medium">No products yet</p>
                    <p className="text-gray-400 text-sm mt-1">Click "Add Product" to add your first product</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                            {/* Product Image */}
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                <img
                                    src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                                    alt={product.productName}
                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.category === 'Dog' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                        }`}>
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{product.brand}</p>
                                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">{product.productName}</h3>

                                {/* Price */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg font-bold text-purple-600">₹{product.prices?.[0]?.discountedPrice}</span>
                                    {product.prices?.[0]?.mrp > product.prices?.[0]?.discountedPrice && (
                                        <span className="text-sm text-gray-400 line-through">₹{product.prices?.[0]?.mrp}</span>
                                    )}
                                    <span className="text-xs text-gray-400">/ {product.prices?.[0]?.capacity}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditForm(product)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(product)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
         .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
};

// ─── Array Field Component ───
const ArrayField = ({ label, field, values, onChange, onAdd, onRemove, placeholder }) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <button type="button" onClick={() => onAdd(field)} className="text-xs font-semibold text-purple-600 hover:text-purple-700">+ Add</button>
        </div>
        <div className="space-y-2">
            {values.map((val, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <input type="text" value={val} onChange={(e) => onChange(field, i, e.target.value)} placeholder={placeholder}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                    {values.length > 1 && (
                        <button type="button" onClick={() => onRemove(field, i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default AdminProducts;
