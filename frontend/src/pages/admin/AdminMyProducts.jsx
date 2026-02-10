import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

// ─── Category configs with correct endpoints ───
const CATEGORIES = [
  { key: 'all', label: 'All', icon: '📦', endpoint: null, color: 'bg-gray-100 border-gray-300 text-gray-700', activeColor: 'bg-gray-800 border-gray-800 text-white shadow-lg shadow-gray-300' },
  { key: 'food', label: 'Foods', icon: '🍖', endpoint: 'food', color: 'bg-orange-100 border-orange-300 text-orange-700', activeColor: 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' },
  { key: 'clothes', label: 'Clothes', icon: '👕', endpoint: 'clothes', color: 'bg-blue-100 border-blue-300 text-blue-700', activeColor: 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200' },
  { key: 'grooming', label: 'Grooming', icon: '✂️', endpoint: 'grooming-essentials', color: 'bg-cyan-100 border-cyan-300 text-cyan-700', activeColor: 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-200' },
  { key: 'health', label: 'Health', icon: '💊', endpoint: 'health-supplements', color: 'bg-green-100 border-green-300 text-green-700', activeColor: 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' },
  { key: 'houses', label: 'Houses', icon: '🏠', endpoint: 'houses', color: 'bg-purple-100 border-purple-300 text-purple-700', activeColor: 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-200' },
  { key: 'toys', label: 'Toys', icon: '🧸', endpoint: 'toys', color: 'bg-yellow-100 border-yellow-300 text-yellow-700', activeColor: 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-200' },
  { key: 'accessories', label: 'Accessories', icon: '🎀', endpoint: 'accessories', color: 'bg-pink-100 border-pink-300 text-pink-700', activeColor: 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-200' },
];

const SINGLE_CATEGORIES = CATEGORIES.filter(c => c.key !== 'all');

// Detect category type from product data
const detectCategoryType = (product) => {
  if (product._catKey) return product._catKey;
  if (product.prices && product.flavours) return 'food';
  if (product.sizes && product.careInstructions !== undefined) return 'clothes';
  if (product.variants && product.usageInstructions !== undefined) return 'grooming';
  if (product.usage && product.highlights) return 'health';
  if (product.dimensions) return 'houses';
  if (product.suitableFor !== undefined && product.material !== undefined && !product.sizes) return 'toys';
  if (product.sizes && product.productDetails) return 'accessories';
  return 'food';
};

const getEndpoint = (catKey) => CATEGORIES.find(c => c.key === catKey)?.endpoint || 'food';

// ─── Helpers ───
const getName = (p) => p.productName || p.name || 'N/A';
const getBrand = (p) => p.brand || '';
const getImage = (p) => (Array.isArray(p.images) && p.images[0]) || (typeof p.image === 'string' && p.image) || 'https://via.placeholder.com/60?text=No';
const getSubCat = (p) => p.subCategory || p.category || '';

const getPrice = (p) => {
  if (p.prices?.length) return { sale: p.prices[0].discountedPrice, mrp: p.prices[0].mrp };
  if (p.sizes?.length) return { sale: p.sizes[0].discountedPrice, mrp: p.sizes[0].mrp };
  if (p.variants?.length) return { sale: p.variants[0].discountedPrice, mrp: p.variants[0].mrp };
  return { sale: p.discountedPrice || p.discountPrice || p.price || 0, mrp: p.price || p.mrp || 0 };
};

const getExpiry = (p) => p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-IN') : '—';

const getStock = (p) => {
  if (p.availableStock !== undefined) return p.availableStock;
  if (p.sizes?.length) return p.sizes.reduce((s, x) => s + (x.availableStock || 0), 0);
  if (p.variants?.length) return p.variants.reduce((s, x) => s + (x.availableStock || 0), 0);
  return '—';
};

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
const AdminMyProducts = () => {
  const [selectedKey, setSelectedKey] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});

  // Fetch category counts on mount
  useEffect(() => { fetchCategoryCounts(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedKey]);

  const fetchCategoryCounts = async () => {
    try {
      const results = await Promise.allSettled(
        SINGLE_CATEGORIES.map(async (cat) => {
          const res = await fetch(`${API_BASE}/${cat.endpoint}?limit=1`);
          const data = await res.json();
          const count = data.total || data.count || (Array.isArray(data.data) ? data.data.length : 0);
          return { key: cat.key, count };
        })
      );
      const counts = {};
      let total = 0;
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          counts[r.value.key] = r.value.count;
          total += r.value.count;
        }
      });
      counts.all = total;
      setCategoryCounts(counts);
    } catch {}
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (selectedKey === 'all') {
        const results = await Promise.allSettled(
          SINGLE_CATEGORIES.map(async (cat) => {
            const res = await fetch(`${API_BASE}/${cat.endpoint}?limit=200`);
            const data = await res.json();
            return (data.data || []).map(p => ({ ...p, _catKey: cat.key, _endpoint: cat.endpoint, _catLabel: cat.label }));
          })
        );
        const all = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
        setProducts(all);
      } else {
        const cat = CATEGORIES.find(c => c.key === selectedKey);
        const res = await fetch(`${API_BASE}/${cat.endpoint}?limit=200`);
        const data = await res.json();
        setProducts((data.data || []).map(p => ({ ...p, _catKey: cat.key, _endpoint: cat.endpoint, _catLabel: cat.label })));
      }
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      getName(p).toLowerCase().includes(q) ||
      getBrand(p).toLowerCase().includes(q) ||
      getSubCat(p).toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p._catLabel || '').toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleDelete = async (product) => {
    const ep = product._endpoint || getEndpoint(detectCategoryType(product));
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/${ep}/${product._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setProducts(prev => prev.filter(p => p._id !== product._id)); setDeleteConfirm(null); fetchCategoryCounts(); }
    } catch (err) { console.error(err); }
  };

  const openEdit = (product) => {
    const catKey = product._catKey || detectCategoryType(product);
    setEditProduct({ product, catKey });
  };

  const onEditSuccess = () => {
    setEditProduct(null);
    fetchProducts();
    fetchCategoryCounts();
  };

  return (
    <div className="animate-fadeIn flex flex-col flex-1 min-h-0">

      {/* ═══ STICKY TOP: Tabs + Search + Count ═══ */}
      <div className="shrink-0 bg-gray-50">
        {/* ─── Category Tabs ─── */}
        <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => { setSelectedKey(cat.key); setSearchQuery(''); }}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 font-semibold text-xs sm:text-sm transition-all duration-200 ${
                selectedKey === cat.key ? cat.activeColor : `${cat.color} hover:shadow-md`
              }`}>
              <span className="text-base sm:text-lg">{cat.icon}</span>
              <span className="whitespace-nowrap hidden xs:inline sm:inline">{cat.label}</span>
              {categoryCounts[cat.key] !== undefined && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold min-w-[20px] text-center ${
                  selectedKey === cat.key ? 'bg-white/25 text-white' : 'bg-black/10 text-current'
                }`}>{categoryCounts[cat.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Search Bar ─── */}
        <div className="relative mb-3 sm:mb-4">
          <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>}
        </div>

        {/* Count */}
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-3">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> products
          {searchQuery && <span className="text-purple-600"> matching &ldquo;{searchQuery}&rdquo;</span>}
        </p>
      </div>

      {/* ═══ SCROLLABLE PRODUCT LIST ═══ */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex justify-center py-16 sm:py-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-200">
            <span className="text-4xl sm:text-5xl block mb-3">📦</span>
            <p className="text-gray-500 font-semibold text-base sm:text-lg">{searchQuery ? `No results for "${searchQuery}"` : 'No products found'}</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">{searchQuery ? 'Try different keywords' : 'Add products via the Add Product section'}</p>
          </div>
        ) : (
          <>
            {/* ─── MOBILE: Card Layout (visible below lg) ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:hidden pb-4">
            {filtered.map(product => {
              const price = getPrice(product);
              const stock = getStock(product);
              return (
                <div key={`m-${product._catKey}-${product._id}`} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden p-1">
                      <img src={getImage(product)} alt="" className="w-full h-full object-contain" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{getName(product)}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {getBrand(product) && <span className="text-[11px] text-gray-500">{getBrand(product)}</span>}
                        {getSubCat(product) && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">{getSubCat(product)}</span>}
                        {selectedKey === 'all' && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{product._catLabel}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-gray-900 text-sm">₹{price.sale}</span>
                        {price.mrp > price.sale && <span className="text-xs text-gray-400 line-through">₹{price.mrp}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: stock + actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {stock !== '—' ? (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${stock > 10 ? 'bg-green-50 text-green-700' : stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                          {stock} {stock === 0 ? '(Out)' : 'in stock'}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                      {getExpiry(product) !== '—' && <span className="text-[11px] text-gray-400">Exp: {getExpiry(product)}</span>}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setDetailProduct(product)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => openEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setDeleteConfirm(product)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── DESKTOP: Table Layout (visible at lg+) ─── */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    {selectedKey === 'all' && <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>}
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(product => {
                    const price = getPrice(product);
                    const stock = getStock(product);
                    return (
                      <tr key={`d-${product._catKey}-${product._id}`} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 p-1 border border-gray-200 shrink-0 overflow-hidden">
                              <img src={getImage(product)} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[220px]">{getName(product)}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {getBrand(product) && <span className="text-xs text-gray-500">{getBrand(product)}</span>}
                                {getSubCat(product) && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">{getSubCat(product)}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        {selectedKey === 'all' && (
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{product._catLabel}</span>
                          </td>
                        )}
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-900 text-sm">₹{price.sale}</p>
                          {price.mrp > price.sale && <p className="text-xs text-gray-400 line-through">₹{price.mrp}</p>}
                        </td>
                        <td className="px-5 py-4"><p className="text-sm text-gray-600">{getExpiry(product)}</p></td>
                        <td className="px-5 py-4">
                          {stock === '—' ? <span className="text-sm text-gray-400">—</span> : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stock > 10 ? 'bg-green-50 text-green-700' : stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                              {stock} {stock === 0 ? '(Out)' : 'in stock'}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setDetailProduct(product)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Show Details">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={() => openEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => setDeleteConfirm(product)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
          </>
        )}
      </div>

      {/* Delete Modal — always centered */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">Permanently delete <span className="font-semibold text-gray-700">&ldquo;{getName(deleteConfirm)}&rdquo;</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <EditProductModal
          product={editProduct.product}
          catKey={editProduct.catKey}
          onClose={() => setEditProduct(null)}
          onSuccess={onEditSuccess}
        />
      )}

      {/* Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn .3s ease-out forwards; }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>
    </div>
  );
};

// ════════════════════════════════════════
// PRODUCT DETAIL MODAL — Read-only view
// ════════════════════════════════════════
const ProductDetailModal = ({ product, onClose }) => {
  const catKey = product._catKey || detectCategoryType(product);
  const catLabel = CATEGORIES.find(c => c.key === catKey)?.label || 'Product';
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : (product.image ? [product.image] : []);

  // Skip keys
  const SKIP = new Set(['_id', '__v', '_catKey', '_endpoint', '_catLabel', 'createdAt', 'updatedAt', 'reviews', 'images', 'image']);

  const formatKey = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/_/g, ' ');
  const formatDate = (v) => { try { const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return v; } };

  const renderValue = (key, val) => {
    if (val === null || val === undefined || val === '') return <span className="text-gray-400 italic">—</span>;

    // Date fields
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('expiry')) return <span>{formatDate(val)}</span>;

    // Array of objects (prices, sizes, variants)
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      return (
        <div className="space-y-2 mt-1">
          {val.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {Object.entries(item).filter(([k]) => k !== '_id').map(([k, v]) => (
                  <span key={k}><span className="font-medium text-gray-600">{formatKey(k)}:</span> <span className="text-gray-900">{String(v)}</span></span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Array of strings
    if (Array.isArray(val)) {
      const filtered = val.filter(v => v && String(v).trim());
      if (!filtered.length) return <span className="text-gray-400 italic">—</span>;
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {filtered.map((v, i) => (
            <span key={i} className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100">{String(v)}</span>
          ))}
        </div>
      );
    }

    // Nested object (dimensions, usage)
    if (typeof val === 'object') {
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {Object.entries(val).filter(([k]) => k !== '_id').map(([k, v]) => (
              <div key={k}><span className="text-gray-500 text-xs">{formatKey(k)}</span><p className="font-medium text-gray-900">{String(v || '—')}</p></div>
            ))}
          </div>
        </div>
      );
    }

    // Boolean
    if (typeof val === 'boolean') return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{val ? 'Yes' : 'No'}</span>;

    // Number
    if (typeof val === 'number') {
      if (key.toLowerCase().includes('price') || key.toLowerCase().includes('mrp')) return <span className="font-semibold text-gray-900">₹{val.toLocaleString('en-IN')}</span>;
      if (key.toLowerCase().includes('stock')) return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val > 10 ? 'bg-green-50 text-green-700' : val > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{val} {val === 0 ? '(Out of stock)' : 'in stock'}</span>;
      return <span>{val}</span>;
    }

    return <span className="text-gray-900">{String(val)}</span>;
  };

  // Group fields intelligently
  const allFields = Object.entries(product).filter(([k]) => !SKIP.has(k));

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{getName(product)}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 shrink-0">{catLabel}</span>
            </div>
            {getBrand(product) && <p className="text-sm text-gray-500 mt-0.5">{getBrand(product)}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg shrink-0 ml-3 transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Images Gallery */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Images ({images.length})
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, i) => (
                  <div key={i} className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-xl border-2 border-gray-200 bg-gray-50 overflow-hidden p-1.5 hover:border-purple-300 transition-colors">
                    <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-contain" onError={e => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {allFields.map(([key, val]) => {
              // Full-width for arrays and objects
              const isWide = Array.isArray(val) || (typeof val === 'object' && val !== null);
              return (
                <div key={key} className={isWide ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{formatKey(key)}</label>
                  <div className="mt-1 text-sm">{renderValue(key, val)}</div>
                </div>
              );
            })}
          </div>

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
            {product.createdAt && <span>Created: {formatDate(product.createdAt)}</span>}
            {product.updatedAt && <span>Updated: {formatDate(product.updatedAt)}</span>}
            {product._id && <span>ID: {product._id}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// EDIT PRODUCT MODAL — Fully responsive
// ════════════════════════════════════════
const EditProductModal = ({ product, catKey, onClose, onSuccess }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const p = { ...product };
    if (!p.images && p.image) p.images = [p.image];
    if (!Array.isArray(p.images)) p.images = [''];
    if (p.expiryDate) p.expiryDate = new Date(p.expiryDate).toISOString().split('T')[0];
    if (p.prices) p.prices = p.prices.map(x => ({ ...x }));
    if (p.sizes) p.sizes = p.sizes.map(x => ({ ...x }));
    if (p.variants) p.variants = p.variants.map(x => ({ ...x }));
    if (p.dimensions) p.dimensions = { ...p.dimensions };
    if (p.usage) p.usage = { ...p.usage };
    if (Array.isArray(p.details)) p.details = [...p.details];
    if (Array.isArray(p.keyFeatures)) p.keyFeatures = [...p.keyFeatures];
    if (Array.isArray(p.flavours)) p.flavours = [...p.flavours];
    if (Array.isArray(p.nutrients)) p.nutrients = [...p.nutrients];
    if (Array.isArray(p.healthBenefits)) p.healthBenefits = [...p.healthBenefits];
    if (Array.isArray(p.color)) p.color = [...p.color];
    if (Array.isArray(p.productDetails)) p.productDetails = [...p.productDetails];
    if (Array.isArray(p.careInstructions)) p.careInstructions = [...p.careInstructions];
    if (Array.isArray(p.highlights)) p.highlights = [...p.highlights];
    if (Array.isArray(p.usageInstructions)) p.usageInstructions = [...p.usageInstructions];
    setForm(p);
  }, [product]);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setNested = (parent, field, val) => setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: val } }));
  const setArr = (field, idx, val) => setForm(prev => { const a = [...(prev[field] || [])]; a[idx] = val; return { ...prev, [field]: a }; });
  const addArr = (field, def = '') => setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), def] }));
  const rmArr = (field, idx) => setForm(prev => { const a = (prev[field] || []).filter((_, i) => i !== idx); return { ...prev, [field]: a.length ? a : [''] }; });
  const setSubArr = (arrField, idx, subField, val) => setForm(prev => { const a = [...(prev[arrField] || [])]; a[idx] = { ...a[idx], [subField]: val }; return { ...prev, [arrField]: a }; });
  const addSubArr = (field, def) => setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), { ...def }] }));
  const rmSubArr = (field, idx) => setForm(prev => { const a = (prev[field] || []).filter((_, i) => i !== idx); return { ...prev, [field]: a }; });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const endpoint = product._endpoint || getEndpoint(catKey);
    const token = localStorage.getItem('adminToken');

    const payload = { ...form };
    delete payload._catKey; delete payload._endpoint; delete payload._catLabel; delete payload._id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt;

    ['details', 'keyFeatures', 'flavours', 'nutrients', 'healthBenefits', 'images', 'color', 'productDetails', 'careInstructions', 'highlights', 'usageInstructions'].forEach(k => {
      if (Array.isArray(payload[k])) payload[k] = payload[k].filter(v => v && String(v).trim());
    });

    if (payload.prices) payload.prices = payload.prices.map(p => ({ capacity: p.capacity, mrp: Number(p.mrp), discountedPrice: Number(p.discountedPrice) }));
    if (payload.sizes) payload.sizes = payload.sizes.map(s => ({ size: s.size, mrp: Number(s.mrp), discountedPrice: Number(s.discountedPrice), availableStock: Number(s.availableStock) }));
    if (payload.variants) payload.variants = payload.variants.map(v => ({ volume: v.volume, mrp: Number(v.mrp), discountedPrice: Number(v.discountedPrice), discountPercentage: Number(v.discountPercentage || 0), availableStock: Number(v.availableStock) }));

    ['price', 'discountedPrice', 'discountPrice', 'discountPercentage', 'availableStock', 'expectedDeliveryDays'].forEach(f => {
      if (payload[f] !== undefined && payload[f] !== '' && payload[f] !== null) payload[f] = Number(payload[f]);
    });
    if (payload.expiryDate) payload.expiryDate = new Date(payload.expiryDate);

    if (catKey === 'houses' || catKey === 'health') {
      payload.image = (payload.images && payload.images[0]) || payload.image || '';
    }

    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => onSuccess(), 600);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  const catTitle = CATEGORIES.find(c => c.key === catKey)?.label || 'Product';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]" onClick={e => e.stopPropagation()}>
        {/* Header — fixed at top */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{catTitle} — {getName(product)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg shrink-0 ml-2"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {error && <div className="bg-red-50 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium border border-red-200">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium border border-green-200">{success}</div>}

          {/* ─── FOOD FIELDS ─── */}
          {catKey === 'food' && <>
            <Row><Input label="Product Name" value={form.productName} onChange={v => set('productName', v)} /><Input label="Brand" value={form.brand} onChange={v => set('brand', v)} /></Row>
            <Row>
              <Select label="Category" value={form.category} onChange={v => set('category', v)} options={['Dog','Cat','Bird','Fish','Other']} />
              <Select label="Sub Category" value={form.subCategory} onChange={v => set('subCategory', v)} options={['Dry Food','Wet Food','Treats']} />
            </Row>
            <Row><Input label="Available Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} /><Input label="Expiry Date" type="date" value={form.expiryDate} onChange={v => set('expiryDate', v)} /></Row>
            <SubArrayField label="Prices" items={form.prices || []} fields={[{key:'capacity',placeholder:'Capacity',w:'flex-1'},{key:'mrp',placeholder:'MRP',type:'number',w:'w-full sm:w-24'},{key:'discountedPrice',placeholder:'Sale Price',type:'number',w:'w-full sm:w-24'}]}
              onChange={(i,k,v) => setSubArr('prices',i,k,v)} onAdd={() => addSubArr('prices',{capacity:'',mrp:'',discountedPrice:''})} onRemove={i => rmSubArr('prices',i)} />
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" />
            <ArrayField label="Flavours" items={form.flavours} onChange={(i,v) => setArr('flavours',i,v)} onAdd={() => addArr('flavours')} onRemove={i => rmArr('flavours',i)} placeholder="Flavour" />
            <ArrayField label="Details" items={form.details} onChange={(i,v) => setArr('details',i,v)} onAdd={() => addArr('details')} onRemove={i => rmArr('details',i)} placeholder="Detail" />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
            <ArrayField label="Nutrients" items={form.nutrients} onChange={(i,v) => setArr('nutrients',i,v)} onAdd={() => addArr('nutrients')} onRemove={i => rmArr('nutrients',i)} placeholder="e.g. Protein 26%" />
            <ArrayField label="Health Benefits" items={form.healthBenefits} onChange={(i,v) => setArr('healthBenefits',i,v)} onAdd={() => addArr('healthBenefits')} onRemove={i => rmArr('healthBenefits',i)} placeholder="Benefit" />
          </>}

          {/* ─── CLOTHES FIELDS ─── */}
          {catKey === 'clothes' && <>
            <Row><Input label="Product Name" value={form.productName} onChange={v => set('productName', v)} /><Input label="Brand" value={form.brand} onChange={v => set('brand', v)} /></Row>
            <Row>
              <Select label="Category" value={form.category} onChange={v => set('category', v)} options={['Dog','Cat']} />
              <Select label="Sub Category" value={form.subCategory} onChange={v => set('subCategory', v)} options={['Clothing','Dresses','Winter Wear','Rain Wear']} />
            </Row>
            <Input label="Material" value={form.material} onChange={v => set('material', v)} />
            <SubArrayField label="Sizes" items={form.sizes || []} fields={[{key:'size',placeholder:'Size',w:'w-full sm:w-20',type:'select',options:['XS','S','M','L','XL']},{key:'mrp',placeholder:'MRP',type:'number',w:'w-full sm:w-24'},{key:'discountedPrice',placeholder:'Sale',type:'number',w:'w-full sm:w-24'},{key:'availableStock',placeholder:'Stock',type:'number',w:'w-full sm:w-20'}]}
              onChange={(i,k,v) => setSubArr('sizes',i,k,v)} onAdd={() => addSubArr('sizes',{size:'M',mrp:'',discountedPrice:'',availableStock:''})} onRemove={i => rmSubArr('sizes',i)} />
            <ArrayField label="Colors" items={form.color} onChange={(i,v) => setArr('color',i,v)} onAdd={() => addArr('color')} onRemove={i => rmArr('color',i)} placeholder="Color" />
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" />
            <ArrayField label="Product Details" items={form.productDetails} onChange={(i,v) => setArr('productDetails',i,v)} onAdd={() => addArr('productDetails')} onRemove={i => rmArr('productDetails',i)} placeholder="Detail" />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
            <ArrayField label="Care Instructions" items={form.careInstructions} onChange={(i,v) => setArr('careInstructions',i,v)} onAdd={() => addArr('careInstructions')} onRemove={i => rmArr('careInstructions',i)} placeholder="Instruction" />
          </>}

          {/* ─── TOYS FIELDS ─── */}
          {catKey === 'toys' && <>
            <Row><Input label="Product Name" value={form.productName} onChange={v => set('productName', v)} /><Input label="Brand" value={form.brand} onChange={v => set('brand', v)} /></Row>
            <Row>
              <Select label="For" value={form.subCategory} onChange={v => set('subCategory', v)} options={['Dog','Cat']} />
              <Select label="Suitable For" value={form.suitableFor} onChange={v => set('suitableFor', v)} options={['Puppy','Adult','All']} />
            </Row>
            <Row>
              <Input label="Price (MRP)" type="number" value={form.price} onChange={v => set('price', v)} />
              <Input label="Discounted Price" type="number" value={form.discountedPrice} onChange={v => set('discountedPrice', v)} />
              <Input label="Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} />
            </Row>
            <Row><Input label="Material" value={form.material} onChange={v => set('material', v)} /><Input label="Size" value={form.size} onChange={v => set('size', v)} /></Row>
            <ArrayField label="Colors" items={form.color} onChange={(i,v) => setArr('color',i,v)} onAdd={() => addArr('color')} onRemove={i => rmArr('color',i)} placeholder="Color" />
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" />
            <ArrayField label="Product Details" items={form.productDetails} onChange={(i,v) => setArr('productDetails',i,v)} onAdd={() => addArr('productDetails')} onRemove={i => rmArr('productDetails',i)} placeholder="Detail" />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
          </>}

          {/* ─── HOUSES FIELDS ─── */}
          {catKey === 'houses' && <>
            <Row><Input label="Name" value={form.name} onChange={v => set('name', v)} /><Select label="For" value={form.subCategory} onChange={v => set('subCategory', v)} options={['dog','cat']} /></Row>
            <Row>
              <Input label="Price (MRP)" type="number" value={form.price} onChange={v => set('price', v)} />
              <Input label="Discount Price" type="number" value={form.discountPrice} onChange={v => set('discountPrice', v)} />
              <Input label="Discount %" type="number" value={form.discountPercentage} onChange={v => set('discountPercentage', v)} />
            </Row>
            <Input label="Available Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} />
            <Textarea label="Description" value={form.description} onChange={v => set('description', v)} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dimensions</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['height','width','depth','weight'].map(d => (
                  <input key={d} type="text" placeholder={d.charAt(0).toUpperCase()+d.slice(1)} value={form.dimensions?.[d] || ''}
                    onChange={e => setNested('dimensions', d, e.target.value)} className="inp" />
                ))}
              </div>
            </div>
            <Input label="Image URL" value={(form.images && form.images[0]) || form.image || ''} onChange={v => { set('image', v); set('images', [v]); }} />
            <ArrayField label="Highlights" items={form.highlights} onChange={(i,v) => setArr('highlights',i,v)} onAdd={() => addArr('highlights')} onRemove={i => rmArr('highlights',i)} placeholder="Highlight" />
          </>}

          {/* ─── ACCESSORIES FIELDS ─── */}
          {catKey === 'accessories' && <>
            <Row><Input label="Product Name" value={form.productName} onChange={v => set('productName', v)} /><Input label="Brand" value={form.brand} onChange={v => set('brand', v)} /></Row>
            <Select label="For" value={form.subCategory} onChange={v => set('subCategory', v)} options={['dog','cat']} />
            <Input label="Material" value={form.material} onChange={v => set('material', v)} />
            <SubArrayField label="Sizes" items={form.sizes || []} fields={[{key:'size',placeholder:'Size',w:'w-full sm:w-24',type:'select',options:['XS','S','M','L','XL','One Size']},{key:'mrp',placeholder:'MRP',type:'number',w:'w-full sm:w-24'},{key:'discountedPrice',placeholder:'Sale',type:'number',w:'w-full sm:w-24'},{key:'availableStock',placeholder:'Stock',type:'number',w:'w-full sm:w-20'}]}
              onChange={(i,k,v) => setSubArr('sizes',i,k,v)} onAdd={() => addSubArr('sizes',{size:'One Size',mrp:'',discountedPrice:'',availableStock:''})} onRemove={i => rmSubArr('sizes',i)} />
            <ArrayField label="Colors" items={form.color} onChange={(i,v) => setArr('color',i,v)} onAdd={() => addArr('color')} onRemove={i => rmArr('color',i)} placeholder="Color" />
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" />
            <ArrayField label="Product Details" items={form.productDetails} onChange={(i,v) => setArr('productDetails',i,v)} onAdd={() => addArr('productDetails')} onRemove={i => rmArr('productDetails',i)} placeholder="Detail" />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
          </>}

          {/* ─── GROOMING FIELDS ─── */}
          {catKey === 'grooming' && <>
            <Row><Input label="Product Name" value={form.productName} onChange={v => set('productName', v)} /><Input label="Brand" value={form.brand} onChange={v => set('brand', v)} /></Row>
            <Row>
              <Select label="For" value={form.subCategory} onChange={v => set('subCategory', v)} options={['dog','cat']} />
              <Select label="Suitable For" value={form.suitableFor} onChange={v => set('suitableFor', v)} options={['Dogs','Cats','Both']} />
            </Row>
            <Textarea label="Description" value={form.description} onChange={v => set('description', v)} />
            <SubArrayField label="Variants" items={form.variants || []} fields={[{key:'volume',placeholder:'Volume',w:'flex-1'},{key:'mrp',placeholder:'MRP',type:'number',w:'w-full sm:w-20'},{key:'discountedPrice',placeholder:'Sale',type:'number',w:'w-full sm:w-20'},{key:'availableStock',placeholder:'Stock',type:'number',w:'w-full sm:w-20'}]}
              onChange={(i,k,v) => setSubArr('variants',i,k,v)} onAdd={() => addSubArr('variants',{volume:'',mrp:'',discountedPrice:'',discountPercentage:'',availableStock:''})} onRemove={i => rmSubArr('variants',i)} />
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
            <ArrayField label="Usage Instructions" items={form.usageInstructions} onChange={(i,v) => setArr('usageInstructions',i,v)} onAdd={() => addArr('usageInstructions')} onRemove={i => rmArr('usageInstructions',i)} placeholder="Instruction" />
          </>}

          {/* ─── HEALTH SUPPLEMENT FIELDS ─── */}
          {catKey === 'health' && <>
            <Row><Input label="Name" value={form.name} onChange={v => set('name', v)} /><Select label="For" value={form.subCategory} onChange={v => set('subCategory', v)} options={['dog','cat']} /></Row>
            <Row>
              <Input label="Price (MRP)" type="number" value={form.price} onChange={v => set('price', v)} />
              <Input label="Discount Price" type="number" value={form.discountPrice} onChange={v => set('discountPrice', v)} />
              <Input label="Discount %" type="number" value={form.discountPercentage} onChange={v => set('discountPercentage', v)} />
            </Row>
            <Row><Input label="Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} /><Input label="Expiry Date" type="date" value={form.expiryDate} onChange={v => set('expiryDate', v)} /></Row>
            <Textarea label="Description" value={form.description} onChange={v => set('description', v)} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Usage</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Dosage" value={form.usage?.dosage || ''} onChange={e => setNested('usage','dosage',e.target.value)} className="inp" />
                <input type="text" placeholder="Age Group" value={form.usage?.ageGroup || ''} onChange={e => setNested('usage','ageGroup',e.target.value)} className="inp" />
              </div>
            </div>
            <Input label="Image URL" value={(form.images && form.images[0]) || form.image || ''} onChange={v => { set('image', v); set('images', [v]); }} />
            <ArrayField label="Highlights" items={form.highlights} onChange={(i,v) => setArr('highlights',i,v)} onAdd={() => addArr('highlights')} onRemove={i => rmArr('highlights',i)} placeholder="Highlight" />
          </>}
        </form>

        {/* Footer — fixed at bottom */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3 justify-end shrink-0">
          <button type="button" onClick={onClose} className="px-4 sm:px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={loading}
            className="px-5 sm:px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm disabled:opacity-50 shadow-lg">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style>{`.inp { width:100%; padding:0.625rem 1rem; border:1px solid #e5e7eb; border-radius:0.75rem; outline:none; font-size:0.875rem; transition:all 0.2s; } .inp:focus { border-color:#9333ea; box-shadow:0 0 0 2px rgba(147,51,234,0.1); }`}</style>
    </div>
  );
};

