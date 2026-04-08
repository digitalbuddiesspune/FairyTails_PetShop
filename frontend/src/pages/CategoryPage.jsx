import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getApiBearerToken } from '../auth/session';

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

// ─── ProductCard ────────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlistIds = [], onWishlistToggle, apiEndpoint }) => {
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);

  const isInWishlist = wishlistIds.includes(product._id);

  // Normalise across product types
  const priceOptions = product.prices || product.sizes || product.variants || [];
  const isToyProduct = product.category === 'Toy';
  const isHealthSupplement = product.category === 'health-supplement';
  const isHouseProduct = product.category === 'house';
  const isAccessory = product.category === 'accessories';
  const isGrooming = product.category === 'grooming-essentials';
  const hasFlatPrice = isToyProduct || isHealthSupplement || isHouseProduct;
  
  // Check if it's a food, accessory, toy, health, grooming, or house product with new structure (flat fields instead of prices/sizes/variants array)
  const isFoodWithNewStructure = product.mrp !== undefined && product.discountPrice !== undefined && product.capacity !== undefined;
  const isAccessoryWithNewStructure = isAccessory && product.mrp !== undefined && product.discountPrice !== undefined;
  const isToyWithNewStructure = isToyProduct && product.mrp !== undefined && product.discountPrice !== undefined;
  const isHealthWithNewStructure = isHealthSupplement && product.mrp !== undefined && product.discountPrice !== undefined;
  const isGroomingWithNewStructure = isGrooming && product.mrp !== undefined && product.discountPrice !== undefined;
  const isHouseWithNewStructure = isHouseProduct && product.mrp !== undefined && product.discountPrice !== undefined;

  // Normalised display fields
  const displayName = product.productName || product.name || 'Unnamed Product';
  const displayImage = product.images?.[0] || product.image || null;

  const startingPrice = useMemo(() => {
    // New food structure (flat fields)
    if (isFoodWithNewStructure) {
      const mrp = product.mrp;
      const disc = product.discountPrice || mrp;
      if (!mrp) return null;
      return { mrp, discountedPrice: disc };
    }
    // New accessory structure (flat fields)
    if (isAccessoryWithNewStructure) {
      const mrp = product.mrp;
      const disc = product.discountPrice || mrp;
      if (!mrp) return null;
      return { mrp, discountedPrice: disc };
    }
    // New toy structure (flat fields)
    if (isToyWithNewStructure) {
      const mrp = product.mrp;
      const disc = product.discountPrice || mrp;
      if (!mrp) return null;
      return { mrp, discountedPrice: disc };
    }
    // New health structure (flat fields)
    if (isHealthWithNewStructure) {
      const mrp = product.mrp;
      const disc = product.discountPrice || mrp;
      if (!mrp) return null;
      return { mrp, discountedPrice: disc };
    }
    // New grooming structure (flat fields)
    if (isGroomingWithNewStructure) {
      const mrp = product.mrp;
      const disc = product.discountPrice || mrp;
      if (!mrp) return null;
      return { mrp, discountedPrice: disc };
    }
    // New house structure (flat fields)
    if (isHouseWithNewStructure) {
      const mrp = product.mrp;
      const disc = product.discountPrice || mrp;
      if (!mrp) return null;
      return { mrp, discountedPrice: disc };
    }
    // Flat price products (old structures)
    if (hasFlatPrice && !isHealthWithNewStructure && !isGroomingWithNewStructure && !isHouseWithNewStructure) {
      const mrp = product.price || product.mrp;
      const disc = product.discountedPrice || product.discountPrice || mrp;
      if (!mrp) return null;
      return { mrp, discountedPrice: disc };
    }
    // Old structure with prices/sizes array
    if (priceOptions.length === 0) return null;
    return priceOptions.reduce(
      (min, p) => (p.discountedPrice < min.discountedPrice ? p : min),
      priceOptions[0]
    );
  }, [priceOptions, hasFlatPrice, isFoodWithNewStructure, isAccessoryWithNewStructure, isToyWithNewStructure, isHealthWithNewStructure, isGroomingWithNewStructure, isHouseWithNewStructure, product.mrp, product.discountPrice, product.price, product.discountedPrice]);

  const discountPercent = startingPrice
    ? Math.round(((startingPrice.mrp - startingPrice.discountedPrice) / startingPrice.mrp) * 100)
    : 0;

  // Determine Mongoose model name for cart
  const productModelType = useMemo(() => {
    if (isToyProduct) return 'Toy';
    if (isHouseProduct) return 'House';
    if (isHealthSupplement) return 'HealthSupplement';
    if (isAccessory) return 'Accessory';
    if (isGrooming) return 'GroomingEssential';
    // Distinguish Food vs Clothes: Clothes have sizes array, Food has prices array
    if (product.sizes && !product.prices) return 'Clothes';
    return 'Food';
  }, [isToyProduct, isHouseProduct, isHealthSupplement, isAccessory, isGrooming, product]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const token = getApiBearerToken();
    if (!token) {
      // Use guest cart
      try {
        setAddingToCart(true);
        const { addToGuestCart } = await import('../utils/guestCart');
        addToGuestCart({
          productId: product._id,
          quantity: 1,
          selectedSize: 0,
          productType: productModelType,
        });
      } catch (err) { console.error(err); }
      finally { setAddingToCart(false); }
      return;
    }
    try {
      setAddingToCart(true);
      await axios.post(`${API_BASE}/cart`, { productId: product._id, quantity: 1, selectedSize: 0, productType: productModelType }, { headers: { Authorization: `Bearer ${token}` } });
      window.dispatchEvent(new Event('cart-wishlist-update'));
    } catch (err) { console.error(err); }
    finally { setAddingToCart(false); }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    const token = getApiBearerToken();
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

  // Build product detail URL with type parameter (derive from product when apiEndpoint is null, e.g. mixed food+clothes)
  const derivedEndpoint = !apiEndpoint && product.sizes?.length && !product.prices?.length ? '/clothes' : !apiEndpoint && (product.prices?.length || !product.sizes?.length) ? '/food' : apiEndpoint;
  const productUrl = derivedEndpoint ? `/product/${product._id}?type=${derivedEndpoint}` : `/product/${product._id}`;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-0">
      <div className="relative overflow-hidden bg-gray-50">
        <Link to={productUrl}>
          <div className="aspect-square flex items-center justify-center p-2 sm:p-4">
            {displayImage ? (
              <img src={displayImage} alt={displayName} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
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
            {['Dog', 'dog'].includes(product.category) || ['Dog', 'dog'].includes(product.subCategory) ? (
              <img src={DOG_ICON} alt="Dog" className="w-4 h-4 object-contain inline" />
            ) : ['Cat', 'cat'].includes(product.category) || ['Cat', 'cat'].includes(product.subCategory) ? (
              <img src={CAT_ICON} alt="Cat" className="w-4 h-4 object-contain inline" />
            ) : (
              <span>🧸</span>
            )}{' '}
            {(isToyProduct || isHealthSupplement || isHouseProduct || isAccessory || isGrooming)
              ? (product.subCategory?.charAt(0).toUpperCase() + product.subCategory?.slice(1))
              : product.category}
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
      <div className="p-3 sm:p-4">
        {product.brand && (
          <p className="text-xs font-semibold text-[#205EA9] uppercase tracking-wide mb-1">{product.brand}</p>
        )}
        <Link to={productUrl}>
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight mb-2 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hover:text-[#205EA9] transition-colors">{displayName}</h3>
        </Link>
        <span className="inline-block bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full mb-2 sm:mb-3">{product.subCategory}</span>
        {/* Show capacity for food or size for accessories */}
        {(isFoodWithNewStructure && product.capacity) && (
          <p className="text-xs text-gray-500 mb-1">Capacity: {product.capacity}</p>
        )}
        {(isAccessoryWithNewStructure && product.size) && (
          <p className="text-xs text-gray-500 mb-1">Size: {product.size}</p>
        )}
        {startingPrice && (
          <div className="flex items-end gap-2 mb-3">
            <span className="text-base sm:text-xl font-bold text-gray-900">₹{startingPrice.discountedPrice}</span>
            {startingPrice.mrp > startingPrice.discountedPrice && (
              <span className="text-sm text-gray-400 line-through">₹{startingPrice.mrp}</span>
            )}
            {!isFoodWithNewStructure && !isAccessoryWithNewStructure && priceOptions.length > 1 && (
              <span className="text-xs text-gray-500 ml-auto">{priceOptions.length} sizes</span>
            )}
          </div>
        )}
        <div className="mt-2 flex justify-center">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="w-full max-w-[240px] bg-[#205EA9] text-white font-semibold py-3.5 rounded-xl hover:bg-[#205EA9] active:scale-[0.98] transition-all duration-200 text-base disabled:opacity-50"
            title="Add to Cart"
          >
            {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              {category.image && (
                <img src={category.image} alt={category.name} className="w-16 h-16 object-contain" />
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
            </div>
            {/* Sort */}
            <div className="flex items-center gap-3">
              <label className="text-gray-500 text-sm font-medium whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2f5a87] cursor-pointer min-w-[170px]"
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
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              {subCategoryTabs.map((sub) => {
                // Icon mapping for subcategories
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
                  <button
                    key={sub}
                    onClick={() => handleSubCategoryChange(sub)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      activeSubCategory === sub
                        ? `${accent.tab} text-white shadow-md`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getSubIcon(sub) && <span className="mr-1.5">{getSubIcon(sub)}</span>}
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          {productsLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin mb-4"></div>
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
              <Link to="/" className="bg-[#205EA9] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1d4f8f] transition-colors inline-block">
                Back to Home
              </Link>
            </div>
          )}

          {!productsLoading && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
        <div className="container mx-auto px-4 sm:px-6 text-center">
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
