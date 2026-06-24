import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { type } from '../styles/typography';
import { getApiBearerToken } from '../auth/session';
import { formatRupee } from '../utils/formatPrice';
import { getStartingVariant, hasMultipleVariants, getProductDiscountPercent } from '../utils/productVariants';
import { getProductDetailUrl, getProductModelType } from '../utils/productModelType';
import { useCartQuantity } from '../hooks/useCartQuantity';
import ProductVariantBadges from './ProductVariantBadges';
import CartQuantityControl from './CartQuantityControl';

const ProductCard = ({
  product,
  productUrl: productUrlProp,
  apiEndpoint,
  wishlistIds = [],
  onWishlistToggle,
  showAddToCart = true,
}) => {
  const displayName = product.productName || product.name || 'Unnamed Product';
  const displayImage = product.images?.[0] || product.image || null;
  const productUrl = productUrlProp || getProductDetailUrl(product, apiEndpoint);
  const isInWishlist = wishlistIds.includes(product._id);

  const startingPrice = useMemo(() => getStartingVariant(product), [product]);
  const multiVariants = hasMultipleVariants(product);
  const discountPercent = useMemo(
    () => getProductDiscountPercent(product, startingPrice),
    [product, startingPrice]
  );
  const productModelType = useMemo(() => getProductModelType(product), [product]);

  const { quantity, updating, addOne, increment, decrement } = useCartQuantity(
    product._id,
    0,
    productModelType
  );

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = getApiBearerToken();
    if (!token) {
      const { addToGuestWishlist, removeFromGuestWishlist, isInGuestWishlist } = await import('../utils/guestCart');
      if (isInGuestWishlist(product._id)) {
        removeFromGuestWishlist(product._id);
      } else {
        addToGuestWishlist(product);
      }
      onWishlistToggle?.(product._id);
      return;
    }
    onWishlistToggle?.(product._id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow duration-200 overflow-hidden flex flex-col min-w-0 h-full">
      <div className="relative bg-white">
        <Link to={productUrl} className="block aspect-square overflow-hidden">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">🐾</div>
          )}
        </Link>
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:scale-105 transition-transform z-10"
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isInWishlist ? (
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-2">
        <Link to={productUrl} className="block flex-1">
          <h3 className={`${type.cardTitle} text-gray-900 line-clamp-2 min-h-[2.5rem] hover:text-[#205EA9] transition-colors`}>
            {displayName}
          </h3>
        </Link>

        {startingPrice && (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {startingPrice.mrp > startingPrice.discountedPrice && (
              <span className={`${type.caption} text-gray-400 line-through`}>{formatRupee(startingPrice.mrp)}</span>
            )}
            <span className={`${type.priceSm} text-gray-900`}>
              {multiVariants && <span className={`${type.caption} text-gray-500 mr-0.5`}>from</span>}
              {formatRupee(startingPrice.discountedPrice)}
            </span>
            {discountPercent > 0 && (
              <span className={`${type.captionMedium} text-red-600 bg-red-50 px-1.5 py-0.5 rounded`}>
                {discountPercent}% off
              </span>
            )}
          </div>
        )}

        <ProductVariantBadges product={product} className="!mb-0" maxShow={3} />

        {showAddToCart && (
          <CartQuantityControl
            quantity={quantity}
            updating={updating}
            onAdd={addOne}
            onIncrement={increment}
            onDecrement={decrement}
          />
        )}
      </div>
    </div>
  );
};

export default ProductCard;
