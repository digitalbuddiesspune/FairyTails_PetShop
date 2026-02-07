import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const DOG_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg';
const CAT_ICON = 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
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
      await axios.post(
        `${API_BASE}/cart`,
        { productId: id, quantity: 1, selectedSize },
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/food/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Calculate discount
  const discountPercent = useMemo(() => {
    if (!product?.prices?.[selectedSize]) return 0;
    const p = product.prices[selectedSize];
    return Math.round(((p.mrp - p.discountedPrice) / p.mrp) * 100);
  }, [product, selectedSize]);

  // Average rating
  const avgRating = useMemo(() => {
    if (!product?.reviews?.length) return 0;
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / product.reviews.length).toFixed(1);
  }, [product]);

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

  const currentPrice = product.prices[selectedSize];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
            <Link to="/" className="hover:text-[#65a30d] transition-colors">Home</Link>
            <span>/</span>
            <Link
              to={`/products?category=${product.category}`}
              className="hover:text-[#65a30d] transition-colors"
            >
              {product.category} Food
            </Link>
            <span>/</span>
            <Link
              to={`/products?category=${product.category}&subCategory=${encodeURIComponent(product.subCategory)}`}
              className="hover:text-[#65a30d] transition-colors"
            >
              {product.subCategory}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.productName}</span>
          </nav>
        </div>
      </div>

      {/* Two-Column Layout: Sticky Image Left + Scrollable Details Right */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">

            {/* LEFT — Sticky Image Gallery */}
            <div className="w-full md:w-[45%] lg:w-[40%] flex-shrink-0">
              <div className="md:sticky md:top-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  {/* Main Image */}
                  <div className="aspect-square flex items-center justify-center mb-4 bg-gray-50 rounded-2xl p-8">
                    {product.images?.[selectedImage] ? (
                      <img
                        src={product.images[selectedImage]}
                        alt={product.productName}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-8xl text-gray-300">🐾</span>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {product.images?.length > 1 && (
                    <div className="flex gap-3 justify-center">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
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
            <div className="w-full md:w-[55%] lg:w-[60%] space-y-6">

              {/* Basic Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="bg-[#65a30d]/10 text-[#65a30d] text-xs font-bold px-3 py-1 rounded-full">
                    <img src={product.category === 'Dog' ? DOG_ICON : CAT_ICON} alt={product.category} className="w-4 h-4 object-contain inline" /> {product.category}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                    {product.subCategory}
                  </span>
                  {discountPercent > 0 && (
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Brand */}
                <p className="text-sm font-semibold text-[#65a30d] uppercase tracking-wide mb-1">
                  {product.brand}
                </p>

                {/* Name */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {product.productName}
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
                  <div className="bg-gray-50 rounded-xl p-4 mb-5">
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{currentPrice.discountedPrice}
                      </span>
                      {currentPrice.mrp > currentPrice.discountedPrice && (
                        <span className="text-lg text-gray-400 line-through pb-0.5">
                          ₹{currentPrice.mrp}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      MRP (incl. of all taxes) for {currentPrice.capacity}
                    </p>
                  </div>
                )}

                {/* Size Options */}
                {product.prices?.length > 1 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Select Size:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.prices.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSize(i)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                            selectedSize === i
                              ? 'border-[#65a30d] bg-[#65a30d]/5 text-[#65a30d]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {p.capacity} — ₹{p.discountedPrice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flavours */}
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

                {/* Expiry */}
                {product.expiryDate && (
                  <p className="text-xs text-gray-400 mb-5">
                    Best before: {new Date(product.expiryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white font-bold py-3.5 rounded-xl hover:from-[#4d7c0f] hover:to-[#3f6212] active:scale-[0.98] transition-all text-sm disabled:opacity-60"
                  >
                    {addingToCart ? 'Adding...' : cartMessage || '🛒 Add to Cart'}
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    disabled={togglingWishlist}
                    className={`px-5 font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all text-sm border ${
                      isInWishlist
                        ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    } disabled:opacity-60`}
                    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    {isInWishlist ? '♥' : '♡'}
                  </button>
                </div>
              </div>

              {/* Key Features */}
              {product.keyFeatures?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

              {/* Health Benefits */}
              {product.healthBenefits?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

              {/* Product Details */}
              {product.details?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📋</span>
                    Product Details
                  </h3>
                  <ul className="space-y-2.5">
                    {product.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                        <span className="text-blue-500 mt-0.5 text-xs">●</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutrients */}
              {product.nutrients?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
