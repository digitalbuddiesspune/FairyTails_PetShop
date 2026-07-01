import { type } from '../styles/typography';

const CartIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CONTROL_HEIGHT = 'h-10';

const CartQuantityControl = ({
  quantity,
  updating = false,
  onAdd,
  onIncrement,
  onDecrement,
  addLabel = 'Add to Cart',
  className = '',
  compact = false,
  showCartIcon = true,
  variant = 'filled',
}) => {
  const isOutline = variant === 'outline';
  const heightClass = isOutline ? 'h-8' : CONTROL_HEIGHT;
  const borderColor = isOutline ? 'border-[#205EA9]' : 'border-gray-300';
  const qtyTextClass = isOutline ? type.captionMedium : type.label;

  if (quantity > 0) {
    return (
      <div
        className={`mt-auto w-full ${heightClass} grid grid-cols-[1fr_auto_1fr] items-stretch border ${borderColor} rounded-md bg-white overflow-hidden box-border ${className}`}
      >
        <button
          type="button"
          onClick={onDecrement}
          disabled={updating}
          className={`h-full w-full flex items-center justify-center ${qtyTextClass} ${isOutline ? 'text-[#205EA9]' : 'text-gray-700'} hover:bg-gray-50 disabled:opacity-50 transition-colors`}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span
          className={`flex items-center justify-center px-1.5 font-semibold border-x ${borderColor} ${qtyTextClass} ${
            isOutline ? 'text-[#205EA9]' : 'text-gray-900'
          } ${compact || isOutline ? 'min-w-[1.5rem]' : 'min-w-[2rem]'}`}
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={updating}
          className={`h-full w-full flex items-center justify-center ${qtyTextClass} ${isOutline ? 'text-[#205EA9]' : 'text-gray-700'} hover:bg-gray-50 disabled:opacity-50 transition-colors`}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  const addButtonClass = isOutline
    ? `mt-auto w-full ${heightClass} box-border bg-white border border-[#205EA9] text-[#205EA9] hover:bg-[#205EA9]/5 ${isOutline ? 'text-[11px] leading-tight font-semibold' : type.captionMedium} rounded-md flex items-center justify-center transition-colors disabled:opacity-60 px-1 text-center`
    : `mt-auto w-full ${heightClass} box-border bg-[#205EA9] hover:bg-[#1d4f8f] text-white ${type.button} rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-60`;

  return (
    <button
      type="button"
      onClick={(e) => onAdd?.(e)}
      disabled={updating}
      className={`${addButtonClass} ${className}`}
    >
      {showCartIcon && !isOutline && <CartIcon />}
      {updating ? 'Adding...' : addLabel}
    </button>
  );
};

export default CartQuantityControl;
