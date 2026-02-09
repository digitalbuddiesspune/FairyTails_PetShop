import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const DOG_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg';
const CAT_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg';

// Map category slug → Food model category enum value
const slugToFoodCategory = {
  'dogs': 'Dog',
  'cats': 'Cat',
};

// Color mapping for category accents
const categoryAccents = {
  'dogs': { tab: 'bg-amber-500', tabText: 'text-amber-700', tabBg: 'bg-amber-50', border: 'border-amber-200' },
  'cats': { tab: 'bg-purple-500', tabText: 'text-purple-700', tabBg: 'bg-purple-50', border: 'border-purple-200' },
  'toys': { tab: 'bg-blue-500', tabText: 'text-blue-700', tabBg: 'bg-blue-50', border: 'border-blue-200' },
  'accessories': { tab: 'bg-rose-500', tabText: 'text-rose-700', tabBg: 'bg-rose-50', border: 'border-rose-200' },
  'grooming-and-essential': { tab: 'bg-cyan-500', tabText: 'text-cyan-700', tabBg: 'bg-cyan-50', border: 'border-cyan-200' },
  'health-and-supplement': { tab: 'bg-green-500', tabText: 'text-green-700', tabBg: 'bg-green-50', border: 'border-green-200' },
  'beds-and-house': { tab: 'bg-pink-500', tabText: 'text-pink-700', tabBg: 'bg-pink-50', border: 'border-pink-200' },
};
const defaultAccent = { tab: 'bg-[#65a30d]', tabText: 'text-gray-700', tabBg: 'bg-gray-50', border: 'border-gray-200' };

const sortOptions = [
  { value: '', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

// ─── ProductCard ────────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlistIds = [], onWishlistToggle }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [addingToCart, setAddingToCart] = useState(false);

  const isInWishlist = wishlistIds.includes(product._id);

  const startingPrice = useMemo(() => {
    if (!product.prices || product.prices.length === 0) return null;
    return product.prices.reduce(
      (min, p) => (p.discountedPrice < min.discountedPrice ? p : min),
      product.prices[0]
    );
  }, [product.prices]);

  const discountPercent = startingPrice
    ? Math.round(((startingPrice.mrp - startingPrice.discountedPrice) / startingPrice.mrp) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!token) { navigate('/signin'); return; }
    try {
      setAddingToCart(true);
      await axios.post(`${API_BASE}/cart`, { productId: product._id, quantity: 1, selectedSize: 0 }, { headers: { Authorization: `Bearer ${token}` } });
      window.dispatchEvent(new Event('cart-wishlist-update'));
    } catch (err) { console.error(err); }
    finally { setAddingToCart(false); }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!token) { navigate('/signin'); return; }
    if (onWishlistToggle) onWishlistToggle(product._id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative overflow-hidden bg-gray-50">
        <Link to={`/product/${product._id}`}>
          <div className="aspect-square flex items-center justify-center p-4">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.productName} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🐾</div>
            )}
          </div>
        </Link>
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{discountPercent}% OFF</span>
        )}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
            <img src={product.category === 'Dog' ? DOG_ICON : CAT_ICON} alt={product.category} className="w-4 h-4 object-contain inline" /> {product.category}
          </span>
        </div>
        <button
          onClick={handleWishlistToggle}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all z-10 hover:scale-110"
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isInWishlist ? (
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          )}
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-[#65a30d] uppercase tracking-wide mb-1">{product.brand}</p>
        <Link to={`/product/${product._id}`}>
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5rem] hover:text-[#65a30d] transition-colors">{product.productName}</h3>
        </Link>
        <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full mb-3">{product.subCategory}</span>
        {startingPrice && (
          <div className="flex items-end gap-2 mb-3">
            <span className="text-xl font-bold text-gray-900">₹{startingPrice.discountedPrice}</span>
            {startingPrice.mrp > startingPrice.discountedPrice && (
              <span className="text-sm text-gray-400 line-through">₹{startingPrice.mrp}</span>
            )}
            {product.prices.length > 1 && (
              <span className="text-xs text-gray-500 ml-auto">{product.prices.length} sizes</span>
            )}
          </div>
        )}
        <div className="flex gap-2 mt-1">
          <Link to={`/product/${product._id}`} className="flex-1 text-center bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white font-semibold py-2.5 rounded-xl hover:from-[#4d7c0f] hover:to-[#3f6212] active:scale-[0.98] transition-all duration-200 text-sm">
            View Details
          </Link>
          <button onClick={handleAddToCart} disabled={addingToCart} className="px-4 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 text-sm border border-gray-200 disabled:opacity-50" title="Add to Cart">
            {addingToCart ? '...' : '🛒'}
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const activeSubCategory = searchParams.get('subCategory') || 'All';
  const token = localStorage.getItem('token');

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

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
        const foodCategory = slugToFoodCategory[category.slug];
        if (!foodCategory) {
          // Non-food categories — no products yet
          setProducts([]);
          setTotal(0);
          setProductsLoading(false);
          return;
        }
        const params = { category: foodCategory };
        if (activeSubCategory && activeSubCategory !== 'All') {
          params.subCategory = activeSubCategory;
        }
        if (sortBy) params.sort = sortBy;

        const res = await axios.get(`${API_BASE}/food`, { params });
        if (res.data.success) {
          setProducts(res.data.data);
          setTotal(res.data.total);
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
    if (!token) return;
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`${API_BASE}/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setWishlistIds((res.data.data.items || []).map((i) => i._id || i));
      } catch (err) { /* silent */ }
    };
    fetchWishlist();
  }, [token]);

  const handleWishlistToggle = async (productId) => {
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
          <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Category Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The category you are looking for does not exist.'}</p>
          <Link to="/" className="inline-block bg-[#65a30d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4d7c0f] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const accent = categoryAccents[category.slug] || defaultAccent;
  const subCategories = category.subcategories?.map((s) => s.name) || [];
  const subCategoryTabs = ['All', ...subCategories];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb + Title Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-gray-400 text-sm flex items-center gap-2 mb-2">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{category.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              {category.image && (
                <img src={category.image} alt={category.name} className="w-16 h-16 object-contain" />
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-sm text-gray-500">{total} product{total !== 1 ? 's' : ''} found</p>
              </div>
            </div>
            {/* Sort */}
            <div className="flex items-center gap-3">
              <label className="text-gray-500 text-sm font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#65a30d] cursor-pointer min-w-[170px]"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* SubCategory Tabs */}
      {subCategories.length > 0 && (
        <section className="bg-white border-b border-gray-200 sticky top-[108px] z-30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              {subCategoryTabs.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSubCategoryChange(sub)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeSubCategory === sub
                      ? `${accent.tab} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          {productsLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-lg">Loading products...</p>
            </div>
          )}

          {!productsLoading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Found</h3>
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
              <Link to="/" className="bg-[#65a30d] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors inline-block">
                Back to Home
              </Link>
            </div>
          )}

          {!productsLoading && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    wishlistIds={wishlistIds}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>
              <div className="mt-8 text-center text-gray-500 text-sm">
                Showing {products.length} of {total} products
              </div>
            </>
          )}
        </div>
      </section>

      {/* Browse More */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Looking for more?</h3>
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
