import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const DOG_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg';
const CAT_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg';

// ─── Reusable ProductCard Component ─────────────────────────────────────────
const ProductCard = ({ product, wishlistIds = [], onWishlistToggle }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [addingToCart, setAddingToCart] = useState(false);

  const isInWishlist = wishlistIds.includes(product._id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!token) {
      // Use guest cart
      try {
        setAddingToCart(true);
        const { addToGuestCart } = await import('../utils/guestCart');
        addToGuestCart({
          productId: product._id,
          quantity: 1,
          selectedSize: 0,
          productType: 'Food',
        });
      } catch (err) {
        console.error('Add to guest cart error:', err);
      } finally {
        setAddingToCart(false);
      }
      return;
    }
    try {
      setAddingToCart(true);
      await axios.post(
        `${API_BASE}/cart`,
        { productId: product._id, quantity: 1, selectedSize: 0, productType: 'Food' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event('cart-wishlist-update'));
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!token) {
      // Use guest wishlist with full product data
      const { addToGuestWishlist, removeFromGuestWishlist, isInGuestWishlist } = await import('../utils/guestCart');
      if (isInGuestWishlist(product._id)) {
        removeFromGuestWishlist(product._id);
      } else {
        addToGuestWishlist(product);
      }
      if (onWishlistToggle) onWishlistToggle(product._id);
      return;
    }
    if (onWishlistToggle) onWishlistToggle(product._id);
  };

  // Get the lowest discounted price from the prices array
  const startingPrice = useMemo(() => {
    if (!product.prices || product.prices.length === 0) return null;
    return product.prices.reduce(
      (min, p) => (p.discountedPrice < min.discountedPrice ? p : min),
      product.prices[0]
    );
  }, [product.prices]);

  // Calculate discount percentage
  const discountPercent = startingPrice
    ? Math.round(((startingPrice.mrp - startingPrice.discountedPrice) / startingPrice.mrp) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-0">
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-50">
        <div className="aspect-square flex items-center justify-center p-2 sm:p-4">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.productName}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
              🐾
            </div>
          )}
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {discountPercent}% OFF
          </span>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
            <img src={product.category === 'Dog' ? DOG_ICON : CAT_ICON} alt={product.category} className="w-4 h-4 object-contain inline" /> {product.category}
          </span>
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-12 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all z-10 hover:scale-110"
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isInWishlist ? (
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4">
        {/* Brand */}
        <p className="text-xs font-semibold text-[#65a30d] uppercase tracking-wide mb-1">
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight mb-2 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
          {product.productName}
        </h3>

        {/* SubCategory Badge */}
        <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full mb-3">
          {product.subCategory}
        </span>

        {/* Pricing */}
        {startingPrice && (
          <div className="flex items-end gap-2 mb-3">
            <span className="text-base sm:text-xl font-bold text-gray-900">
              ₹{startingPrice.discountedPrice}
            </span>
            {startingPrice.mrp > startingPrice.discountedPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{startingPrice.mrp}
              </span>
            )}
            {product.prices.length > 1 && (
              <span className="text-xs text-gray-500 ml-auto">
                {product.prices.length} sizes
              </span>
            )}
          </div>
        )}

        {/* Flavours */}
        {product.flavours?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.flavours.slice(0, 3).map((f, i) => (
              <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                {f}
              </span>
            ))}
            {product.flavours.length > 3 && (
              <span className="text-xs text-gray-400">+{product.flavours.length - 3} more</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => navigate(`/product/${product._id}?type=/food`)}
            className="flex-1 bg-[#205ea9] hover:bg-[#1a4a7a] text-white font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-all duration-200 text-sm"
          >
            View Details
          </button>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="px-4 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 text-sm border border-gray-200 disabled:opacity-50"
            title="Add to Cart"
          >
            {addingToCart ? '...' : '🛒'}
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const token = localStorage.getItem('token');

  // Fetch wishlist IDs for logged-in user
  useEffect(() => {
    if (!token) return;
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
  }, [token]);

  const handleWishlistToggle = async (productId) => {
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

        const res = await axios.get(`${API_BASE}/food`, { params });

        if (res.data.success) {
          setProducts(res.data.data);
          setTotal(res.data.total);
        } else {
          setError('Failed to fetch products');
        }
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
        <div className="w-8 h-8 border-2 border-[#65a30d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Title based on category
  const pageTitle = category
    ? `${category} Food Products`
    : 'All Food Products';

  const categoryIcon = category === 'Dog' ? DOG_ICON : category === 'Cat' ? CAT_ICON : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-2 text-gray-400 text-sm flex items-center gap-2">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  to={`/category/${category.toLowerCase()}s`}
                  className="hover:text-gray-700 transition-colors"
                >
                  {category}s
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">
              {activeSubCategory !== 'All' ? activeSubCategory : 'All Products'}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 flex items-center gap-3">
                {categoryIcon ? (
                  <img src={categoryIcon} alt={category} className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                ) : (
                  <span className="text-4xl md:text-5xl">🐾</span>
                )}
                {pageTitle}
              </h1>
              <p className="mt-1 text-gray-500 text-sm">
                {total} product{total !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label className="text-gray-500 text-sm font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#65a30d] cursor-pointer min-w-[180px]"
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

      {/* SubCategory Filter Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
            {subCategoryOptions.map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubCategoryChange(sub)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeSubCategory === sub
                    ? 'bg-[#65a30d] text-white shadow-md shadow-green-200'
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
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin mb-4"></div>
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
                className="bg-[#65a30d] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors"
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
                  className="bg-[#65a30d] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    wishlistIds={wishlistIds}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>

              {/* Results Count */}
              <div className="mt-8 text-center text-gray-500 text-sm">
                Showing {products.length} of {total} products
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
