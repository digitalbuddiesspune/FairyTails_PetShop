import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { addToGuestWishlist, removeFromGuestWishlist, isInGuestWishlist } from '../utils/guestCart';
import { clearUserSession, getApiBearerToken } from '../auth/session';
import { formatRupee } from '../utils/formatPrice';
import { getProductVariants } from '../utils/productVariants';
import { useCartQuantity } from '../hooks/useCartQuantity';
import CartQuantityControl from '../components/CartQuantityControl';
import LoginRequiredModal from '../components/LoginRequiredModal';
import ProductCard from '../components/ProductCard';
import { type } from '../styles/typography';

const API_BASE = import.meta.env.VITE_BACKEND_API;

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

const SIMILAR_PRODUCT_LIMIT = 10;

const buildSimilarQueryParams = (product, endpoint) => {
  const params = { limit: 20, page: 1 };
  if (!product) return params;

  if (endpoint === '/food' || endpoint === '/clothes') {
    if (product.category) params.category = product.category;
    if (product.subCategory) params.subCategory = product.subCategory;
  } else if (endpoint === '/toys') {
    const sub = product.subCategory || product.category;
    if (sub) params.subCategory = sub;
  } else if (endpoint === '/accessories') {
    if (product.subCategory) params.subCategory = product.subCategory;
    if (product.productType) params.productType = product.productType;
  } else if (
    endpoint === '/grooming-essentials' ||
    endpoint === '/health-supplements' ||
    endpoint === '/houses'
  ) {
    if (product.subCategory) params.subCategory = product.subCategory;
  }

  return params;
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
  const [buyingNow, setBuyingNow] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authEpoch, setAuthEpoch] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [sharing, setSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  useEffect(() => {
    const onAuth = () => setAuthEpoch((e) => e + 1);
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  // Check if product is in wishlist (both guest and logged in)
  useEffect(() => {
    if (!id) return;
    const t = getApiBearerToken();
    if (t) {
      const checkWishlist = async () => {
        try {
          const res = await axios.get(`${API_BASE}/wishlist`, {
            headers: { Authorization: `Bearer ${t}` },
          });
          if (res.data.success) {
            const items = res.data.data.items || [];
            setIsInWishlist(items.some((item) => String(item._id || item) === id));
          }
        } catch (err) {
          // silently fail
        }
      };
      checkWishlist();
    } else {
      setIsInWishlist(isInGuestWishlist(id));
    }
  }, [id, authEpoch]);

  const handleBuyNow = async () => {
    const t = getApiBearerToken();
    if (!t) {
      setShowLoginModal(true);
      return;
    }
    try {
      setBuyingNow(true);
      const modelType = productType ? (ENDPOINT_TO_MODEL[productType] || undefined) : undefined;
      
      // Clear cart first to ensure only current product is in checkout
      try {
        const cartRes = await axios.get(`${API_BASE}/cart`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        if (cartRes.data.success && cartRes.data.data.items?.length > 0) {
          // Delete all items from cart
          await Promise.all(
            cartRes.data.data.items.map(item => 
              axios.delete(`${API_BASE}/cart/${item._id}`, {
                headers: { Authorization: `Bearer ${t}` }
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
        { headers: { Authorization: `Bearer ${t}` } }
      );
      window.dispatchEvent(new Event('cart-wishlist-update'));
      navigate('/checkout');
    } catch (err) {
      if (err.response?.status === 401) {
        clearUserSession();
        navigate('/signin');
        return;
      }
      console.error('Buy now error:', err);
      setCartMessage(err.response?.data?.message || 'Failed to add');
      setTimeout(() => setCartMessage(''), 2500);
    } finally {
      setBuyingNow(false);
    }
  };

  const handleToggleWishlist = async () => {
    const t = getApiBearerToken();
    if (!t) {
      // Use guest wishlist with full product data
      try {
        setTogglingWishlist(true);
        if (isInGuestWishlist(id)) {
          removeFromGuestWishlist(id);
          setIsInWishlist(false);
        } else if (product) {
          addToGuestWishlist(product);
          setIsInWishlist(true);
        }
      } catch (err) {
        console.error('Toggle guest wishlist error:', err);
      } finally {
        setTogglingWishlist(false);
      }
      return;
    }
    try {
      setTogglingWishlist(true);
      const res = await axios.post(
        `${API_BASE}/wishlist`,
        { productId: id },
        { headers: { Authorization: `Bearer ${t}` } }
      );
      if (res.data.success) {
        setIsInWishlist(res.data.action === 'added');
        window.dispatchEvent(new Event('cart-wishlist-update'));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        clearUserSession();
        navigate('/signin');
        return;
      }
      console.error('Toggle wishlist error:', err);
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleShareProduct = async () => {
    if (!product) return;
    const name = product.productName || product.name || 'Product';
    const url = window.location.href;

    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `Check out ${name} on FairyTails Pet Shop`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareFeedback('Link copied!');
        setTimeout(() => setShareFeedback(''), 2000);
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setShareFeedback('Link copied!');
        setTimeout(() => setShareFeedback(''), 2000);
      } catch {
        setShareFeedback('Unable to share');
        setTimeout(() => setShareFeedback(''), 2000);
      }
    } finally {
      setSharing(false);
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

  useEffect(() => {
    if (!product || !productType || !id) {
      setSimilarProducts([]);
      return;
    }

    const pickSimilar = (items) =>
      items
        .filter((p) => String(p._id) !== String(id))
        .slice(0, SIMILAR_PRODUCT_LIMIT);

    const fetchSimilar = async () => {
      setSimilarLoading(true);
      try {
        const params = buildSimilarQueryParams(product, productType);
        let res = await axios.get(`${API_BASE}${productType}`, { params });
        let similar = pickSimilar(res.data?.data || []);

        if (similar.length < 4 && (params.category || params.subCategory || params.productType)) {
          const broader = { limit: 20, page: 1 };
          if (product.category && (productType === '/food' || productType === '/clothes')) {
            broader.category = product.category;
          } else if (product.subCategory) {
            broader.subCategory = product.subCategory;
          }
          res = await axios.get(`${API_BASE}${productType}`, { params: broader });
          similar = pickSimilar(res.data?.data || []);
        }

        if (similar.length < 4) {
          res = await axios.get(`${API_BASE}${productType}`, { params: { limit: 20, page: 1 } });
          similar = pickSimilar(res.data?.data || []);
        }

        setSimilarProducts(similar);
      } catch (err) {
        console.error('Fetch similar products error:', err);
        setSimilarProducts([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    fetchSimilar();
  }, [product, productType, id]);

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
          setWishlistIds((res.data.data.items || []).map((i) => i._id || i));
        }
      } catch {
        /* silent */
      }
    };
    fetchWishlist();
  }, [authEpoch]);

  const handleSimilarWishlistToggle = async (productId) => {
    const token = getApiBearerToken();
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_BASE}/wishlist`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setWishlistIds((res.data.data.items || []).map((i) => i._id || i));
        window.dispatchEvent(new Event('cart-wishlist-update'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setSelectedSize(0);
    setSelectedImage(0);
  }, [id, product?._id]);

  // ─── Normalised fields across all product types ───────────────────────────
  const displayName = product?.productName || product?.name || 'Unnamed Product';
  const images = product?.images || (product?.image ? [product.image] : []);
  const brand = product?.brand || null;
  const category = product?.category || '';
  const subCategory = product?.subCategory || '';

  // Price variants: food=prices[], clothes=sizes[], grooming=variants[], or flat single SKU
  const variants = useMemo(() => getProductVariants(product), [product]);
  const multiVariants = variants.length > 1;
  const variantKind = variants[0]?.kind;
  const isFlatPrice = ['Toy', 'health-supplement', 'house'].includes(category);

  const currentPrice = useMemo(() => {
    if (!variants.length) return null;
    const row = variants[selectedSize] ?? variants[0];
    return {
      mrp: row.mrp,
      discountedPrice: row.discountedPrice,
      label: row.label,
    };
  }, [variants, selectedSize]);

  const discountPercent = useMemo(() => {
    if (!currentPrice) return 0;
    if (product?.discountPercentage) return Math.round(product.discountPercentage);
    if (!currentPrice.mrp) return 0;
    return Math.round(((currentPrice.mrp - currentPrice.discountedPrice) / currentPrice.mrp) * 100);
  }, [currentPrice, product]);

  const availableStock = useMemo(() => {
    if (!variants.length) return product?.availableStock ?? null;
    const row = variants[selectedSize] ?? variants[0];
    if (row.availableStock !== undefined) return row.availableStock;
    return product?.availableStock ?? null;
  }, [variants, selectedSize, product]);

  const cartModelType = productType ? (ENDPOINT_TO_MODEL[productType] || 'Food') : 'Food';
  const {
    quantity: cartQuantity,
    updating: cartUpdating,
    addOne: addToCartFromDetail,
    increment: incrementCartQty,
    decrement: decrementCartQty,
  } = useCartQuantity(id, selectedSize, cartModelType);

  // Average rating (only food has reviews)
  const avgRating = useMemo(() => {
    if (!product?.reviews?.length) return 0;
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / product.reviews.length).toFixed(1);
  }, [product]);

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-gray-500 ${type.body}`}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl mb-4">😿</p>
          <h2 className={`${type.h3} text-gray-800 mb-2`}>Product Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'This product does not exist.'}</p>
          <Link
            to="/"
            className="inline-block bg-[#205EA9] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1d4f8f] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Two-Column Layout: Image + Product Info */}
      <section className="py-3 sm:py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-0 sm:px-4 md:px-6">
          <div className="bg-white sm:rounded-xl md:rounded-2xl shadow-sm border-y sm:border border-gray-100 overflow-hidden flex flex-col md:flex-row">

            {/* Image — no padding */}
            <div className="w-full md:w-[45%] lg:w-[40%] flex-shrink-0 bg-gray-50 md:sticky md:top-24 md:self-start p-0">
              <div className="relative aspect-square flex items-center justify-center overflow-hidden">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={displayName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-8xl text-gray-300">🐾</span>
                )}
                <button
                  type="button"
                  onClick={handleShareProduct}
                  disabled={sharing}
                  className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center z-10 text-gray-600 hover:text-[#205EA9] hover:scale-110 transition-all disabled:opacity-60"
                  title="Share product"
                  aria-label="Share product"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                {shareFeedback && (
                  <span className={`absolute top-14 left-3 z-10 bg-gray-900 text-white ${type.caption} px-2 py-1 rounded-md shadow-lg whitespace-nowrap`}>
                    {shareFeedback}
                  </span>
                )}
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

              {images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 justify-center flex-wrap border-t border-gray-100 p-0">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                        selectedImage === i
                          ? 'border-[#205EA9] shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info — padded text section */}
            <div className="w-full md:flex-1 min-w-0 flex flex-col p-4 sm:p-5 md:p-6 lg:p-8">
                {/* Badges */}
                {subCategory && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`bg-gray-100 text-gray-600 ${type.captionMedium} px-3 py-1 rounded-full`}>
                    {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
                  </span>
                </div>
                )}

                {/* Brand */}
                {brand && (
                  <p className={`${type.label} text-[#205EA9] uppercase tracking-wide mb-1`}>
                    {brand}
                  </p>
                )}

                {/* Name */}
                <h1 className={`${type.h3} text-gray-900 mb-2 sm:mb-3`}>
                  {displayName}
                </h1>

                {/* Rating */}
                {product.reviews?.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-base ${star <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className={`${type.bodySm} text-gray-600 font-medium`}>
                      {avgRating} ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                {/* Price */}
                {currentPrice && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5">
                    <div className="flex items-end gap-2 sm:gap-3 flex-wrap mb-2">
                      <span className={`${type.price} text-gray-900`}>
                        {formatRupee(currentPrice.discountedPrice)}
                      </span>
                      {currentPrice.mrp > currentPrice.discountedPrice && (
                        <>
                          <span className={`${type.body} text-gray-400 line-through pb-0.5`}>
                            {formatRupee(currentPrice.mrp)}
                          </span>
                          {discountPercent > 0 && (
                            <span className={`${type.label} text-red-600 bg-red-50 px-2 py-1 rounded`}>
                              {discountPercent}% off
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Capacity / size / variant options */}
                {multiVariants && (
                  <div className="mb-5">
                    <p className={`${type.label} text-gray-700 mb-2`}>
                      {variantKind === 'capacity'
                        ? 'Select Capacity:'
                        : variantKind === 'size'
                          ? 'Select Size:'
                          : 'Select Option:'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {variants.map((row, i) => {
                        const optLabel = row.label || `Option ${i + 1}`;
                        const optStock = row.availableStock;
                        const outOfStock = optStock !== undefined && optStock <= 0;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => !outOfStock && setSelectedSize(i)}
                            disabled={outOfStock}
                            className={`px-4 py-2.5 rounded-xl ${type.button} border-2 transition-all ${
                              outOfStock
                                ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                : selectedSize === i
                                  ? 'border-[#205EA9] bg-[#205EA9]/5 text-[#205EA9]'
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <span>{optLabel}</span>
                            <span className="mx-1">—</span>
                            <span className="font-bold">{formatRupee(row.discountedPrice)}</span>
                            {optStock !== undefined && (
                              <span className={`block ${type.caption} mt-0.5 ${
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

                {/* Single variant label (when only one capacity/size) */}
                {!multiVariants && variants[0]?.label && (
                  <div className="mb-5">
                    <p className={`${type.label} text-gray-700 mb-2`}>
                      {variantKind === 'capacity' ? 'Capacity:' : variantKind === 'size' ? 'Size:' : 'Option:'}
                    </p>
                    <span className={`inline-block bg-amber-50 text-amber-700 ${type.bodySm} font-medium px-3 py-1.5 rounded-full border border-amber-200`}>
                      {variants[0].label}
                    </span>
                  </div>
                )}

                {/* Flavours (Food) */}
                {product.flavours?.length > 0 && (
                  <div className="mb-5">
                    <p className={`${type.label} text-gray-700 mb-2`}>Flavours:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.flavours.map((f, i) => (
                        <span key={i} className={`bg-amber-50 text-amber-700 ${type.bodySm} font-medium px-3 py-1.5 rounded-full border border-amber-200`}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors (Clothes / Accessories / Toys) */}
                {product.color?.length > 0 && (
                  <div className="mb-5">
                    <p className={`${type.label} text-gray-700 mb-2`}>Colors:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.color.map((c, i) => (
                        <span key={i} className={`bg-purple-50 text-purple-700 ${type.bodySm} font-medium px-3 py-1.5 rounded-full border border-purple-200`}>
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
                    <div className={type.bodySm}>
                      <span className="font-semibold text-gray-700">Material: </span>
                      <span className="text-gray-600">{product.material}</span>
                    </div>
                  )}

                  {/* Suitable For */}
                  {product.suitableFor && (
                    <div className={type.bodySm}>
                      <span className="font-semibold text-gray-700">Suitable For: </span>
                      <span className="text-gray-600">{product.suitableFor}</span>
                    </div>
                  )}

                  {/* Size (Toys — single size) */}
                  {typeof product.size === 'string' && product.size && !variants[0]?.label && (
                    <div className={type.bodySm}>
                      <span className="font-semibold text-gray-700">Size: </span>
                      <span className="text-gray-600">{product.size}</span>
                    </div>
                  )}

                  {/* Expiry Date */}
                  {product.expiryDate && (
                    <div className={type.bodySm}>
                      <span className="font-semibold text-gray-700">Best Before: </span>
                      <span className="text-gray-600">
                        {new Date(product.expiryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Expected Delivery */}
                  {product.expectedDeliveryDays && (
                    <div className={type.bodySm}>
                      <span className="font-semibold text-gray-700">Delivery: </span>
                      <span className="text-gray-600">{product.expectedDeliveryDays} days</span>
                    </div>
                  )}

                  {/* Returnable */}
                  {product.isReturnable !== undefined && (
                    <div className={type.bodySm}>
                      <span className="font-semibold text-gray-700">Returnable: </span>
                      <span className={product.isReturnable ? 'text-blue-600' : 'text-red-500'}>
                        {product.isReturnable ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Info */}
                {availableStock !== null && (
                  <div className={`flex items-center gap-2 mb-5 ${type.bodySm} font-semibold ${
                    availableStock <= 0
                      ? 'text-red-600'
                      : availableStock <= 10
                        ? 'text-orange-600'
                        : 'text-blue-600'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      availableStock <= 0
                        ? 'bg-red-500'
                        : availableStock <= 10
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
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
                <div className="flex flex-row items-stretch gap-2 sm:gap-3">
                  {availableStock === 0 ? (
                    <button
                      type="button"
                      disabled
                      className={`flex-1 font-bold py-3 sm:py-3.5 rounded-xl ${type.button} bg-gray-300 text-gray-500 cursor-not-allowed`}
                    >
                      Out of Stock
                    </button>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <CartQuantityControl
                          quantity={cartQuantity}
                          updating={cartUpdating}
                          onAdd={addToCartFromDetail}
                          onIncrement={incrementCartQty}
                          onDecrement={decrementCartQty}
                          addLabel="Add to Cart"
                          className="!mt-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={buyingNow}
                        className={`flex-1 h-10 font-bold rounded-md active:scale-[0.98] transition-all ${type.button} disabled:opacity-60 min-w-0 bg-[#205ea9] text-white hover:bg-[#264a6d] flex items-center justify-center`}
                      >
                        {buyingNow ? 'Processing...' : '⚡ Buy Now'}
                      </button>
                    </>
                  )}
                </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 px-4 sm:px-0">
              {/* Key Features */}
              {product.keyFeatures?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-[#205EA9]/10 rounded-lg flex items-center justify-center text-sm">✨</span>
                    Key Features
                  </h3>
                  <ul className="space-y-2.5">
                    {product.keyFeatures.map((f, i) => (
                      <li key={i} className={`flex items-start gap-3 text-gray-700 ${type.bodySm}`}>
                        <span className={`text-[#205EA9] mt-0.5 ${type.caption}`}>●</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Health Benefits (Food) */}
              {product.healthBenefits?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">💚</span>
                    Health Benefits
                  </h3>
                  <ul className="space-y-2.5">
                    {product.healthBenefits.map((b, i) => (
                      <li key={i} className={`flex items-start gap-3 text-gray-700 ${type.bodySm}`}>
                        <span className={`text-blue-500 mt-0.5 ${type.caption}`}>●</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description (string — Health Supplements / Houses / Grooming) */}
              {product.description && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📝</span>
                    Description
                  </h3>
                  <p className={`text-gray-700 ${type.bodySm}`}>{product.description}</p>
                </div>
              )}

              {/* Product Details (array — Food / Clothes / Accessories / Toys) */}
              {(product.details?.length > 0 || product.productDetails?.length > 0) && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📋</span>
                    Product Details
                  </h3>
                  <ul className="space-y-2.5">
                    {(product.details || product.productDetails).map((d, i) => (
                      <li key={i} className={`flex items-start gap-3 text-gray-700 ${type.bodySm}`}>
                        <span className={`text-blue-500 mt-0.5 ${type.caption}`}>●</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Highlights (Health Supplements / Houses) */}
              {product.highlights?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-sm">⭐</span>
                    Highlights
                  </h3>
                  <ul className="space-y-2.5">
                    {product.highlights.map((h, i) => (
                      <li key={i} className={`flex items-start gap-3 text-gray-700 ${type.bodySm}`}>
                        <span className={`text-yellow-500 mt-0.5 ${type.caption}`}>●</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutrients (Food) */}
              {product.nutrients?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-sm">🧪</span>
                    Nutritional Info
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.nutrients.map((n, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                        <p className={`${type.bodySm} font-semibold text-gray-800`}>{n}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage / Dosage (Health Supplements) */}
              {product.usage && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-sm">💊</span>
                    Usage
                  </h3>
                  <div className={`space-y-2 ${type.bodySm} text-gray-700`}>
                    <p><span className="font-semibold">Dosage:</span> {product.usage.dosage}</p>
                    <p><span className="font-semibold">Age Group:</span> {product.usage.ageGroup}</p>
                  </div>
                </div>
              )}

              {/* Usage Instructions (Grooming) */}
              {product.usageInstructions?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-sm">📝</span>
                    Usage Instructions
                  </h3>
                  <ol className="space-y-2.5">
                    {product.usageInstructions.map((u, i) => (
                      <li key={i} className={`flex items-start gap-3 text-gray-700 ${type.bodySm}`}>
                        <span className={`text-cyan-600 font-bold ${type.caption} mt-0.5`}>{i + 1}.</span>
                        {u}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Care Instructions (Clothes) */}
              {product.careInstructions?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-sm">🧼</span>
                    Care Instructions
                  </h3>
                  <ul className="space-y-2.5">
                    {product.careInstructions.map((c, i) => (
                      <li key={i} className={`flex items-start gap-3 text-gray-700 ${type.bodySm}`}>
                        <span className={`text-pink-500 mt-0.5 ${type.caption}`}>●</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dimensions (Houses) */}
              {product.dimensions && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className={`${type.h3} text-gray-900 mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">📐</span>
                    Dimensions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className={`${type.caption} text-gray-500`}>Height</p>
                      <p className={`${type.bodySm} font-semibold text-gray-800`}>{product.dimensions.height}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className={`${type.caption} text-gray-500`}>Width</p>
                      <p className={`${type.bodySm} font-semibold text-gray-800`}>{product.dimensions.width}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className={`${type.caption} text-gray-500`}>Depth</p>
                      <p className={`${type.bodySm} font-semibold text-gray-800`}>{product.dimensions.depth}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className={`${type.caption} text-gray-500`}>Weight</p>
                      <p className={`${type.bodySm} font-semibold text-gray-800`}>{product.dimensions.weight}</p>
                    </div>
                  </div>
                </div>
              )}

          </div>
        </div>
      </section>

      {/* Similar Products */}
      {(similarLoading || similarProducts.length > 0) && (
        <section className="py-6 sm:py-8 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className={`${type.h2} text-gray-900 mb-4`}>Similar Products</h2>
            {similarLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
                {similarProducts.map((item) => (
                  <ProductCard
                    key={item._id}
                    product={item}
                    apiEndpoint={productType}
                    wishlistIds={wishlistIds}
                    onWishlistToggle={handleSimilarWishlistToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="You are not logged in. Please log in first to proceed with Buy Now."
      />
    </div>
  );
};

export default ProductDetail;
