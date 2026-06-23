import { getProductVariants } from '../utils/productVariants';

const ProductVariantBadges = ({ product, maxShow = 4, className = '' }) => {
  const variants = getProductVariants(product);
  if (!variants.length) return null;

  const withLabels = variants.filter((v) => v.label);
  if (!withLabels.length) return null;

  if (withLabels.length === 1) {
    return (
      <p className={`text-xs text-gray-500 ${className}`}>
        {variants[0].kind === 'capacity' ? 'Capacity' : variants[0].kind === 'size' ? 'Size' : 'Option'}: {withLabels[0].label}
      </p>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {withLabels.slice(0, maxShow).map((variant, index) => (
        <span
          key={`${variant.label}-${index}`}
          className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200"
        >
          {variant.label}
        </span>
      ))}
      {withLabels.length > maxShow && (
        <span className="text-[10px] sm:text-xs text-gray-400 self-center">
          +{withLabels.length - maxShow} more
        </span>
      )}
    </div>
  );
};

export default ProductVariantBadges;
