import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import ProductForm from './ProductForm';

const API_BASE = import.meta.env.VITE_BACKEND_API;

// ─── 7 Category configs with correct backend endpoints ───
const CATEGORIES = [
  { id: 'food', label: 'Foods', icon: '🍖', color: 'bg-orange-100 border-orange-300 text-orange-700', activeColor: 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200', endpoint: 'food', type: 'food' },
  { id: 'clothes', label: 'Clothes', icon: '👕', color: 'bg-blue-100 border-blue-300 text-blue-700', activeColor: 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200', endpoint: 'clothes', type: 'clothes' },
  { id: 'grooming', label: 'Grooming Essentials', icon: '✂️', color: 'bg-cyan-100 border-cyan-300 text-cyan-700', activeColor: 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-200', endpoint: 'grooming-essentials', type: 'grooming' },
  { id: 'health', label: 'Health Supplements', icon: '💊', color: 'bg-green-100 border-green-300 text-green-700', activeColor: 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200', endpoint: 'health-supplements', type: 'health' },
  { id: 'houses', label: 'Houses', icon: '🏠', color: 'bg-purple-100 border-purple-300 text-purple-700', activeColor: 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-200', endpoint: 'houses', type: 'house' },
  { id: 'toys', label: 'Toys', icon: '🧸', color: 'bg-yellow-100 border-yellow-300 text-yellow-700', activeColor: 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-200', endpoint: 'toys', type: 'toy' },
  { id: 'accessories', label: 'Accessories', icon: '🎀', color: 'bg-pink-100 border-pink-300 text-pink-700', activeColor: 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-200', endpoint: 'accessories', type: 'accessory' },
];

const AdminMyProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]); // Default: Food
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products when category changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${selectedCategory.endpoint}?limit=200`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Normalize product fields for display ───
  const getProductName = (p) => p.productName || p.name || 'N/A';
  const getProductBrand = (p) => p.brand || '';

  const getProductPrice = (p) => {
    if (p.prices?.length) return { sale: p.prices[0].discountedPrice, mrp: p.prices[0].mrp };
    if (p.sizes?.length) return { sale: p.sizes[0].discountedPrice, mrp: p.sizes[0].mrp };
    if (p.variants?.length) return { sale: p.variants[0].discountedPrice, mrp: p.variants[0].mrp };
    if (p.discountedPrice || p.discountPrice) return { sale: p.discountedPrice || p.discountPrice, mrp: p.price || p.mrp };
    return { sale: p.price || 0, mrp: p.mrp || p.price || 0 };
  };

  const getExpiryDate = (p) => {
    if (p.expiryDate) return new Date(p.expiryDate).toLocaleDateString('en-IN');
    return '—';
  };

  const getAvailableStock = (p) => {
    if (p.availableStock !== undefined) return p.availableStock;
    if (p.sizes?.length) return p.sizes.reduce((sum, s) => sum + (s.availableStock || 0), 0);
    if (p.variants?.length) return p.variants.reduce((sum, v) => sum + (v.availableStock || 0), 0);
    return '—';
  };

  const getProductImage = (p) => {
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
    if (typeof p.image === 'string' && p.image) return p.image;
    return 'https://via.placeholder.com/60x60?text=No+Img';
  };

  const getSubCategory = (p) => p.subCategory || p.category || '';

  // ─── Search filter ───
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => {
      const name = getProductName(p).toLowerCase();
      const brand = getProductBrand(p).toLowerCase();
      const sub = getSubCategory(p).toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes(q) || brand.includes(q) || sub.includes(q) || cat.includes(q);
    });
  }, [products, searchQuery]);

  // ─── Delete handler ───
  const handleDelete = async (product) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/${selectedCategory.endpoint}/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== product._id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // ─── Edit handler ───
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  // ─── Add handler ───
  const handleAdd = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  return (
    <div className="animate-fadeIn">
      {/* ─── Page Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory across all categories</p>
        </div>
        <button onClick={handleAdd}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg flex items-center gap-2 self-start sm:self-auto hover:scale-105 active:scale-95">
          <span className="text-lg">+</span> Add {selectedCategory.label.replace(/s$/, '')}
        </button>
      </div>

      {/* ─── 7 Category Boxes - Single Row ─── */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
              className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
                isActive ? cat.activeColor : `${cat.color} hover:shadow-md hover:scale-[1.02]`
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Search Bar ─── */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, category, or subcategory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>

      {/* ─── Products Count ─── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-800">{filteredProducts.length}</span> {selectedCategory.label.toLowerCase()}
          {searchQuery && <span className="text-purple-600"> matching "{searchQuery}"</span>}
        </p>
      </div>

      {/* ─── Product Table ─── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <span className="text-5xl block mb-3">{selectedCategory.icon}</span>
          <p className="text-gray-500 font-semibold text-lg">
            {searchQuery ? `No results for "${searchQuery}"` : `No ${selectedCategory.label.toLowerCase()} found`}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchQuery ? 'Try a different search term' : 'Click "+ Add" to create your first product'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry Date</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const price = getProductPrice(product);
                  const stock = getAvailableStock(product);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* Product Name + Image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 p-1 border border-gray-200 shrink-0 overflow-hidden">
                            <img src={getProductImage(product)} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-[220px]">{getProductName(product)}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {getProductBrand(product) && <span className="text-xs text-gray-500">{getProductBrand(product)}</span>}
                              {getSubCategory(product) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
                                  {getSubCategory(product)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900 text-sm">₹{price.sale}</p>
                        {price.mrp > price.sale && (
                          <p className="text-xs text-gray-400 line-through">₹{price.mrp}</p>
                        )}
                      </td>

                      {/* Expiry Date */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-600">{getExpiryDate(product)}</p>
                      </td>

                      {/* Available Stock */}
                      <td className="px-5 py-4">
                        {stock === '—' ? (
                          <span className="text-sm text-gray-400">—</span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            stock > 10 ? 'bg-green-50 text-green-700' :
                            stock > 0 ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {stock} {stock === 0 ? '(Out)' : 'in stock'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Permanently delete <span className="font-semibold text-gray-700">"{getProductName(deleteConfirm)}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add/Edit Product Modal ─── */}
      {showAddModal && (
        <ProductForm
          categoryData={selectedCategory}
          existingProduct={editingProduct}
          onClose={() => { setShowAddModal(false); setEditingProduct(null); }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingProduct(null);
            fetchProducts();
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default AdminMyProducts;
