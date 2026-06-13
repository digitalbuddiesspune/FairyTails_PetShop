/** Round to the nearest rupee for display. */
export const roundPrice = (amount) => {
  const value = Number(amount);
  return Number.isFinite(value) ? Math.round(value) : 0;
};

/** Format a price with Indian grouping, rounded to the nearest rupee. */
export const formatPrice = (amount) => roundPrice(amount).toLocaleString('en-IN');

/** Format as ₹-prefixed price string. */
export const formatRupee = (amount) => `₹${formatPrice(amount)}`;