// ════════════════════════════════════════
// REUSABLE FORM COMPONENTS — Responsive
// ════════════════════════════════════════

const Row = ({ children }) => {
  const count = Array.isArray(children) ? children.filter(Boolean).length : 1;
  return (
    <div className={`grid gap-3 sm:gap-4 ${count >= 3 ? 'grid-cols-1 sm:grid-cols-3' : count === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {children}
    </div>
  );
};

const Input = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">{label}</label>
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">{label}</label>
    <select value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">{label}</label>
    <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={3}
      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm resize-none" />
  </div>
);

const ArrayField = ({ label, items, onChange, onAdd, onRemove, placeholder }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
      <label className="text-xs sm:text-sm font-semibold text-gray-700">{label}</label>
      <button type="button" onClick={onAdd} className="text-xs font-semibold text-purple-600 hover:text-purple-700">+ Add</button>
    </div>
    <div className="space-y-2">
      {(items || ['']).map((val, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="text" value={val ?? ''} onChange={e => onChange(i, e.target.value)} placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          {(items || []).length > 1 && <button type="button" onClick={() => onRemove(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>}
        </div>
      ))}
    </div>
  </div>
);

const SubArrayField = ({ label, items, fields, onChange, onAdd, onRemove }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
      <label className="text-xs sm:text-sm font-semibold text-gray-700">{label}</label>
      <button type="button" onClick={onAdd} className="text-xs font-semibold text-purple-600 hover:text-purple-700">+ Add</button>
    </div>
    <div className="space-y-3">
      {(items || []).map((item, i) => (
        <div key={i} className="flex flex-wrap gap-2 items-start sm:items-center p-2.5 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none border sm:border-0 border-gray-200">
          {fields.map(f => {
            const baseClass = "px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500";
            if (f.type === 'select') {
              return <select key={f.key} value={item[f.key] ?? ''} onChange={e => onChange(i, f.key, e.target.value)}
                className={`${f.w} ${baseClass} bg-white`}>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>;
            }
            return <input key={f.key} type={f.type || 'text'} placeholder={f.placeholder} value={item[f.key] ?? ''}
              onChange={e => onChange(i, f.key, e.target.value)}
              className={`${f.w} ${baseClass}`} />;
          })}
          {items.length > 1 && <button type="button" onClick={() => onRemove(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 self-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>}
        </div>
      ))}
    </div>
  </div>
);

export default AdminMyProducts;
