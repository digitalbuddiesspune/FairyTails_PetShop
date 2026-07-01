import { useEffect } from 'react';
import { type } from '../styles/typography';
import { formatRupee } from '../utils/formatPrice';
import { getProductVariants } from '../utils/productVariants';
import { useCartQuantity } from '../hooks/useCartQuantity';
import CartQuantityControl from './CartQuantityControl';
import { flyToTarget } from '../utils/flyAnimation';

const VariantPickerRow = ({ productId, variantIndex, variant, imageUrl, productModelType }) => {
  const { quantity, updating, addOne, increment, decrement } = useCartQuantity(
    productId,
    variantIndex,
    productModelType
  );

  const outOfStock = variant.availableStock === 0;

  const handleAdd = (e) => {
    if (outOfStock) return;
    if (quantity === 0) {
      flyToTarget(e.currentTarget, 'cart', { imageUrl });
    }
    addOne();
  };

  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-b-0">
      <div className="w-9 h-9 shrink-0 rounded-md border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-contain p-0.5" />
        ) : (
          <span className="text-sm text-gray-300">🐾</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${type.captionMedium} text-gray-900 truncate`}>{variant.label}</p>
        <p className={`${type.caption} text-gray-700 font-semibold`}>{formatRupee(variant.discountedPrice)}</p>
      </div>
      <div className="w-[6.5rem] shrink-0">
        {outOfStock ? (
          <span className={`${type.caption} text-red-500 text-center block`}>Out of stock</span>
        ) : (
          <CartQuantityControl
            quantity={quantity}
            updating={updating}
            onAdd={handleAdd}
            onIncrement={increment}
            onDecrement={decrement}
            addLabel="Add to Cart"
            compact
            showCartIcon={false}
            variant="outline"
            className="!mt-0"
          />
        )}
      </div>
    </div>
  );
};

const VariantPickerSheet = ({ open, onClose, product, productModelType, displayName, displayImage }) => {
  const variants = getProductVariants(product);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !product) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-picker-title"
        className="fixed z-[95] bg-white shadow-2xl flex flex-col max-h-[70vh]
          inset-x-0 bottom-0 rounded-t-xl animate-slideUp
          md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:bottom-auto md:w-full md:max-w-sm md:rounded-xl md:max-h-[65vh]"
      >
        <div className="flex items-start justify-between gap-2 px-3 py-2.5 border-b border-gray-100 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 id="variant-picker-title" className={`${type.captionMedium} text-gray-900 truncate font-semibold`}>
              {displayName}
            </h2>
            <p className={`${type.caption} text-gray-500 mt-0.5`}>Choose a variant</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg shrink-0"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {variants.map((variant, index) => (
            <VariantPickerRow
              key={`${variant.label}-${index}`}
              productId={product._id}
              variantIndex={index}
              variant={variant}
              imageUrl={displayImage}
              productModelType={productModelType}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default VariantPickerSheet;
