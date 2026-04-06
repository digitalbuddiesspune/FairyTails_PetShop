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
  // Check category field first
  if (product.category === 'accessories') return 'accessories';
  if (product.category === 'Toy') return 'toys';
  if (product.category === 'health-supplement') return 'health';
  if (product.category === 'house') return 'houses';
  if (product.category === 'grooming-essentials') return 'grooming';
  // Check by structure
  if (product.prices && product.flavours) return 'food';
  if (product.sizes && product.careInstructions !== undefined) return 'clothes';
  if (product.variants && product.usageInstructions !== undefined) return 'grooming';
  if (product.usage && product.highlights) return 'health';
  if (product.dimensions) return 'houses';
  if (product.suitableFor !== undefined && product.material !== undefined && !product.sizes) return 'toys';
  // New accessory structure (has mrp, discountPrice, but no sizes array)
  if (product.mrp !== undefined && product.discountPrice !== undefined && product.category === 'accessories') return 'accessories';
  if (product.sizes && product.productDetails && !product.careInstructions) return 'accessories';
  return 'food';
};

const getEndpoint = (catKey) => CATEGORIES.find(c => c.key === catKey)?.endpoint || 'food';

// ─── Helpers ───
const getName = (p) => p.productName || p.name || 'N/A';
const getBrand = (p) => p.brand || '';
const getImage = (p) => (Array.isArray(p.images) && p.images[0]) || (typeof p.image === 'string' && p.image) || 'https://via.placeholder.com/60?text=No';
const getSubCat = (p) => p.subCategory || p.category || '';
const normalizeFilterValue = (value = '') => String(value).trim().toLowerCase().replace(/\s+/g, ' ');
const formatFilterLabel = (value = '') => {
  const normalized = normalizeFilterValue(value);
  if (!normalized) return '';
  const knownLabels = {
    'dry food': 'Dry Food',
    'wet food': 'Wet Food',
    treats: 'Treats',
  };
  if (knownLabels[normalized]) return knownLabels[normalized];
  return normalized.split(' ').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};
const PET_VALUES = new Set(['dog', 'cat', 'bird', 'fish', 'other']);
const normalizePetLabel = (value = '') => {
  const clean = normalizeFilterValue(value);
  if (!PET_VALUES.has(clean)) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};
