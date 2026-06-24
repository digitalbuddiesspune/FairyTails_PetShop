const SEARCH_STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'with', 'for', 'of', 'to', 'in', 'on', 'at', 'by', 'from', 'as', 'is', 'are',
]);

export const normalizeSearchInput = (raw) =>
  String(raw)
    .trim()
    .toLowerCase()
    .replace(/[\u201c\u201d\u2018\u2019`"'']/g, '')
    .replace(/\s+/g, ' ');

export const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchTokensFromQuery = (rawQuery) => {
  const q = normalizeSearchInput(rawQuery);
  if (!q) return [];
  return q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && !SEARCH_STOPWORDS.has(t));
};

const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i;
    for (let j = 1; j <= b.length; j += 1) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], row[j], prev) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
};

const maxEditDistance = (token) => {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  return 2;
};

const getProductName = (product) => product.productName || product.name || '';

const pushArrayValues = (parts, value) => {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item != null && item !== '') parts.push(String(item));
    });
  }
};

/** Searchable text from any product document. */
export const buildProductHaystack = (product) => {
  const parts = [
    getProductName(product),
    product.brand,
    product.category,
    product.subCategory,
    product.subSubCategory,
    product.productType,
    product.capacity,
    product.size,
    product.material,
    product.itemCode,
    product.hsn,
    product.suitableFor,
    product.description,
  ];

  pushArrayValues(parts, product.flavours);
  pushArrayValues(parts, product.color);
  pushArrayValues(parts, product.details);
  pushArrayValues(parts, product.productDetails);
  pushArrayValues(parts, product.keyFeatures);
  pushArrayValues(parts, product.nutrients);
  pushArrayValues(parts, product.healthBenefits);
  pushArrayValues(parts, product.highlights);
  pushArrayValues(parts, product.usageInstructions);
  pushArrayValues(parts, product.careInstructions);

  if (Array.isArray(product.prices)) {
    product.prices.forEach((row) => {
      if (row?.capacity != null) parts.push(String(row.capacity));
    });
  }
  if (Array.isArray(product.sizes)) {
    product.sizes.forEach((row) => {
      if (row?.size != null) parts.push(String(row.size));
    });
  }
  if (Array.isArray(product.variants)) {
    product.variants.forEach((row) => {
      if (row?.volume != null) parts.push(String(row.volume));
      if (row?.capacity != null) parts.push(String(row.capacity));
      if (row?.size != null) parts.push(String(row.size));
    });
  }

  return normalizeSearchInput(parts.filter(Boolean).join(' '));
};

const haystackWords = (haystack) => haystack.split(/\s+/).filter(Boolean);

const tokenMatchesHaystack = (haystack, token) => {
  if (!token) return true;

  if (/^\d+(\.\d+)?$/.test(token)) {
    return new RegExp(`(?:^|[^0-9])${escapeRegExp(token)}(?:[^0-9]|$)`).test(haystack);
  }

  if (haystack.includes(token)) return true;

  const words = haystackWords(haystack);
  const limit = maxEditDistance(token);

  return words.some((word) => {
    if (word === token) return true;
    if (word.includes(token) || token.includes(word)) return true;
    if (limit === 0 || word.length < 3 || token.length < 3) return false;
    return levenshtein(word, token) <= limit;
  });
};

export const matchesSearchQuery = (product, rawQuery) => {
  const trimmed = String(rawQuery).trim();
  if (!trimmed) return false;

  const tokens = searchTokensFromQuery(rawQuery);
  const haystack = buildProductHaystack(product);

  if (!tokens.length) {
    return haystack.includes(normalizeSearchInput(trimmed));
  }

  return tokens.every((token) => tokenMatchesHaystack(haystack, token));
};

export const searchRelevanceScore = (product, rawQuery) => {
  const q = normalizeSearchInput(rawQuery);
  if (!q) return 0;

  const name = normalizeSearchInput(getProductName(product));
  const haystack = buildProductHaystack(product);
  const tokens = searchTokensFromQuery(rawQuery);

  let score = 0;
  if (name === q) score += 5000;
  else if (name.startsWith(q)) score += 2000;
  else if (name.includes(q)) score += 1000;

  tokens.forEach((token) => {
    if (name.includes(token)) score += 80;
    else if (tokenMatchesHaystack(haystack, token)) score += 25;
  });

  return score;
};

const TEXT_FIELDS_PRODUCT_NAME = [
  'productName',
  'brand',
  'category',
  'subCategory',
  'subSubCategory',
  'productType',
  'capacity',
  'size',
  'material',
  'itemCode',
  'hsn',
  'suitableFor',
  'description',
  'flavours',
  'color',
  'details',
  'productDetails',
  'keyFeatures',
  'nutrients',
  'healthBenefits',
  'highlights',
  'usageInstructions',
  'careInstructions',
];

const TEXT_FIELDS_NAME = [
  'name',
  'brand',
  'category',
  'subCategory',
  'subSubCategory',
  'productType',
  'capacity',
  'size',
  'material',
  'itemCode',
  'hsn',
  'suitableFor',
  'description',
  'flavours',
  'color',
  'details',
  'productDetails',
  'keyFeatures',
  'nutrients',
  'healthBenefits',
  'highlights',
  'usageInstructions',
  'careInstructions',
];

const buildTokenRegex = (token) => {
  const escaped = escapeRegExp(token);
  if (token.length >= 4) {
    const prefix = escapeRegExp(token.slice(0, Math.min(4, token.length)));
    return { $regex: prefix, $options: 'i' };
  }
  return { $regex: escaped, $options: 'i' };
};

const buildMongoTokenClause = (token, fields) => ({
  $or: fields.map((field) => ({ [field]: buildTokenRegex(token) })),
});

/** Broad Mongo filter to fetch search candidates (refined in JS for fuzzy + multi-field). */
export const buildMongoSearchFilter = (rawQuery, useNameField = false) => {
  const tokens = searchTokensFromQuery(rawQuery);
  const fields = useNameField ? TEXT_FIELDS_NAME : TEXT_FIELDS_PRODUCT_NAME;

  if (!tokens.length) {
    const q = normalizeSearchInput(rawQuery);
    const regex = { $regex: escapeRegExp(q), $options: 'i' };
    const primary = useNameField ? 'name' : 'productName';
    return { $or: [{ [primary]: regex }, { brand: regex }, { subCategory: regex }] };
  }

  return { $and: tokens.map((token) => buildMongoTokenClause(token, fields)) };
};
