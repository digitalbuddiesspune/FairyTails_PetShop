import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiBearerToken } from '../auth/session';
import ProductCard from '../components/ProductCard';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const DOG_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg';
const CAT_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg';

// ─── Sub-category filter tabs ────────────────────────────────────────────────
const subCategoryOptions = ['All', 'Dry Food', 'Wet Food', 'Treats'];

const sortOptions = [
  { value: '', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

// Map category param → category slug for redirect
const categoryToSlug = { 'Dog': 'dogs', 'Cat': 'cats' };

// ─── Main CategoryProducts Page ──────────────────────────────────────────────
const CategoryProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read params from URL
  const category = searchParams.get('category') || '';
  const subCategory = searchParams.get('subCategory') || '';

  // Redirect to CategoryPage when category is Dog/Cat so subcategory view matches main category layout
  const categorySlug = categoryToSlug[category];
  useEffect(() => {
    if (categorySlug) {
      const target = subCategory ? `/category/${categorySlug}?subCategory=${encodeURIComponent(subCategory)}` : `/category/${categorySlug}`;
      navigate(target, { replace: true });
    }
  }, [categorySlug, subCategory, navigate]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [activeSubCategory, setActiveSubCategory] = useState(subCategory || 'All');
  const [sortBy, setSortBy] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  const [authEpoch, setAuthEpoch] = useState(0);

  useEffect(() => {
    const onAuth = () => setAuthEpoch((e) => e + 1);
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  const fetchAllFoodPages = async (baseParams = {}) => {
    let page = 1;
    let allItems = [];
    let hasNextPage = true;
    let safety = 0;

    while (hasNextPage && safety < 100) {
      const res = await axios.get(`${API_BASE}/food`, {
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

  // Fetch wishlist IDs for logged-in user
  useEffect(() => {
    const token = getApiBearerToken();
    if (!token) {
      setWishlistIds([]);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`${API_BASE}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setWishlistIds((res.data.data.items || []).map((item) => item._id || item));
        }
      } catch (err) {
        // silently fail
      }
    };
    fetchWishlist();
  }, [authEpoch]);

  const handleWishlistToggle = async (productId) => {
    const token = getApiBearerToken();
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_BASE}/wishlist`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setWishlistIds((res.data.data.items || []).map((item) => item._id || item));
        window.dispatchEvent(new Event('cart-wishlist-update'));
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  // Sync activeSubCategory when URL changes
  useEffect(() => {
    setActiveSubCategory(subCategory || 'All');
  }, [subCategory]);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (category) params.category = category;
        if (activeSubCategory && activeSubCategory !== 'All') {
          params.subCategory = activeSubCategory;
        }
        if (sortBy) params.sort = sortBy;

        const allItems = await fetchAllFoodPages(params);
        setProducts(allItems);
        setTotal(allItems.length);
      } catch (err) {
        console.error('Fetch products error:', err);
        setError(err.response?.data?.message || 'Something went wrong while fetching products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, activeSubCategory, sortBy]);

  // Handle subcategory tab click
  const handleSubCategoryChange = (sub) => {
    setActiveSubCategory(sub);
    const newParams = new URLSearchParams(searchParams);
    if (sub === 'All') {
      newParams.delete('subCategory');
    } else {
      newParams.set('subCategory', sub);
    }
    setSearchParams(newParams);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Don't render "X Food Products" layout — redirecting to CategoryPage
  if (categorySlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#205EA9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Title based on category
  const pageTitle = category
    ? `${category}s`
    : 'All Products';

  const categoryIcon = category === 'Dog' ? DOG_ICON : category === 'Cat' ? CAT_ICON : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category toolbar: title + filters + sort */}
      <section className="bg-white border-b border-gray-200 sticky top-14 md:top-[108px] z-30">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
            <div className="flex items-center justify-between gap-2 md:justify-start md:shrink-0">
              <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                {categoryIcon ? (
                  <img src={categoryIcon} alt={category} className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
                ) : (
                  <span className="text-xl sm:text-2xl">🐾</span>
                )}
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{pageTitle}</h1>
              </div>
              <div className="flex items-center shrink-0 md:hidden">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#2f5a87] cursor-pointer max-w-[118px]"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5 md:flex-1 md:min-w-0">
              {subCategoryOptions.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSubCategoryChange(sub)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    activeSubCategory === sub
                      ? 'bg-[#205EA9] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sub === 'All' && '📋 '}
                  {sub === 'Dry Food' && '🥫 '}
                  {sub === 'Wet Food' && '🍖 '}
                  {sub === 'Treats' && '🦴 '}
                  {sub}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
              <label className="hidden lg:inline text-gray-500 text-sm font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2f5a87] cursor-pointer min-w-[150px]"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-3 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-lg">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-5xl mb-4">⚠️</p>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#205EA9] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1d4f8f] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                We couldn't find any {category ? `${category.toLowerCase()} ` : ''}
                {activeSubCategory !== 'All' ? activeSubCategory.toLowerCase() + ' ' : ''}
                products. Try changing your filters or check back later.
              </p>
              <div className="flex gap-3">
                {activeSubCategory !== 'All' && (
                  <button
                    onClick={() => handleSubCategoryChange('All')}
                    className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    View All
                  </button>
                )}
                <Link
                  to="/"
                  className="bg-[#205EA9] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1d4f8f] transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    wishlistIds={wishlistIds}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>

            </>
          )}
        </div>
      </section>

      {/* Browse More Section */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Looking for more?</h3>
          <p className="text-gray-500 mb-6">Explore other categories for your pets</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {category !== 'Dog' && (
              <Link
                to="/category/dogs"
                className="px-5 py-2.5 bg-amber-50 text-amber-700 font-semibold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <img src={DOG_ICON} alt="Dog" className="w-5 h-5 object-contain inline" /> Dogs
              </Link>
            )}
            {category !== 'Cat' && (
              <Link
                to="/category/cats"
                className="px-5 py-2.5 bg-purple-50 text-purple-700 font-semibold rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <img src={CAT_ICON} alt="Cat" className="w-5 h-5 object-contain inline" /> Cats
              </Link>
            )}
            <Link
              to="/"
              className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors"
            >
              🏠 All Categories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryProducts;
