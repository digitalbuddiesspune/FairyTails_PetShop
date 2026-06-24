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
}) => {
  if (quantity > 0) {
    return (
      <div
        className={`mt-auto w-full ${CONTROL_HEIGHT} grid grid-cols-[1fr_auto_1fr] items-stretch border border-gray-300 rounded-md bg-white overflow-hidden box-border ${className}`}
      >
        <button
          type="button"
          onClick={onDecrement}
          disabled={updating}
          className={`h-full w-full flex items-center justify-center ${type.label} text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors`}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span
          className={`flex items-center justify-center px-2 font-semibold text-gray-900 border-x border-gray-300 ${type.label} ${
            compact ? 'min-w-[1.75rem]' : 'min-w-[2rem]'
          }`}
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={updating}
          className={`h-full w-full flex items-center justify-center ${type.label} text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors`}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={updating}
      className={`mt-auto w-full ${CONTROL_HEIGHT} box-border bg-[#205EA9] hover:bg-[#1d4f8f] text-white ${type.button} rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${className}`}
    >
      <CartIcon />
      {updating ? 'Adding...' : addLabel}
    </button>
  );
};

export default CartQuantityControl;
