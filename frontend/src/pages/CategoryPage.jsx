import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getApiBearerToken } from '../auth/session';
import ProductCard from '../components/ProductCard';
import { type } from '../styles/typography';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const DOG_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg';
const CAT_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg';

// Map category slug → Food/Clothes model category enum value
const slugToFoodCategory = {
  'dogs': 'Dog',
  'cats': 'Cat',
};

// Subcategory names that map to the Clothes collection
const clothesSubCategories = ['Dog Clothes', 'Cat Clothes'];

// Subcategory names that map to Accessories with productType
const accessoryProductTypes = ['Collar & Leash'];

// Category slugs that are served entirely by the Toys collection
const toysCategorySlug = 'toys';

// Category slug for health supplements
const healthSupplementSlug = 'health-and-supplement';

// Category slug for beds & house
const houseSlug = 'beds-and-house';

// Category slug for accessories
const accessoriesSlug = 'accessories';

// Category slug for grooming essentials
const groomingSlug = 'grooming-and-essential';

// Normalise subcategory tab label to DB value
// e.g. "Dogs" → "dog", "Cats" → "cat", "Dog" → "Dog"
const normaliseSubCategory = (sub) => {
  const lower = sub.toLowerCase();
  if (lower === 'dogs') return 'dog';
  if (lower === 'cats') return 'cat';
  return lower;
};

// Color mapping for category accents
const categoryAccents = {
  'dogs': { tab: 'bg-amber-500', tabText: 'text-amber-700', tabBg: 'bg-amber-50', border: 'border-amber-200' },
  'cats': { tab: 'bg-purple-500', tabText: 'text-purple-700', tabBg: 'bg-purple-50', border: 'border-purple-200' },
  'toys': { tab: 'bg-blue-500', tabText: 'text-blue-700', tabBg: 'bg-blue-50', border: 'border-blue-200' },
  'accessories': { tab: 'bg-rose-500', tabText: 'text-rose-700', tabBg: 'bg-rose-50', border: 'border-rose-200' },
  'grooming-and-essential': { tab: 'bg-cyan-500', tabText: 'text-cyan-700', tabBg: 'bg-cyan-50', border: 'border-cyan-200' },
  'health-and-supplement': { tab: 'bg-blue-500', tabText: 'text-blue-700', tabBg: 'bg-blue-50', border: 'border-blue-200' },
  'beds-and-house': { tab: 'bg-pink-500', tabText: 'text-pink-700', tabBg: 'bg-pink-50', border: 'border-pink-200' },
};
const defaultAccent = { tab: 'bg-[#205EA9]', tabText: 'text-gray-700', tabBg: 'bg-gray-50', border: 'border-gray-200' };

