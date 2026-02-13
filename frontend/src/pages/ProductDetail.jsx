import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const DOG_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg';
const CAT_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg';

// All product API endpoints to search across
const PRODUCT_ENDPOINTS = [
  '/food',
  '/clothes',
  '/toys',
  '/accessories',
  '/grooming-essentials',
  '/health-supplements',
  '/houses',
];

// Map API endpoint → Mongoose model name for cart
const ENDPOINT_TO_MODEL = {
  '/food': 'Food',
  '/clothes': 'Clothes',
  '/toys': 'Toy',
  '/accessories': 'Accessory',
  '/grooming-essentials': 'GroomingEssential',
  '/health-supplements': 'HealthSupplement',
  '/houses': 'House',
};

// Map product category → category page slug for breadcrumbs
const categoryToSlug = {
  'Dog': 'dogs',
  'Cat': 'cats',
  'Toy': 'toys',
  'accessories': 'accessories',
  'grooming-essentials': 'grooming-and-essential',
  'health-supplement': 'health-and-supplement',
  'house': 'beds-and-house',
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [productType, setProductType] = useState(null); // tracks which API the product came from
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const token = localStorage.getItem('token');

  // Check if product is in wishlist
  useEffect(() => {
    if (!token || !id) return;
    const checkWishlist = async () => {
      try {
        const res = await axios.get(`${API_BASE}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const items = res.data.data.items || [];
          setIsInWishlist(items.some((item) => (item._id || item) === id));
        }
      } catch (err) {
        // silently fail
      }
    };
    checkWishlist();
  }, [token, id]);

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/signin');
      return;
    }
    try {
      setAddingToCart(true);
      const modelType = productType ? (ENDPOINT_TO_MODEL[productType] || undefined) : undefined;
      await axios.post(
        `${API_BASE}/cart`,
        { productId: id, quantity: 1, selectedSize, productType: modelType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartMessage('Added to cart!');
      window.dispatchEvent(new Event('cart-wishlist-update'));
      setTimeout(() => setCartMessage(''), 2500);
    } catch (err) {
      console.error('Add to cart error:', err);
      setCartMessage('Failed to add');
      setTimeout(() => setCartMessage(''), 2500);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      navigate('/signin');
      return;
    }
    try {
      setBuyingNow(true);
      const modelType = productType ? (ENDPOINT_TO_MODEL[productType] || undefined) : undefined;
      
      // Clear cart first to ensure only current product is in checkout
      try {
        const cartRes = await axios.get(`${API_BASE}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cartRes.data.success && cartRes.data.data.items?.length > 0) {
          // Delete all items from cart
          await Promise.all(
            cartRes.data.data.items.map(item => 
              axios.delete(`${API_BASE}/cart/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            )
          );
        }
      } catch (err) {
        console.error('Clear cart error:', err);
      }
      
      // Add current product to cart
      await axios.post(
        `${API_BASE}/cart`,
        { productId: id, quantity: 1, selectedSize, productType: modelType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event('cart-wishlist-update'));
      navigate('/checkout');
    } catch (err) {
      console.error('Buy now error:', err);
      setCartMessage('Failed to add');
      setTimeout(() => setCartMessage(''), 2500);
    } finally {
      setBuyingNow(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      navigate('/signin');
      return;
    }
    try {
      setTogglingWishlist(true);
      const res = await axios.post(
        `${API_BASE}/wishlist`,
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsInWishlist(res.data.action === 'added');
        window.dispatchEvent(new Event('cart-wishlist-update'));
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err);
    } finally {
      setTogglingWishlist(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch product — use type from URL when provided, else try endpoints sequentially
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get('type');
        // Normalize: "food" or "/food" → "food" for API path
        const pathSegment = typeParam ? (typeParam.startsWith('/') ? typeParam.slice(1) : typeParam) : null;

        // When type is provided, try only that endpoint (single request, no 404s for other categories)
        if (pathSegment) {
          const ep = pathSegment.startsWith('/') ? pathSegment : `/${pathSegment}`;
          const res = await axios.get(`${API_BASE}${ep}/${id}`, { validateStatus: () => true });
          if (res.status === 200 && res.data?.success) {
            setProduct(res.data.data);
            setProductType(ep);
            setLoading(false);
            return;
          }
        }

        // Fallback: try each endpoint sequentially, stop on first success (avoids 6+ parallel 404s)
        for (const ep of PRODUCT_ENDPOINTS) {
          const res = await axios.get(`${API_BASE}${ep}/${id}`, { validateStatus: () => true });
          if (res.status === 200 && res.data?.success) {
            setProduct(res.data.data);
            setProductType(ep);
            setLoading(false);
            return;
          }
        }

        setError('Product not found');
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ─── Normalised fields across all product types ───────────────────────────
  const displayName = product?.productName || product?.name || 'Unnamed Product';
  const images = product?.images || (product?.image ? [product.image] : []);
  const brand = product?.brand || null;
  const category = product?.category || '';
  const subCategory = product?.subCategory || '';

  // Price options: food=prices, clothes/accessories=sizes, grooming=variants, toys/health/house=flat
  const priceOptions = product?.prices || product?.sizes || product?.variants || [];
  const isFlatPrice = ['Toy', 'health-supplement', 'house'].includes(category);

  const currentPrice = useMemo(() => {
    if (!product) return null;
    if (isFlatPrice) {
      const mrp = product.price;
      const disc = product.discountedPrice || product.discountPrice || mrp;
      if (!mrp) return null;
      return { mrp, discountedPrice: disc, label: '' };
    }
    if (priceOptions.length === 0) return null;
    const p = priceOptions[selectedSize];
    return {
      mrp: p.mrp,
      discountedPrice: p.discountedPrice,
      label: p.capacity || p.size || p.volume || '',
    };
  }, [product, selectedSize, priceOptions, isFlatPrice]);

  const discountPercent = useMemo(() => {
    if (!currentPrice) return 0;
    if (product?.discountPercentage) return Math.round(product.discountPercentage);
    return Math.round(((currentPrice.mrp - currentPrice.discountedPrice) / currentPrice.mrp) * 100);
  }, [currentPrice, product]);

  // Compute available stock — flat-price products store it at root, multi-option products per option
  const availableStock = useMemo(() => {
    if (!product) return null;
    // Flat-price products (Toys, Health Supplements, Houses)
    if (isFlatPrice) return product.availableStock ?? null;
    // Multi-option products (Food/Clothes/Accessories/Grooming)
    if (priceOptions.length > 0 && priceOptions[selectedSize]?.availableStock !== undefined) {
      return priceOptions[selectedSize].availableStock;
    }
    // Fallback to root-level stock
    if (product.availableStock !== undefined) return product.availableStock;
    return null;
  }, [product, isFlatPrice, priceOptions, selectedSize]);

  // Average rating (only food has reviews)
  const avgRating = useMemo(() => {
    if (!product?.reviews?.length) return 0;
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / product.reviews.length).toFixed(1);
  }, [product]);

  // Build breadcrumb links
  const breadcrumb = useMemo(() => {
    if (!product) return { categoryLink: '/', categoryLabel: '', subCategoryLink: null, subCategoryLabel: '' };

    let slug = categoryToSlug[category] || '';
    let catLabel = category;

    // For products where category is "Toy"/"accessories"/"grooming-essentials"/"health-supplement"/"house"
    // the category page slug maps directly
    if (['Toy', 'accessories', 'grooming-essentials', 'health-supplement', 'house'].includes(category)) {
      catLabel = {
        'Toy': 'Toys',
        'accessories': 'Accessories',
        'grooming-essentials': 'Grooming & Essential',
        'health-supplement': 'Health & Supplement',
        'house': 'Beds & House',
      }[category];
    } else {
      // Dog/Cat food & clothes
      catLabel = category + 's';
    }

    const categoryLink = slug ? `/category/${slug}` : '/';
    const subCategoryLink = slug ? `/category/${slug}?subCategory=${encodeURIComponent(subCategory)}` : null;
    const subCategoryLabel = subCategory ? (subCategory.charAt(0).toUpperCase() + subCategory.slice(1)) : '';

    return { categoryLink, categoryLabel: catLabel, subCategoryLink, subCategoryLabel };
  }, [product, category, subCategory]);

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl mb-4">😿</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'This product does not exist.'}</p>
          <Link
            to="/"
            className="inline-block bg-[#65a30d] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Determine pet icon
  const petSub = subCategory.toLowerCase();
  const showDogIcon = category === 'Dog' || petSub === 'dog';
  const showCatIcon = category === 'Cat' || petSub === 'cat';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <nav className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <Link to="/" className="hover:text-[#65a30d] transition-colors">Home</Link>
            <span>/</span>
            <Link to={breadcrumb.categoryLink} className="hover:text-[#65a30d] transition-colors">
              {breadcrumb.categoryLabel}
            </Link>
            {breadcrumb.subCategoryLink && (
              <>
                <span>/</span>
                <Link to={breadcrumb.subCategoryLink} className="hover:text-[#65a30d] transition-colors">
                  {breadcrumb.subCategoryLabel}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-800 font-medium truncate max-w-[140px] sm:max-w-[200px]">{displayName}</span>
          </nav>
        </div>
      </div>

      {/* Two-Column Layout: Sticky Image Left + Scrollable Details Right */}
      <section className="py-4 sm:py-6 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-6">

            {/* LEFT — Sticky Image Gallery */}
            <div className="w-full md:w-[45%] lg:w-[40%] flex-shrink-0">
              <div className="md:sticky md:top-24">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  {/* Main Image */}
                  <div className="relative aspect-square flex items-center justify-center mb-3 sm:mb-4 bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-8">
                    {images[selectedImage] ? (
                      <img
                        src={images[selectedImage]}
                        alt={displayName}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-8xl text-gray-300">🐾</span>
                    )}
                    {/* Wishlist icon on image */}
                    <button
                      onClick={handleToggleWishlist}
                      disabled={togglingWishlist}
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center z-10 hover:scale-110 transition-all disabled:opacity-60 ${
                        isInWishlist ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                      }`}
                      title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      {isInWishlist ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                            selectedImage === i
                              ? 'border-[#65a30d] shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-contain p-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — Scrollable Product Details */}
            <div className="w-full md:w-[55%] lg:w-[60%] space-y-4 sm:space-y-6 min-w-0">

              {/* Basic Info Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="bg-[#65a30d]/10 text-[#65a30d] text-xs font-bold px-3 py-1 rounded-full">
                    {showDogIcon ? (
                      <img src={DOG_ICON} alt="Dog" className="w-4 h-4 object-contain inline" />
                    ) : showCatIcon ? (
                      <img src={CAT_ICON} alt="Cat" className="w-4 h-4 object-contain inline" />
                    ) : (
                      <span>🐾</span>
                    )}{' '}
                    {showDogIcon ? 'Dog' : showCatIcon ? 'Cat' : category}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                    {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
                  </span>
                  {discountPercent > 0 && (
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Brand */}
                {brand && (
                  <p className="text-sm font-semibold text-[#65a30d] uppercase tracking-wide mb-1">
                    {brand}
                  </p>
                )}

                {/* Name */}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {displayName}
                </h1>

                {/* Rating */}
                {product.reviews?.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-lg ${star <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {avgRating} ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                {/* Price */}
                {currentPrice && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5">
                    <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                        ₹{currentPrice.discountedPrice}
                      </span>
                      {currentPrice.mrp > currentPrice.discountedPrice && (
                        <span className="text-lg text-gray-400 line-through pb-0.5">
                          ₹{currentPrice.mrp}
                        </span>
                      )}
                    </div>
                    {currentPrice.label && (
                      <p className="text-xs text-gray-500 mt-1">
                        MRP (incl. of all taxes) for {currentPrice.label}
                      </p>
                    )}
                  </div>
                )}

                {/* Size / Variant Options (for products with multiple options) */}
                {!isFlatPrice && priceOptions.length > 1 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Select Option:</p>
                    <div className="flex flex-wrap gap-3">
                      {priceOptions.map((p, i) => {
                        const optLabel = p.capacity || p.size || p.volume || `Option ${i + 1}`;
                        const optStock = p.availableStock;
                        const outOfStock = optStock !== undefined && optStock <= 0;
                        return (
                          <button
                            key={i}
                            onClick={() => !outOfStock && setSelectedSize(i)}
                            disabled={outOfStock}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                              outOfStock
                                ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                : selectedSize === i
                                  ? 'border-[#65a30d] bg-[#65a30d]/5 text-[#65a30d]'
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <span>{optLabel}</span>
                            <span className="mx-1">—</span>
                            <span className="font-bold">₹{p.discountedPrice}</span>
                            {optStock !== undefined && (
                              <span className={`block text-[10px] mt-0.5 ${
                                outOfStock ? 'text-red-400' : optStock <= 5 ? 'text-orange-500' : 'text-gray-400'
                              }`}>
                                {outOfStock ? 'Out of stock' : `${optStock} in stock`}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Flavours (Food) */}
                {product.flavours?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Flavours:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.flavours.map((f, i) => (
                        <span key={i} className="bg-amber-50 text-amber-700 text-sm font-medium px-3 py-1.5 rounded-full border border-amber-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors (Clothes / Accessories / Toys) */}
                {product.color?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Colors:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.color.map((c, i) => (
                        <span key={i} className="bg-purple-50 text-purple-700 text-sm font-medium px-3 py-1.5 rounded-full border border-purple-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-5">
                  {/* Material */}
                  {product.material && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Material: </span>
                      <span className="text-gray-600">{product.material}</span>
                    </div>
                  )}

                  {/* Suitable For */}
                  {product.suitableFor && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Suitable For: </span>
                      <span className="text-gray-600">{product.suitableFor}</span>
                    </div>
                  )}

                  {/* Size (Toys — single size like "One Size") */}
                  {typeof product.size === 'string' && product.size && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Size: </span>
                      <span className="text-gray-600">{product.size}</span>
                    </div>
                  )}

                  {/* Expiry Date */}
                  {product.expiryDate && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Best Before: </span>
                      <span className="text-gray-600">
                        {new Date(product.expiryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Expected Delivery */}
                  {product.expectedDeliveryDays && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Delivery: </span>
                      <span className="text-gray-600">{product.expectedDeliveryDays} days</span>
                    </div>
                  )}

                  {/* Returnable */}
                  {product.isReturnable !== undefined && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Returnable: </span>
                      <span className={product.isReturnable ? 'text-green-600' : 'text-red-500'}>
                        {product.isReturnable ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Info */}
                {availableStock !== null && (
                  <div className={`flex items-center gap-2 mb-5 text-sm font-semibold ${
                    availableStock <= 0
                      ? 'text-red-600'
                      : availableStock <= 10
                        ? 'text-orange-600'
                        : 'text-green-600'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      availableStock <= 0
                        ? 'bg-red-500'
                        : availableStock <= 10
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                    }`} />
                    {availableStock <= 0
                      ? 'Out of Stock'
                      : availableStock <= 10
                        ? `Only ${availableStock} left in stock!`
                        : `In Stock (${availableStock} available)`
                    }
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || availableStock === 0}
                    className={`flex-1 font-bold py-3 sm:py-3.5 rounded-xl active:scale-[0.98] transition-all text-sm disabled:opacity-60 min-w-0 ${
                      availableStock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white hover:from-[#4d7c0f] hover:to-[#3f6212]'
                    }`}
                  >
                    {availableStock === 0
                      ? 'Out of Stock'
                      : addingToCart
                        ? 'Adding...'
                        : cartMessage || '🛒 Add to Cart'
                    }
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={buyingNow || availableStock === 0}
                    className={`flex-1 font-bold py-3 sm:py-3.5 rounded-xl active:scale-[0.98] transition-all text-sm disabled:opacity-60 min-w-0 ${
                      availableStock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white hover:from-[#d97706] hover:to-[#b45309]'
                    }`}
                  >
                    {buyingNow ? 'Processing...' : '⚡ Buy Now'}
                  </button>
                </div>
              </div>

              {/* Key Features */}
              {product.keyFeatures?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#65a30d]/10 rounded-lg flex items-center justify-center text-sm">✨</span>
                    Key Features
                  </h3>
                  <ul className="space-y-2.5">
                    {product.keyFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                        <span className="text-[#65a30d] mt-0.5 text-xs">●</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Health Benefits (Food) */}
              {product.healthBenefits?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm">💚</span>
                    Health Benefits
                  </h3>
                  <ul className="space-y-2.5">
                    {product.healthBenefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                        <span className="text-green-500 mt-0.5 text-xs">●</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description (string — Health Supplements / Houses / Grooming) */}
              {product.description && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📝</span>
                    Description
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Product Details (array — Food / Clothes / Accessories / Toys) */}
              {(product.details?.length > 0 || product.productDetails?.length > 0) && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📋</span>
                    Product Details
                  </h3>
                  <ul className="space-y-2.5">
                    {(product.details || product.productDetails).map((d, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                        <span className="text-blue-500 mt-0.5 text-xs">●</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Highlights (Health Supplements / Houses) */}
              {product.highlights?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-sm">⭐</span>
                    Highlights
                  </h3>
                  <ul className="space-y-2.5">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                        <span className="text-yellow-500 mt-0.5 text-xs">●</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutrients (Food) */}
              {product.nutrients?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-sm">🧪</span>
                    Nutritional Info
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.nutrients.map((n, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-gray-800">{n}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage / Dosage (Health Supplements) */}
              {product.usage && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-sm">💊</span>
                    Usage
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Dosage:</span> {product.usage.dosage}</p>
                    <p><span className="font-semibold">Age Group:</span> {product.usage.ageGroup}</p>
                  </div>
                </div>
              )}

              {/* Usage Instructions (Grooming) */}
              {product.usageInstructions?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-sm">📝</span>
                    Usage Instructions
                  </h3>
                  <ol className="space-y-2.5">
                    {product.usageInstructions.map((u, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                        <span className="text-cyan-600 font-bold text-xs mt-0.5">{i + 1}.</span>
                        {u}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Care Instructions (Clothes) */}
              {product.careInstructions?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-sm">🧼</span>
                    Care Instructions
                  </h3>
                  <ul className="space-y-2.5">
                    {product.careInstructions.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                        <span className="text-pink-500 mt-0.5 text-xs">●</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dimensions (Houses) */}
              {product.dimensions && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">📐</span>
                    Dimensions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className="text-xs text-gray-500">Height</p>
                      <p className="text-sm font-semibold text-gray-800">{product.dimensions.height}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className="text-xs text-gray-500">Width</p>
                      <p className="text-sm font-semibold text-gray-800">{product.dimensions.width}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className="text-xs text-gray-500">Depth</p>
                      <p className="text-sm font-semibold text-gray-800">{product.dimensions.depth}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-sm font-semibold text-gray-800">{product.dimensions.weight}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
