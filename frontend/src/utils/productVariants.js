/** Normalized product variant (capacity, size, volume, etc.) */
export const getProductVariants = (product) => {
  if (!product) return [];

  if (Array.isArray(product.prices) && product.prices.length > 0) {
    return product.prices.map((row, index) => ({
      label: row.capacity?.trim() || `Option ${index + 1}`,
      mrp: Number(row.mrp) || 0,
      discountedPrice: Number(row.discountedPrice ?? row.discountPrice) || 0,
      availableStock: row.availableStock,
      kind: 'capacity',
    }));
  }

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes.map((row, index) => ({
      label: row.size?.trim() || `Size ${index + 1}`,
      mrp: Number(row.mrp) || 0,
      discountedPrice: Number(row.discountedPrice ?? row.discountPrice) || 0,
      availableStock: row.availableStock,
      kind: 'size',
    }));
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((row, index) => ({
      label: (row.volume || row.capacity || row.size || '').trim() || `Option ${index + 1}`,
      mrp: Number(row.mrp) || 0,
      discountedPrice: Number(row.discountedPrice ?? row.discountPrice) || 0,
      availableStock: row.availableStock,
      kind: 'variant',
    }));
  }

  const mrp = product.mrp ?? product.price;
  const discountedPrice = product.discountPrice ?? product.discountedPrice ?? mrp;
  if (mrp == null && discountedPrice == null) return [];

  const label =
    product.capacity?.trim() ||
    product.size?.trim() ||
    product.volume?.trim() ||
    '';

  return [
    {
      label,
      mrp: Number(mrp) || 0,
      discountedPrice: Number(discountedPrice) || 0,
      availableStock: product.availableStock,
      kind: 'flat',
    },
  ];
};

export const hasMultipleVariants = (product) => getProductVariants(product).length > 1;

export const getStartingVariant = (product) => {
  const variants = getProductVariants(product);
  if (!variants.length) return null;
  return variants.reduce(
    (min, row) => (row.discountedPrice < min.discountedPrice ? row : min),
    variants[0]
  );
};

export const getVariantKindLabel = (product) => {
  const variants = getProductVariants(product);
  if (!variants.length) return 'options';
  const kind = variants[0].kind;
  if (kind === 'capacity') return 'capacities';
  if (kind === 'size') return 'sizes';
  return 'options';
};