const sortOptions = [
  { value: '', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

// ─── Main CategoryPage ──────────────────────────────────────────────────────
const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  const [currentApiEndpoint, setCurrentApiEndpoint] = useState(null);
  const [authEpoch, setAuthEpoch] = useState(0);

  const activeSubCategory = searchParams.get('subCategory') || 'All';

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    const onAuth = () => setAuthEpoch((e) => e + 1);
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  const fetchAllPages = async (endpoint, baseParams = {}) => {
    let page = 1;
    let allItems = [];
    let hasNextPage = true;
    let safety = 0;

    while (hasNextPage && safety < 100) {
      const res = await axios.get(`${API_BASE}${endpoint}`, {
        params: { ...baseParams, page },
      });
      const data = res.data || {};
      const batch = Array.isArray(data.data) ? data.data : [];
      allItems = [...allItems, ...batch];

      const totalPages = Number(data.totalPages);
      const currentPage = Number(data.currentPage || page);
      hasNextPage = Number.isFinite(totalPages) ? currentPage < totalPages : false;
      page = currentPage + 1;
      safety += 1;
    }

    return allItems;
  };

  // Fetch category info
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/categories/${slug}`);
        const data = await res.json();
        if (data.success) {
          setCategory(data.data);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  // Fetch products for this category
  useEffect(() => {
    if (!category) return;
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const isToys = category.slug === toysCategorySlug;
        const foodCategory = slugToFoodCategory[category.slug];

        const isHealthSup = category.slug === healthSupplementSlug;
        const isHouse = category.slug === houseSlug;
        const isAccessories = category.slug === accessoriesSlug;
        const isGroomingCat = category.slug === groomingSlug;

        if (isGroomingCat) {
          // ── Grooming & Essential category ──
          const params = {};
          if (activeSubCategory && activeSubCategory !== 'All') {
            params.subCategory = normaliseSubCategory(activeSubCategory);
          }
          if (sortBy) params.sort = sortBy;
          const allItems = await fetchAllPages('/grooming-essentials', params);
          setProducts(allItems);
          setTotal(allItems.length);
          setCurrentApiEndpoint('/grooming-essentials');
        } else if (isAccessories) {
          // ── Accessories category ──
          const params = {};
          if (activeSubCategory && activeSubCategory !== 'All') {
            params.subCategory = normaliseSubCategory(activeSubCategory);
          }
          if (sortBy) params.sort = sortBy;
          const allItems = await fetchAllPages('/accessories', params);
          setProducts(allItems);
          setTotal(allItems.length);
          setCurrentApiEndpoint('/accessories');
        } else if (isHealthSup) {
          // ── Health & Supplement category ──
          const params = {};
          if (activeSubCategory && activeSubCategory !== 'All') {
            params.subCategory = normaliseSubCategory(activeSubCategory);
          }
          if (sortBy) params.sort = sortBy;
          const allItems = await fetchAllPages('/health-supplements', params);
          setProducts(allItems);
          setTotal(allItems.length);
          setCurrentApiEndpoint('/health-supplements');
        } else if (isHouse) {
          // ── Beds & House category ──
          const params = {};
          if (activeSubCategory && activeSubCategory !== 'All') {
            params.subCategory = normaliseSubCategory(activeSubCategory);
          }
          if (sortBy) params.sort = sortBy;
          const allItems = await fetchAllPages('/houses', params);
          setProducts(allItems);
          setTotal(allItems.length);
          setCurrentApiEndpoint('/houses');
        } else if (isToys) {
          // ── Toys category: subcategories are "Dog" / "Cat" ──
          const params = {};
          if (activeSubCategory && activeSubCategory !== 'All') {
            // Toys model stores "Dog" / "Cat" (capitalised, no trailing 's')
            const sub = normaliseSubCategory(activeSubCategory); // "dog" or "cat"
            params.subCategory = sub.charAt(0).toUpperCase() + sub.slice(1); // "Dog" or "Cat"
          }
          if (sortBy) params.sort = sortBy;
          const allItems = await fetchAllPages('/toys', params);
          setProducts(allItems);
          setTotal(allItems.length);
          setCurrentApiEndpoint('/toys');
        } else if (foodCategory) {
          // ── Dogs / Cats categories ──
          const isClothes = clothesSubCategories.includes(activeSubCategory);
          const isAccessoryType = accessoryProductTypes.includes(activeSubCategory);
          const isAll = activeSubCategory === 'All';

          if (isAccessoryType) {
            // Fetch accessories for "Collar & Leash" - single product type
            const params = { 
              subCategory: foodCategory.toLowerCase(), // "dog" or "cat"
            };
            if (sortBy) params.sort = sortBy;
            // Fetch all accessories for this pet category, then filter by productType or subSubCategory
            const allItems = await fetchAllPages('/accessories', params);
            // Filter to show only Collar & Leash products (single type)
            const filteredProducts = allItems.filter(product => 
              product.productType === 'collar-leash' || product.subSubCategory === 'collar-leash'
            );
            setProducts(filteredProducts);
            setTotal(filteredProducts.length);
            setCurrentApiEndpoint('/accessories');
          } else if (isClothes) {
            const params = { category: foodCategory };
            if (sortBy) params.sort = sortBy;
            const allItems = await fetchAllPages('/clothes', params);
            setProducts(allItems);
            setTotal(allItems.length);
            setCurrentApiEndpoint('/clothes');
          } else if (isAll) {
            // Fetch food + clothes and combine
            const foodParams = { category: foodCategory };
            const clothesParams = { category: foodCategory };
            if (sortBy) {
              foodParams.sort = sortBy;
              clothesParams.sort = sortBy;
            }
            const [foodData, clothesData] = await Promise.all([
              fetchAllPages('/food', foodParams),
              fetchAllPages('/clothes', clothesParams),
            ]);
            const combined = [...foodData, ...clothesData];
            setProducts(combined);
            setTotal(combined.length);
            setCurrentApiEndpoint(null); // Mixed products, no single endpoint
          } else {
            // Food subcategory filter
            const params = { category: foodCategory, subCategory: activeSubCategory };
            if (sortBy) params.sort = sortBy;
            const allItems = await fetchAllPages('/food', params);
            setProducts(allItems);
            setTotal(allItems.length);
            setCurrentApiEndpoint('/food');
          }
        } else {
          // Other categories — no products yet
          setProducts([]);
          setTotal(0);
          setCurrentApiEndpoint(null);
        }
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [category, activeSubCategory, sortBy]);

  // Fetch wishlist
  useEffect(() => {
    const token = getApiBearerToken();
    if (!token) {
      setWishlistIds([]);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`${API_BASE}/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setWishlistIds((res.data.data.items || []).map((i) => i._id || i));
      } catch (err) { /* silent */ }
    };
    fetchWishlist();
  }, [authEpoch]);

  const handleWishlistToggle = async (productId) => {
    const token = getApiBearerToken();
    if (!token) return;
    try {
      const res = await axios.post(`${API_BASE}/wishlist`, { productId }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setWishlistIds((res.data.data.items || []).map((i) => i._id || i));
        window.dispatchEvent(new Event('cart-wishlist-update'));
      }
    } catch (err) { console.error(err); }
  };

  const handleSubCategoryChange = (sub) => {
    const newParams = new URLSearchParams(searchParams);
    if (sub === 'All') {
      newParams.delete('subCategory');
    } else {
      newParams.set('subCategory', sub);
    }
    setSearchParams(newParams);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-gray-500 ${type.body}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl mb-4">😿</p>
          <h2 className={`${type.h2} text-gray-800 mb-2`}>Category Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The category you are looking for does not exist.'}</p>
          <Link to="/" className="inline-block bg-[#205EA9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1d4f8f] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const accent = categoryAccents[category.slug] || defaultAccent;
  const subCategories = category.subcategories?.map((s) => s.name) || [];
  const subCategoryTabs = ['All', ...subCategories];

  const getSubIcon = (name) => {
    if (name === 'All') return '📋';
    if (name === 'Dry Food') return '🥫';
    if (name === 'Wet Food') return '🍖';
    if (name === 'Treats') return '🦴';
    if (name === 'Dog Clothes') return '👕';
    if (name === 'Cat Clothes') return '👗';
    if (name === 'Collar & Leash') return '🔗';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category toolbar: title + filters + sort */}
      <section className={`bg-white border-b border-gray-200 ${subCategories.length > 0 ? 'sticky top-14 md:top-[108px] z-30' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
          {subCategories.length > 0 ? (
            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
              <div className="flex items-center justify-between gap-2 md:justify-start md:shrink-0">
                <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                  {category.image && (
                    <img src={category.image} alt={category.name} className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
                  )}
                  <h1 className={`${type.h3} text-gray-900 truncate`}>{category.name}</h1>
                </div>
                <div className="flex items-center shrink-0 md:hidden">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2 py-1 ${type.caption} focus:outline-none focus:ring-2 focus:ring-[#2f5a87] cursor-pointer max-w-[118px]`}
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5 md:flex-1 md:min-w-0">
                {subCategoryTabs.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleSubCategoryChange(sub)}
                    className={`px-2.5 py-1 rounded-full ${type.captionMedium} whitespace-nowrap transition-all duration-200 shrink-0 ${
                      activeSubCategory === sub
                        ? `${accent.tab} text-white shadow-sm`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getSubIcon(sub) && <span className="mr-0.5">{getSubIcon(sub)}</span>}
                    {sub}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
                <label className={`hidden lg:inline text-gray-500 ${type.label} whitespace-nowrap`}>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 ${type.bodySm} focus:outline-none focus:ring-2 focus:ring-[#2f5a87] cursor-pointer min-w-[150px]`}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                {category.image && (
                  <img src={category.image} alt={category.name} className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
                )}
                <h1 className={`${type.h3} text-gray-900 truncate`}>{category.name}</h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className={`hidden lg:inline text-gray-500 ${type.label} whitespace-nowrap`}>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 ${type.bodySm} focus:outline-none focus:ring-2 focus:ring-[#2f5a87] cursor-pointer min-w-[118px] sm:min-w-[150px]`}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-3 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {productsLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className={`text-gray-500 ${type.body}`}>Loading products...</p>
            </div>
          )}

          {!productsLoading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className={`${type.h3} text-gray-800 mb-2`}>No Products Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                No {activeSubCategory !== 'All' ? activeSubCategory.toLowerCase() + ' ' : ''}products available in {category.name} yet. Check back soon!
              </p>
              {activeSubCategory !== 'All' && (
                <button
                  onClick={() => handleSubCategoryChange('All')}
                  className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors mr-3"
                >
                  View All
                </button>
              )}
              <Link to="/" className="bg-[#205EA9] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1d4f8f] transition-colors inline-block">
                Back to Home
              </Link>
            </div>
          )}

          {!productsLoading && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    wishlistIds={wishlistIds}
                    onWishlistToggle={handleWishlistToggle}
                    apiEndpoint={currentApiEndpoint}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Browse More */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h3 className={`${type.h3} text-gray-900 mb-2`}>Looking for more?</h3>
          <p className="text-gray-500 mb-6">Explore other categories for your pets</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {category.slug !== 'dogs' && (
              <Link to="/category/dogs" className="px-5 py-2.5 bg-amber-50 text-amber-700 font-semibold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
                <img src={DOG_ICON} alt="Dogs" className="w-5 h-5 object-contain inline" /> Dogs
              </Link>
            )}
            {category.slug !== 'cats' && (
              <Link to="/category/cats" className="px-5 py-2.5 bg-purple-50 text-purple-700 font-semibold rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors">
                <img src={CAT_ICON} alt="Cats" className="w-5 h-5 object-contain inline" /> Cats
              </Link>
            )}
            <Link to="/" className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors">
              🏠 All Categories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;
