import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRupee } from '../../utils/formatPrice';

const API_BASE = import.meta.env.VITE_BACKEND_API;

// ─── Category configs with correct endpoints ───
const CATEGORIES = [
  { key: 'all', label: 'All', icon: '📦', endpoint: null, color: 'bg-gray-100 border-gray-300 text-gray-700', activeColor: 'bg-gray-800 border-gray-800 text-white shadow-lg shadow-gray-300' },
  { key: 'food', label: 'Foods', icon: '🍖', endpoint: 'food', color: 'bg-orange-100 border-orange-300 text-orange-700', activeColor: 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' },
  { key: 'clothes', label: 'Clothes', icon: '👕', endpoint: 'clothes', color: 'bg-blue-100 border-blue-300 text-blue-700', activeColor: 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200' },
  { key: 'grooming', label: 'Grooming', icon: '✂️', endpoint: 'grooming-essentials', color: 'bg-cyan-100 border-cyan-300 text-cyan-700', activeColor: 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-200' },
  { key: 'health', label: 'Health', icon: '💊', endpoint: 'health-supplements', color: 'bg-blue-100 border-blue-300 text-blue-700', activeColor: 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200' },
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
/** All pet labels that apply to this product (Dog, Cat, …) — used for filters and chips. */
const getPetLabelSet = (p) => {
  const out = new Set();
  const add = (raw) => {
    if (!isPetValue(raw)) return;
    out.add(normalizePetLabel(raw));
  };
  add(p.category);
  add(p.subCategory);
  const sf = normalizeFilterValue(p.suitableFor || '');
  if (sf === 'dogs') out.add('Dog');
  if (sf === 'cats') out.add('Cat');
  if (sf === 'both') {
    out.add('Dog');
    out.add('Cat');
  }
  return out;
};

const getPetCategory = (p) => {
  const labels = [...getPetLabelSet(p)].sort();
  if (!labels.length) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2 && labels.includes('Dog') && labels.includes('Cat')) return 'Dog / Cat';
  return labels.join(' · ');
};
const getProductSubcategory = (p) => {
  // Food uses category (pet) + subCategory (Dry/Wet/Treats)
  if (isPetValue(p.category) && p.subCategory) return formatFilterLabel(p.subCategory);
  // Other models usually use subCategory for pet; fall back to product type
  return formatFilterLabel(p.productType || p.subSubCategory || p._catLabel || p.category || '');
};

const SEARCH_STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'with', 'for', 'of', 'to', 'in', 'on', 'at', 'by', 'from', 'as', 'is', 'are',
]);

const normalizeSearchInput = (raw) =>
  String(raw)
    .trim()
    .toLowerCase()
    .replace(/[\u201c\u201d\u2018\u2019`"'’]/g, '')
    .replace(/\s+/g, ' ');

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Tokens used for AND search (drops noise words so rows don’t “match” random products). */
const searchTokensFromQuery = (rawQuery) => {
  const q = normalizeSearchInput(rawQuery);
  if (!q) return [];
  return q.split(/\s+/).map((t) => t.trim()).filter((t) => t && !SEARCH_STOPWORDS.has(t));
};

const tokenMatchesHaystack = (haystack, tok) => {
  if (!tok) return true;
  // Avoid "70" matching inside "170" or hex ids
  if (/^\d+(\.\d+)?$/.test(tok)) {
    return new RegExp(`(?:^|[^0-9])${escapeRegExp(tok)}(?:[^0-9]|$)`).test(haystack);
  }
  return haystack.includes(tok);
};

/** Single lowercase string for admin search (token AND across words). */
const buildSearchHaystack = (p) => {
  const parts = [
    getName(p),
    getBrand(p),
    getSubCat(p),
    p._catLabel,
    p.category,
    p.subCategory,
    p.capacity,
    p.productType,
    p.subSubCategory,
    p.itemCode,
    p.hsn,
    p.size,
    p.material,
    typeof p.description === 'string' ? p.description : '',
  ];
  if (Array.isArray(p.flavours)) parts.push(...p.flavours);
  if (Array.isArray(p.details)) parts.push(...p.details);
  if (Array.isArray(p.keyFeatures)) parts.push(...p.keyFeatures);
  if (Array.isArray(p.nutrients)) parts.push(...p.nutrients);
  if (Array.isArray(p.healthBenefits)) parts.push(...p.healthBenefits);
  if (Array.isArray(p.prices)) {
    p.prices.forEach((x) => {
      if (x?.capacity != null) parts.push(String(x.capacity));
    });
  }
  return normalizeFilterValue(parts.filter(Boolean).join(' ')).toLowerCase();
};

const matchesSearchQuery = (p, rawQuery) => {
  const trimmed = String(rawQuery).trim();
  if (!trimmed) return true;
  const tokens = searchTokensFromQuery(rawQuery);
  if (!tokens.length) return false;
  const haystack = buildSearchHaystack(p);
  return tokens.every((tok) => tokenMatchesHaystack(haystack, tok));
};

const searchRelevanceScore = (p, rawQuery) => {
  const q = normalizeSearchInput(rawQuery);
  if (!q) return 0;
  const name = getName(p).toLowerCase();
  let score = 0;
  if (name === q) score += 5000;
  else if (name.startsWith(q)) score += 2000;
  else if (name.includes(q)) score += 1000;
  const tokens = searchTokensFromQuery(rawQuery);
  const haystack = buildSearchHaystack(p);
  tokens.forEach((tok) => {
    if (name.includes(tok)) score += 40;
    else if (tokenMatchesHaystack(haystack, tok)) score += 15;
  });
  return score;
};

/** Drop only true duplicates (same admin category + same _id). Never merge across categories — different collections can reuse the same _id string. */
const dedupeProductsByCategoryAndId = (items) => {
  const seen = new Set();
  return items.filter((p) => {
    const id = p?._id != null ? String(p._id) : '';
    const ck = p._catKey || 'unknown';
    if (!id) return true;
    const key = `${ck}:${id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const ADMIN_LIST_PAGE_SIZE = 1000;
/** Rows per page in the admin product table (after category / search filters). */
const PRODUCTS_TABLE_PAGE_SIZE = 70;

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
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [selectedPetCategory, setSelectedPetCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [listPage, setListPage] = useState(1);

  // Fetch category counts on mount
  useEffect(() => { fetchCategoryCounts(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedKey]);

  useEffect(() => {
    setListPage(1);
  }, [selectedKey, searchQuery, selectedPetCategory, selectedSubCategory]);

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
        const allItems = [];
        let page = 1;
        let totalPages = 1;

        for (let i = 0; i < 400; i += 1) {
          const res = await fetch(
            `${API_BASE}/${endpoint}?page=${page}&limit=${ADMIN_LIST_PAGE_SIZE}`
          );
          const data = await res.json();
          const batch = Array.isArray(data.data) ? data.data : [];
          allItems.push(...batch);

          const tp = Number(data.totalPages);
          const cp = Number(data.currentPage);
          if (Number.isFinite(tp) && tp >= 1) totalPages = tp;

          if (!Number.isFinite(tp) || tp < 1) {
            if (batch.length === 0) break;
            page += 1;
            continue;
          }

          const cur = Number.isFinite(cp) ? cp : page;
          if (cur >= totalPages) break;
          page = cur + 1;
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
        const all = dedupeProductsByCategoryAndId(
          results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value)
        );
        setProducts(all);
      } else {
        const cat = CATEGORIES.find(c => c.key === selectedKey);
        const items = await fetchAllProductsByEndpoint(cat.endpoint);
        setProducts(
          dedupeProductsByCategoryAndId(
            items.map((p) => ({ ...p, _catKey: cat.key, _endpoint: cat.endpoint, _catLabel: cat.label }))
          )
        );
      }
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const petCategoryOptions = useMemo(() => {
    const optionMap = new Map();
    products.forEach((p) => {
      getPetLabelSet(p).forEach((label) => {
        const normalized = normalizeFilterValue(label);
        if (normalized && !optionMap.has(normalized)) optionMap.set(normalized, label);
      });
    });
    return Array.from(optionMap.values()).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const subCategoryOptions = useMemo(() => {
    if (selectedPetCategory === 'all') return [];
    const optionMap = new Map();
    products
      .filter((p) => getPetLabelSet(p).has(selectedPetCategory))
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
      : products.filter((p) => getPetLabelSet(p).has(selectedPetCategory));
    const optionMap = new Map();
    foodProducts.forEach((p) => {
      const subCategory = getProductSubcategory(p);
      const normalized = normalizeFilterValue(subCategory);
      if (normalized && !optionMap.has(normalized)) optionMap.set(normalized, subCategory);
    });
    return Array.from(optionMap.values()).sort((a, b) => a.localeCompare(b));
  }, [products, selectedKey, selectedPetCategory]);

  const filtered = useMemo(() => {
    const qTrim = searchQuery.trim();
    const list = products.filter((p) => {
      const subCategory = getProductSubcategory(p);
      const petCategoryMatch =
        selectedPetCategory === 'all' || getPetLabelSet(p).has(selectedPetCategory);
      const subCategoryMatch =
        selectedSubCategory === 'all' || normalizeFilterValue(subCategory) === normalizeFilterValue(selectedSubCategory);

      const searchMatch = matchesSearchQuery(p, qTrim);

      return petCategoryMatch && subCategoryMatch && searchMatch;
    });
    if (!qTrim) return list;
    return [...list].sort(
      (a, b) => searchRelevanceScore(b, qTrim) - searchRelevanceScore(a, qTrim)
    );
  }, [products, searchQuery, selectedPetCategory, selectedSubCategory]);

  const totalListPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_TABLE_PAGE_SIZE));
  const effectiveListPage = Math.min(listPage, totalListPages);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filtered.length / PRODUCTS_TABLE_PAGE_SIZE));
    setListPage((p) => Math.min(p, tp));
  }, [filtered.length]);

  const paginatedFiltered = useMemo(() => {
    const start = (effectiveListPage - 1) * PRODUCTS_TABLE_PAGE_SIZE;
    return filtered.slice(start, start + PRODUCTS_TABLE_PAGE_SIZE);
  }, [filtered, effectiveListPage]);

  const listRangeStart = filtered.length === 0 ? 0 : (effectiveListPage - 1) * PRODUCTS_TABLE_PAGE_SIZE + 1;
  const listRangeEnd = filtered.length === 0 ? 0 : Math.min(effectiveListPage * PRODUCTS_TABLE_PAGE_SIZE, filtered.length);

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
    navigate(`/admin/products/${catKey}/${product._id}/edit`);
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

        {/* Count + pagination (70 per page) */}
        <div className="mb-2 space-y-2">
          <p className="text-xs text-gray-500">
            {filtered.length === 0 ? (
              <>No products in this view</>
            ) : (
              <>
                Showing <span className="font-semibold text-gray-800">{listRangeStart}</span>
                –
                <span className="font-semibold text-gray-800">{listRangeEnd}</span>
                {' '}of <span className="font-semibold text-gray-800">{filtered.length}</span>
                {' '}(page {effectiveListPage} of {totalListPages}, {PRODUCTS_TABLE_PAGE_SIZE} per page)
                {searchQuery && <span className="text-purple-600"> matching &ldquo;{searchQuery}&rdquo;</span>}
              </>
            )}
          </p>
          {filtered.length > PRODUCTS_TABLE_PAGE_SIZE && (
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
            {paginatedFiltered.map((product, rowIdx) => {
              const price = getPrice(product);
              const stock = getStock(product);
              const globalRow = (effectiveListPage - 1) * PRODUCTS_TABLE_PAGE_SIZE + rowIdx;
              return (
                <div key={`m-${globalRow}-${product._catKey}-${String(product._id)}`} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
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
                        {getPetCategory(product) && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#205EA9]/10 text-[#205EA9]">Category: {getPetCategory(product)}</span>}
                        {getProductSubcategory(product) && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">Sub: {getProductSubcategory(product)}</span>}
                        {selectedKey === 'all' && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{product._catLabel}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-gray-900 text-sm">{formatRupee(price.sale)}</span>
                        
                       
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: stock + actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {stock !== '—' ? (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${stock > 10 ? 'bg-blue-50 text-blue-700' : stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
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
                  {paginatedFiltered.map((product, rowIdx) => {
                    const price = getPrice(product);
                    const stock = getStock(product);
                    const globalRow = (effectiveListPage - 1) * PRODUCTS_TABLE_PAGE_SIZE + rowIdx;
                    return (
                      <tr key={`d-${globalRow}-${product._catKey}-${String(product._id)}`} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 p-0.5 border border-gray-200 shrink-0 overflow-hidden">
                              <img src={getImage(product)} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-xs truncate max-w-[200px]">{getName(product)}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {getBrand(product) && <span className="text-[10px] text-gray-500">{getBrand(product)}</span>}
                                {getPetCategory(product) && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-[#205EA9]/10 text-[#205EA9]">Category: {getPetCategory(product)}</span>}
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
                          <p className="font-bold text-gray-900 text-xs">{formatRupee(price.sale)}</p>
                        </td>
                        <td className="px-3 py-2"><p className="text-xs text-gray-600">{getExpiry(product)}</p></td>
                        <td className="px-3 py-2">
                          {stock === '—' ? <span className="text-xs text-gray-400">—</span> : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${stock > 10 ? 'bg-blue-50 text-blue-700' : stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
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
          <div className="bg-blue-600 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-sm">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            Product deleted successfully!
          </div>
        </div>
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
    if (typeof val === 'boolean') return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{val ? 'Yes' : 'No'}</span>;

    // Number
    if (typeof val === 'number') {
      if (key.toLowerCase().includes('price') || key.toLowerCase().includes('mrp')) return <span className="font-semibold text-gray-900">{formatRupee(val)}</span>;
      if (key.toLowerCase().includes('stock')) return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val > 10 ? 'bg-blue-50 text-blue-700' : val > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{val} {val === 0 ? '(Out of stock)' : 'in stock'}</span>;
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


export default AdminMyProducts;
