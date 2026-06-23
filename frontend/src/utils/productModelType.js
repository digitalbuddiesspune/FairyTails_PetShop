export const getProductModelType = (product) => {
  if (!product) return 'Food';
  if (product.category === 'Toy') return 'Toy';
  if (product.category === 'house') return 'House';
  if (product.category === 'health-supplement') return 'HealthSupplement';
  if (product.category === 'accessories') return 'Accessory';
  if (product.category === 'grooming-essentials') return 'GroomingEssential';
  if (product.sizes?.length && !product.prices?.length) return 'Clothes';
  if (product._productType) return product._productType;
  return 'Food';
};

export const getProductDetailUrl = (product, apiEndpoint) => {
  const derivedEndpoint =
    !apiEndpoint && product.sizes?.length && !product.prices?.length
      ? '/clothes'
      : !apiEndpoint && (product.prices?.length || !product.sizes?.length)
        ? '/food'
        : apiEndpoint;
  const typeFromProduct = product._productType;
  const endpointMap = {
    Food: '/food',
    Clothes: '/clothes',
    Toy: '/toys',
    Accessory: '/accessories',
    GroomingEssential: '/grooming-essentials',
    HealthSupplement: '/health-supplements',
    House: '/houses',
  };
  const ep = derivedEndpoint || endpointMap[typeFromProduct];
  return ep ? `/product/${product._id}?type=${ep}` : `/product/${product._id}`;
};