const isPetValue = (value = '') => PET_VALUES.has(normalizeFilterValue(value));
const getPetCategory = (p) => {
  if (isPetValue(p.category)) return normalizePetLabel(p.category);
  if (isPetValue(p.subCategory)) return normalizePetLabel(p.subCategory);
  return '';
};
const getProductSubcategory = (p) => {
  // Food uses category (pet) + subCategory (Dry/Wet/Treats)
  if (isPetValue(p.category) && p.subCategory) return formatFilterLabel(p.subCategory);
  // Other models usually use subCategory for pet; fall back to product type
  return formatFilterLabel(p.productType || p.subSubCategory || p._catLabel || p.category || '');
};

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
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [selectedPetCategory, setSelectedPetCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  // Fetch category counts on mount
  useEffect(() => { fetchCategoryCounts(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedKey]);

  const fetchCategoryCounts = async () => {
    try {
      const results = await Promise.allSettled(
        SINGLE_CATEGORIES.map(async (cat) => {
          const res = await fetch(`${API_BASE}/${cat.endpoint}`);
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
      const fetchAllProductsByEndpoint = async (endpoint) => {
        let page = 1;
        let allItems = [];
        let hasNextPage = true;
        let safety = 0;

        while (hasNextPage && safety < 30) {
          const res = await fetch(`${API_BASE}/${endpoint}?page=${page}`);
          const data = await res.json();
          const batch = Array.isArray(data.data) ? data.data : [];
          allItems = [...allItems, ...batch];

          const totalPages = Number(data.totalPages);
          const currentPage = Number(data.currentPage || page);
          hasNextPage = Number.isFinite(totalPages) && totalPages > currentPage;
          page = currentPage + 1;
          safety += 1;
        }

        return allItems;
      };

      if (selectedKey === 'all') {
        const results = await Promise.allSettled(
          SINGLE_CATEGORIES.map(async (cat) => {
            const items = await fetchAllProductsByEndpoint(cat.endpoint);
            return items.map(p => ({ ...p, _catKey: cat.key, _endpoint: cat.endpoint, _catLabel: cat.label }));
          })
        );
        const all = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
        setProducts(all);
      } else {
        const cat = CATEGORIES.find(c => c.key === selectedKey);
        const items = await fetchAllProductsByEndpoint(cat.endpoint);
        setProducts(items.map(p => ({ ...p, _catKey: cat.key, _endpoint: cat.endpoint, _catLabel: cat.label })));
      }
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const petCategoryOptions = useMemo(() => {
    const optionMap = new Map();
    products.forEach((p) => {
      const pet = getPetCategory(p);
      const normalized = normalizeFilterValue(pet);
      if (normalized && !optionMap.has(normalized)) optionMap.set(normalized, pet);
    });
    return Array.from(optionMap.values()).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const subCategoryOptions = useMemo(() => {
    if (selectedPetCategory === 'all') return [];
    const optionMap = new Map();
    products
      .filter((p) => normalizeFilterValue(getPetCategory(p)) === normalizeFilterValue(selectedPetCategory))
      .forEach((p) => {
        const subCategory = getProductSubcategory(p);
        const normalized = normalizeFilterValue(subCategory);
        if (normalized && !optionMap.has(normalized)) optionMap.set(normalized, subCategory);
      });
    return Array.from(optionMap.values()).sort((a, b) => a.localeCompare(b));
  }, [products, selectedPetCategory]);

  const foodOptionTabs = useMemo(() => {
    if (selectedKey !== 'food') return [];
    const foodProducts = selectedPetCategory === 'all'
      ? products
      : products.filter((p) => normalizeFilterValue(getPetCategory(p)) === normalizeFilterValue(selectedPetCategory));
    const optionMap = new Map();
    foodProducts.forEach((p) => {
      const subCategory = getProductSubcategory(p);
      const normalized = normalizeFilterValue(subCategory);
      if (normalized && !optionMap.has(normalized)) optionMap.set(normalized, subCategory);
    });
    return Array.from(optionMap.values()).sort((a, b) => a.localeCompare(b));
  }, [products, selectedKey, selectedPetCategory]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const petCategory = getPetCategory(p);
      const subCategory = getProductSubcategory(p);
      const petCategoryMatch =
        selectedPetCategory === 'all' || normalizeFilterValue(petCategory) === normalizeFilterValue(selectedPetCategory);
      const subCategoryMatch =
        selectedSubCategory === 'all' || normalizeFilterValue(subCategory) === normalizeFilterValue(selectedSubCategory);

      const searchMatch =
        !q ||
        getName(p).toLowerCase().includes(q) ||
        getBrand(p).toLowerCase().includes(q) ||
        getSubCat(p).toLowerCase().includes(q) ||
        petCategory.toLowerCase().includes(q) ||
        (p._catLabel || '').toLowerCase().includes(q);

      return petCategoryMatch && subCategoryMatch && searchMatch;
    });
  }, [products, searchQuery, selectedPetCategory, selectedSubCategory]);

  const handleDelete = async (product) => {
    const ep = product._endpoint || getEndpoint(detectCategoryType(product));
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/${ep}/${product._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== product._id));
        setDeleteConfirm(null);
        fetchCategoryCounts();
        // Show success popup
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 2500);
      }
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
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
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => { setSelectedKey(cat.key); setSearchQuery(''); setSelectedPetCategory('all'); setSelectedSubCategory('all'); }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold text-xs transition-all duration-200 ${
                selectedKey === cat.key ? cat.activeColor : `${cat.color} hover:shadow-md`
              }`}>
              <span className="whitespace-nowrap">{cat.label}</span>
              {categoryCounts[cat.key] !== undefined && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center ${
                  selectedKey === cat.key ? 'bg-white/25 text-white' : 'bg-black/10 text-current'
                }`}>{categoryCounts[cat.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Search Bar ─── */}
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
        </div>

        {/* ─── Pet Category + Sub Category Filters ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <select
            value={selectedPetCategory}
            onChange={(e) => {
              setSelectedPetCategory(e.target.value);
              setSelectedSubCategory('all');
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm"
          >
            <option value="all">Select Pet Category (All)</option>
            {petCategoryOptions.map((pet) => (
              <option key={pet} value={pet}>
                {pet}
              </option>
            ))}
          </select>

          {selectedKey !== 'food' && (
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={selectedPetCategory === 'all'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="all">
                {selectedPetCategory === 'all' ? 'Select pet category first' : 'Select Sub Category (All)'}
              </option>
              {subCategoryOptions.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ─── Food Product Option Tabs ─── */}
        {selectedKey === 'food' && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
            <button
              onClick={() => setSelectedSubCategory('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                selectedSubCategory === 'all'
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50'
              }`}
            >
              All Food Products
            </button>
            {foodOptionTabs.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedSubCategory(option)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  normalizeFilterValue(selectedSubCategory) === normalizeFilterValue(option)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        <p className="text-xs text-gray-500 mb-2">
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
                        {getPetCategory(product) && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">Category: {getPetCategory(product)}</span>}
                        {getProductSubcategory(product) && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">Sub: {getProductSubcategory(product)}</span>}
                        {selectedKey === 'all' && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{product._catLabel}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-gray-900 text-sm">₹{price.sale}</span>
                        
                       
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
          <div className="hidden lg:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    {selectedKey === 'all' && <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Type</th>}
                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Expiry</th>
                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(product => {
                    const price = getPrice(product);
                    const stock = getStock(product);
                    return (
                      <tr key={`d-${product._catKey}-${product._id}`} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 p-0.5 border border-gray-200 shrink-0 overflow-hidden">
                              <img src={getImage(product)} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-xs truncate max-w-[200px]">{getName(product)}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {getBrand(product) && <span className="text-[10px] text-gray-500">{getBrand(product)}</span>}
                                {getPetCategory(product) && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-50 text-emerald-700">Category: {getPetCategory(product)}</span>}
                                {getProductSubcategory(product) && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-600">Sub: {getProductSubcategory(product)}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        {selectedKey === 'all' && (
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{product._catLabel}</span>
                          </td>
                        )}
                        <td className="px-3 py-2">
                          <p className="font-bold text-gray-900 text-xs">₹{price.sale}</p>
                        </td>
                        <td className="px-3 py-2"><p className="text-xs text-gray-600">{getExpiry(product)}</p></td>
                        <td className="px-3 py-2">
                          {stock === '—' ? <span className="text-xs text-gray-400">—</span> : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${stock > 10 ? 'bg-green-50 text-green-700' : stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                              {stock} {stock === 0 ? '(Out)' : 'in stock'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setDetailProduct(product)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Show Details">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={() => openEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => setDeleteConfirm(product)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Permanently Delete?</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-2">This action cannot be undone.</p>
            <p className="text-sm text-gray-600 mb-6 bg-gray-50 rounded-lg py-2 px-3 border border-gray-200 truncate font-medium">{getName(deleteConfirm)}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Toast */}
      {deleteSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] animate-slideDown">
          <div className="bg-green-600 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-sm">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            Product deleted successfully!
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
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        .animate-scaleIn { animation: scaleIn .2s ease-out forwards; }
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-20px); } to { opacity:1; transform:translate(-50%,0); } }
        .animate-slideDown { animation: slideDown .35s ease-out forwards; }
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
  let allFields = Object.entries(product).filter(([k]) => !SKIP.has(k));
  
  // Ensure size field is shown for accessories even if empty
  if (catKey === 'accessories' && !allFields.some(([k]) => k === 'size')) {
    allFields.push(['size', product.size || '']);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[78vh] sm:max-h-[75vh] animate-scaleIn" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-200 shrink-0">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{getName(product)}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 shrink-0">{catLabel}</span>
            {getBrand(product) && <span className="text-sm text-gray-400 hidden sm:inline">by {getBrand(product)}</span>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg shrink-0 ml-3 transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4">
          {/* Images Gallery */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Images ({images.length})
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, i) => (
                  <div key={i} className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-gray-200 bg-gray-50 overflow-hidden p-1 hover:border-purple-300 transition-colors">
                    <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-contain" onError={e => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Fields — 3 cols to fit more in one line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {allFields.map(([key, val]) => {
              // Full-width for arrays and objects
              const isWide = Array.isArray(val) || (typeof val === 'object' && val !== null);
              return (
                <div key={key} className={isWide ? 'sm:col-span-2 lg:col-span-3' : ''}>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">{formatKey(key)}</label>
                    {!isWide && <span className="text-sm font-medium">{renderValue(key, val)}</span>}
                  </div>
                  {isWide && <div className="mt-1 text-sm">{renderValue(key, val)}</div>}
                </div>
              );
            })}
          </div>

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
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
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    const p = { ...product };
    if (!p.images && p.image) p.images = [p.image];
    if (!Array.isArray(p.images)) p.images = [''];
    if (p.expiryDate) p.expiryDate = new Date(p.expiryDate).toISOString().split('T')[0];
    
    // Handle migration for food and accessories
    if (catKey === 'food' && p.prices && Array.isArray(p.prices) && p.prices.length > 0) {
      const firstPrice = p.prices[0];
      p.capacity = firstPrice.capacity || '';
      p.mrp = firstPrice.mrp || '';
      p.discountPrice = firstPrice.discountedPrice || '';
    }
    
    if (catKey === 'accessories' && p.sizes && Array.isArray(p.sizes) && p.sizes.length > 0) {
      const firstSize = p.sizes[0];
      p.mrp = firstSize.mrp || '';
      p.discountPrice = firstSize.discountedPrice || '';
      p.availableStock = firstSize.availableStock || '';
    }
    
    // Handle toy price migration (if old format exists)
    if (catKey === 'toys' && p.price !== undefined && !p.mrp) {
      p.mrp = p.price || '';
      p.discountPrice = p.discountedPrice || '';
      // Calculate discount type from discountPercentage if available
      if (p.discountPercentage) {
        p.discountType = `${p.discountPercentage}%`;
      }
    }
    
    // Handle health supplement migration (if old format exists)
    if (catKey === 'health') {
      if (p.name && !p.productName) p.productName = p.name;
      if (p.price !== undefined && !p.mrp) p.mrp = p.price;
      if (p.discountPercentage && !p.discountType) {
        p.discountType = `${p.discountPercentage}%`;
      }
      if (p.image && (!p.images || p.images.length === 0)) {
        p.images = [p.image];
      }
    }
    
    // Handle grooming variants migration (if old format exists)
    if (catKey === 'grooming' && p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
      const firstVariant = p.variants[0];
      p.mrp = firstVariant.mrp || '';
      p.discountPrice = firstVariant.discountedPrice || '';
      p.availableStock = firstVariant.availableStock || '';
      p.size = firstVariant.volume || '';
      // Calculate discount type from discountPercentage if available
      if (firstVariant.discountPercentage) {
        p.discountType = `${firstVariant.discountPercentage}%`;
      }
    }
    
    // Handle house migration (if old format exists)
    if (catKey === 'houses') {
      if (p.name && !p.productName) p.productName = p.name;
      if (p.price !== undefined && !p.mrp) p.mrp = p.price;
      if (p.discountPercentage && !p.discountType) {
        p.discountType = `${p.discountPercentage}%`;
      }
      if (p.image && (!p.images || p.images.length === 0)) {
        p.images = [p.image];
      }
    }
    
    if (p.prices) p.prices = p.prices.map(x => ({ ...x }));
    if (p.sizes && catKey !== 'accessories') p.sizes = p.sizes.map(x => ({ ...x }));
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
  }, [product, catKey]);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setNested = (parent, field, val) => setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: val } }));
  const setArr = (field, idx, val) => setForm(prev => { const a = [...(prev[field] || [])]; a[idx] = val; return { ...prev, [field]: a }; });
  const addArr = (field, def = '') => setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), def] }));
  const rmArr = (field, idx) => setForm(prev => { const a = (prev[field] || []).filter((_, i) => i !== idx); return { ...prev, [field]: a.length ? a : [''] }; });
  const setSubArr = (arrField, idx, subField, val) => setForm(prev => { const a = [...(prev[arrField] || [])]; a[idx] = { ...a[idx], [subField]: val }; return { ...prev, [arrField]: a }; });
  const addSubArr = (field, def) => setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), { ...def }] }));
  const rmSubArr = (field, idx) => setForm(prev => { const a = (prev[field] || []).filter((_, i) => i !== idx); return { ...prev, [field]: a }; });

  const handleImageUpload = async (field, idx, file) => {
    if (!file) return;
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Admin token missing. Please sign in again.');
      return;
    }

    const uploadKey = `${field}-${idx}`;
    setUploadingImageIndex(uploadKey);
    setError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE}/admin/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed');
      }

      setArr(field, idx, data.data.url);
      setUploadSuccess('Image uploaded successfully from device.');
      setTimeout(() => setUploadSuccess(''), 2500);
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed');
    } finally {
      setUploadingImageIndex(null);
    }
  };

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

    // Handle food and accessories new structure
    if (catKey === 'food') {
      if (payload.mrp !== undefined && payload.mrp !== '') payload.mrp = Number(payload.mrp);
      if (payload.discountPrice !== undefined && payload.discountPrice !== '') payload.discountPrice = Number(payload.discountPrice);
      if (payload.taxes !== undefined && payload.taxes !== '') payload.taxes = Number(payload.taxes);
      if (payload.availableStock !== undefined && payload.availableStock !== '') payload.availableStock = Number(payload.availableStock);
      // Remove old prices array if exists
      delete payload.prices;
    }
    
    if (catKey === 'accessories') {
      if (payload.mrp !== undefined && payload.mrp !== '') payload.mrp = Number(payload.mrp);
      if (payload.discountPrice !== undefined && payload.discountPrice !== '') payload.discountPrice = Number(payload.discountPrice);
      if (payload.taxes !== undefined && payload.taxes !== '') payload.taxes = Number(payload.taxes);
      if (payload.availableStock !== undefined && payload.availableStock !== '') payload.availableStock = Number(payload.availableStock);
      // Remove old sizes array if exists
      delete payload.sizes;
      // Remove empty optional fields
      ['size', 'brand', 'material', 'itemCode', 'hsn'].forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
    }
    
    if (catKey === 'toys') {
      if (payload.mrp !== undefined && payload.mrp !== '') payload.mrp = Number(payload.mrp);
      if (payload.discountPrice !== undefined && payload.discountPrice !== '') payload.discountPrice = Number(payload.discountPrice);
      if (payload.taxes !== undefined && payload.taxes !== '') payload.taxes = Number(payload.taxes);
      if (payload.availableStock !== undefined && payload.availableStock !== '') payload.availableStock = Number(payload.availableStock);
      // Remove old price/discountedPrice fields if exists
      delete payload.price;
      delete payload.discountedPrice;
      delete payload.discountPercentage;
      // Remove empty optional fields
      ['itemCode', 'hsn', 'brand', 'size', 'material'].forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
    }
    
    if (catKey === 'health') {
      if (payload.mrp !== undefined && payload.mrp !== '') payload.mrp = Number(payload.mrp);
      if (payload.discountPrice !== undefined && payload.discountPrice !== '') payload.discountPrice = Number(payload.discountPrice);
      if (payload.taxes !== undefined && payload.taxes !== '') payload.taxes = Number(payload.taxes);
      if (payload.availableStock !== undefined && payload.availableStock !== '') payload.availableStock = Number(payload.availableStock);
      // Remove old price/discountPercentage fields if exists
      delete payload.price;
      delete payload.discountPercentage;
      // Remove empty optional fields
      ['itemCode', 'hsn', 'size', 'description', 'highlights'].forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
      // Remove usage if empty
      if (payload.usage && (!payload.usage.dosage && !payload.usage.ageGroup)) delete payload.usage;
      // Convert image to images array if needed
      if (payload.image && (!payload.images || payload.images.length === 0)) {
        payload.images = [payload.image];
      }
      delete payload.image;
    }
    
    if (catKey === 'grooming') {
      if (payload.mrp !== undefined && payload.mrp !== '') payload.mrp = Number(payload.mrp);
      if (payload.discountPrice !== undefined && payload.discountPrice !== '') payload.discountPrice = Number(payload.discountPrice);
      if (payload.taxes !== undefined && payload.taxes !== '') payload.taxes = Number(payload.taxes);
      if (payload.availableStock !== undefined && payload.availableStock !== '') payload.availableStock = Number(payload.availableStock);
      // Remove old variants array if exists
      delete payload.variants;
      // Remove empty optional fields
      ['itemCode', 'hsn', 'size', 'expiryDate', 'brand', 'description', 'keyFeatures'].forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
    }
    
    if (catKey === 'houses') {
      if (payload.mrp !== undefined && payload.mrp !== '') payload.mrp = Number(payload.mrp);
      if (payload.discountPrice !== undefined && payload.discountPrice !== '') payload.discountPrice = Number(payload.discountPrice);
      if (payload.taxes !== undefined && payload.taxes !== '') payload.taxes = Number(payload.taxes);
      if (payload.availableStock !== undefined && payload.availableStock !== '') payload.availableStock = Number(payload.availableStock);
      // Remove old price/discountPercentage fields if exists
      delete payload.price;
      delete payload.discountPercentage;
      // Remove empty optional fields
      ['itemCode', 'hsn', 'description', 'highlights'].forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
      // Remove dimensions if all fields are empty
      if (payload.dimensions && (!payload.dimensions.height && !payload.dimensions.width && !payload.dimensions.depth && !payload.dimensions.weight)) {
        delete payload.dimensions;
      }
      // Convert image to images array if needed
      if (payload.image && (!payload.images || payload.images.length === 0)) {
        payload.images = [payload.image];
      }
      delete payload.image;
    }
    
    if (payload.prices && catKey !== 'food') payload.prices = payload.prices.map(p => ({ capacity: p.capacity, mrp: Number(p.mrp), discountedPrice: Number(p.discountedPrice) }));
    if (payload.sizes && catKey !== 'accessories') payload.sizes = payload.sizes.map(s => ({ size: s.size, mrp: Number(s.mrp), discountedPrice: Number(s.discountedPrice), availableStock: Number(s.availableStock) }));
    if (payload.variants) payload.variants = payload.variants.map(v => ({ volume: v.volume, mrp: Number(v.mrp), discountedPrice: Number(v.discountedPrice), discountPercentage: Number(v.discountPercentage || 0), availableStock: Number(v.availableStock) }));

    ['price', 'discountedPrice', 'discountPercentage', 'expectedDeliveryDays'].forEach(f => {
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
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[78vh] sm:max-h-[75vh] animate-scaleIn" onClick={e => e.stopPropagation()}>
        {/* Header — fixed at top */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-200 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{catTitle} — {getName(product)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg shrink-0 ml-2"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSave} className="px-5 py-4 sm:px-6 sm:py-5 space-y-4 overflow-y-auto flex-1">
          {error && <div className="bg-red-50 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium border border-red-200">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium border border-green-200">{success}</div>}
          {uploadSuccess && <div className="bg-green-50 text-green-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium border border-green-200">{uploadSuccess}</div>}

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
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" enableUpload uploadingImageIndex={uploadingImageIndex} onUpload={(i, file) => handleImageUpload('images', i, file)} />
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
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" enableUpload uploadingImageIndex={uploadingImageIndex} onUpload={(i, file) => handleImageUpload('images', i, file)} />
            <ArrayField label="Product Details" items={form.productDetails} onChange={(i,v) => setArr('productDetails',i,v)} onAdd={() => addArr('productDetails')} onRemove={i => rmArr('productDetails',i)} placeholder="Detail" />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
            <ArrayField label="Care Instructions" items={form.careInstructions} onChange={(i,v) => setArr('careInstructions',i,v)} onAdd={() => addArr('careInstructions')} onRemove={i => rmArr('careInstructions',i)} placeholder="Instruction" />
          </>}

          {/* ─── TOYS FIELDS ─── */}
          {catKey === 'toys' && <>
            <Row><Input label="Product Name" value={form.productName} onChange={v => set('productName', v)} /><Select label="Sub-Category (Pet)" value={form.subCategory} onChange={v => set('subCategory', v)} options={['Dog','Cat']} /></Row>
            <Row>
              <Input label="MRP" type="number" value={form.mrp} onChange={v => set('mrp', v)} />
              <Input label="Discount Price" type="number" value={form.discountPrice} onChange={v => set('discountPrice', v)} />
            </Row>
            <Row>
              <Input label="Discount Type" value={form.discountType} onChange={v => set('discountType', v)} />
              <Input label="Available Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} />
            </Row>
            <Row>
              <Input label="Base Unit" value={form.baseUnit || 'pieces'} onChange={v => set('baseUnit', v)} />
              <Input label="Taxes (GST %)" type="number" value={form.taxes || 18} onChange={v => set('taxes', v)} />
            </Row>
            <Row>
              <Input label="Item Code" value={form.itemCode} onChange={v => set('itemCode', v)} />
              <Input label="HSN" value={form.hsn} onChange={v => set('hsn', v)} />
            </Row>
            <Row>
              <Input label="Brand" value={form.brand} onChange={v => set('brand', v)} />
              <Input label="Size" value={form.size} onChange={v => set('size', v)} />
            </Row>
            <Input label="Material" value={form.material} onChange={v => set('material', v)} />
            <Select label="Suitable For" value={form.suitableFor || 'All'} onChange={v => set('suitableFor', v)} options={['Puppy','Adult','All']} />
            <ArrayField label="Colors" items={form.color} onChange={(i,v) => setArr('color',i,v)} onAdd={() => addArr('color')} onRemove={i => rmArr('color',i)} placeholder="Color" />
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" enableUpload uploadingImageIndex={uploadingImageIndex} onUpload={(i, file) => handleImageUpload('images', i, file)} />
            <ArrayField label="Product Details" items={form.productDetails} onChange={(i,v) => setArr('productDetails',i,v)} onAdd={() => addArr('productDetails')} onRemove={i => rmArr('productDetails',i)} placeholder="Detail" />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
          </>}

          {/* ─── HOUSES FIELDS ─── */}
          {catKey === 'houses' && <>
            <Row><Input label="Product Name" value={form.productName || form.name} onChange={v => { set('productName', v); set('name', v); }} /><Select label="Sub-Category (Pet)" value={form.subCategory} onChange={v => set('subCategory', v)} options={['dog','cat']} /></Row>
            <Row>
              <Input label="MRP" type="number" value={form.mrp || form.price} onChange={v => { set('mrp', v); set('price', v); }} />
              <Input label="Discount Price" type="number" value={form.discountPrice} onChange={v => set('discountPrice', v)} />
            </Row>
            <Row>
              <Input label="Discount Type" value={form.discountType || (form.discountPercentage ? `${form.discountPercentage}%` : '')} onChange={v => set('discountType', v)} />
              <Input label="Available Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} />
            </Row>
            <Row>
              <Input label="Base Unit" value={form.baseUnit || 'pieces'} onChange={v => set('baseUnit', v)} />
              <Input label="Taxes (GST %)" type="number" value={form.taxes || 18} onChange={v => set('taxes', v)} />
            </Row>
            <Row>
              <Input label="Item Code" value={form.itemCode} onChange={v => set('itemCode', v)} />
              <Input label="HSN" value={form.hsn} onChange={v => set('hsn', v)} />
            </Row>
            <Textarea label="Description" value={form.description} onChange={v => set('description', v)} />
            <ArrayField label="Highlights" items={form.highlights} onChange={(i,v) => setArr('highlights',i,v)} onAdd={() => addArr('highlights')} onRemove={i => rmArr('highlights',i)} placeholder="Highlight" />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dimensions (Optional)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['height','width','depth','weight'].map(d => (
                  <input key={d} type="text" placeholder={d.charAt(0).toUpperCase()+d.slice(1)} value={form.dimensions?.[d] || ''}
                    onChange={e => setNested('dimensions', d, e.target.value)} className="inp" />
                ))}
              </div>
            </div>
            <ArrayField label="Images" items={form.images || (form.image ? [form.image] : [])} onChange={(i,v) => { setArr('images',i,v); if (i === 0) set('image', v); }} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" enableUpload uploadingImageIndex={uploadingImageIndex} onUpload={(i, file) => handleImageUpload('images', i, file)} />
          </>}

          {/* ─── ACCESSORIES FIELDS ─── */}
          {catKey === 'accessories' && <>
            <Row><Input label="Product Name" value={form.productName} onChange={v => set('productName', v)} /><Input label="Brand" value={form.brand} onChange={v => set('brand', v)} /></Row>
            <Select label="For" value={form.subCategory} onChange={v => set('subCategory', v)} options={['dog','cat']} />
            <Row>
              <Input label="MRP" type="number" value={form.mrp} onChange={v => set('mrp', v)} />
              <Input label="Discount Price" type="number" value={form.discountPrice} onChange={v => set('discountPrice', v)} />
            </Row>
            <Row>
              <Input label="Discount Type" value={form.discountType} onChange={v => set('discountType', v)} />
              <Input label="Available Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} />
            </Row>
            <Row>
              <Input label="Base Unit" value={form.baseUnit || 'pieces'} onChange={v => set('baseUnit', v)} />
              <Input label="Taxes (GST %)" type="number" value={form.taxes || 18} onChange={v => set('taxes', v)} />
            </Row>
            <Input label="Size" value={form.size} onChange={v => set('size', v)} placeholder="e.g. S, XL, Large, Medium, Size01, 1kg, 250ml, etc." />
            <Input label="Material" value={form.material} onChange={v => set('material', v)} />
            <ArrayField label="Colors" items={form.color} onChange={(i,v) => setArr('color',i,v)} onAdd={() => addArr('color')} onRemove={i => rmArr('color',i)} placeholder="Color" />
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" enableUpload uploadingImageIndex={uploadingImageIndex} onUpload={(i, file) => handleImageUpload('images', i, file)} />
            <ArrayField label="Product Details" items={form.productDetails} onChange={(i,v) => setArr('productDetails',i,v)} onAdd={() => addArr('productDetails')} onRemove={i => rmArr('productDetails',i)} placeholder="Detail" />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
          </>}

          {/* ─── GROOMING FIELDS ─── */}
          {catKey === 'grooming' && <>
            <Row><Input label="Product Name" value={form.productName} onChange={v => set('productName', v)} /><Select label="Sub-Category (Pet)" value={form.subCategory} onChange={v => set('subCategory', v)} options={['dog','cat']} /></Row>
            <Row>
              <Input label="MRP" type="number" value={form.mrp} onChange={v => set('mrp', v)} />
              <Input label="Discount Price" type="number" value={form.discountPrice} onChange={v => set('discountPrice', v)} />
            </Row>
            <Row>
              <Input label="Discount Type" value={form.discountType} onChange={v => set('discountType', v)} />
              <Input label="Available Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} />
            </Row>
            <Row>
              <Input label="Base Unit" value={form.baseUnit || 'pieces'} onChange={v => set('baseUnit', v)} />
              <Input label="Taxes (GST %)" type="number" value={form.taxes || 18} onChange={v => set('taxes', v)} />
            </Row>
            <Row>
              <Input label="Item Code" value={form.itemCode} onChange={v => set('itemCode', v)} />
              <Input label="HSN" value={form.hsn} onChange={v => set('hsn', v)} />
            </Row>
            <Row>
              <Input label="Size" value={form.size} onChange={v => set('size', v)} placeholder="e.g. 250ml, 500ml, 1L, Small, Large, etc." />
              <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={v => set('expiryDate', v)} />
            </Row>
            <Input label="Brand" value={form.brand} onChange={v => set('brand', v)} />
            <Select label="Suitable For" value={form.suitableFor || 'Both'} onChange={v => set('suitableFor', v)} options={['Dogs','Cats','Both']} />
            <Textarea label="Description" value={form.description} onChange={v => set('description', v)} />
            <ArrayField label="Images" items={form.images} onChange={(i,v) => setArr('images',i,v)} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" enableUpload uploadingImageIndex={uploadingImageIndex} onUpload={(i, file) => handleImageUpload('images', i, file)} />
            <ArrayField label="Key Features" items={form.keyFeatures} onChange={(i,v) => setArr('keyFeatures',i,v)} onAdd={() => addArr('keyFeatures')} onRemove={i => rmArr('keyFeatures',i)} placeholder="Feature" />
            <ArrayField label="Usage Instructions" items={form.usageInstructions} onChange={(i,v) => setArr('usageInstructions',i,v)} onAdd={() => addArr('usageInstructions')} onRemove={i => rmArr('usageInstructions',i)} placeholder="Instruction" />
          </>}

          {/* ─── HEALTH SUPPLEMENT FIELDS ─── */}
          {catKey === 'health' && <>
            <Row><Input label="Product Name" value={form.productName || form.name} onChange={v => { set('productName', v); set('name', v); }} /><Select label="Sub-Category (Pet)" value={form.subCategory} onChange={v => set('subCategory', v)} options={['dog','cat']} /></Row>
            <Row>
              <Input label="MRP" type="number" value={form.mrp || form.price} onChange={v => { set('mrp', v); set('price', v); }} />
              <Input label="Discount Price" type="number" value={form.discountPrice} onChange={v => set('discountPrice', v)} />
            </Row>
            <Row>
              <Input label="Discount Type" value={form.discountType || (form.discountPercentage ? `${form.discountPercentage}%` : '')} onChange={v => set('discountType', v)} />
              <Input label="Available Stock" type="number" value={form.availableStock} onChange={v => set('availableStock', v)} />
            </Row>
            <Row>
              <Input label="Base Unit" value={form.baseUnit || 'pieces'} onChange={v => set('baseUnit', v)} />
              <Input label="Taxes (GST %)" type="number" value={form.taxes || 18} onChange={v => set('taxes', v)} />
            </Row>
            <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={v => set('expiryDate', v)} />
            <Row>
              <Input label="Item Code" value={form.itemCode} onChange={v => set('itemCode', v)} />
              <Input label="HSN" value={form.hsn} onChange={v => set('hsn', v)} />
            </Row>
            <Input label="Size" value={form.size} onChange={v => set('size', v)} placeholder="e.g. 250ml, 500ml, 1L, Small, Large, kg, etc." />
            <Textarea label="Description" value={form.description} onChange={v => set('description', v)} />
            <ArrayField label="Highlights" items={form.highlights} onChange={(i,v) => setArr('highlights',i,v)} onAdd={() => addArr('highlights')} onRemove={i => rmArr('highlights',i)} placeholder="Highlight" />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Usage (Optional)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Dosage" value={form.usage?.dosage || ''} onChange={e => setNested('usage','dosage',e.target.value)} className="inp" />
                <input type="text" placeholder="Age Group" value={form.usage?.ageGroup || ''} onChange={e => setNested('usage','ageGroup',e.target.value)} className="inp" />
              </div>
            </div>
            <ArrayField label="Images" items={form.images || (form.image ? [form.image] : [])} onChange={(i,v) => { setArr('images',i,v); if (i === 0) set('image', v); }} onAdd={() => addArr('images')} onRemove={i => rmArr('images',i)} placeholder="Image URL" enableUpload uploadingImageIndex={uploadingImageIndex} onUpload={(i, file) => handleImageUpload('images', i, file)} />
          </>}
        </form>

        {/* Footer — fixed at bottom */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-gray-200 flex gap-3 justify-end shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={loading}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 shadow-lg">
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
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <select value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={3}
      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm resize-none" />
  </div>
);

const ArrayField = ({ label, items, onChange, onAdd, onRemove, placeholder, enableUpload = false, uploadingImageIndex = null, onUpload }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <button type="button" onClick={onAdd} className="text-xs font-semibold text-purple-600 hover:text-purple-700">+ Add</button>
    </div>
    <div className="space-y-2">
      {(items || ['']).map((val, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="text" value={val ?? ''} onChange={e => onChange(i, e.target.value)} placeholder={placeholder}
            className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          {enableUpload && (
            <label className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap flex items-center">
              {uploadingImageIndex === `images-${i}` ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImageIndex === `images-${i}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (onUpload) onUpload(i, file);
                  e.target.value = '';
                }}
              />
            </label>
          )}
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
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <button type="button" onClick={onAdd} className="text-xs font-semibold text-purple-600 hover:text-purple-700">+ Add</button>
    </div>
    <div className="space-y-3">
      {(items || []).map((item, i) => (
        <div key={i} className="flex flex-wrap gap-2 items-start sm:items-center p-2.5 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none border sm:border-0 border-gray-200">
          {fields.map(f => {
            const baseClass = "px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500";
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
