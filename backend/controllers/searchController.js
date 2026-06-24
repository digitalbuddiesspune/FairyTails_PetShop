import Food from '../models/Food.js';
import Clothes from '../models/Clothes.js';
import Toy from '../models/Toy.js';
import Accessory from '../models/Accessory.js';
import GroomingEssential from '../models/GroomingEssential.js';
import HealthSupplement from '../models/HealthSupplement.js';
import House from '../models/House.js';
import {
  buildMongoSearchFilter,
  matchesSearchQuery,
  searchRelevanceScore,
} from '../utils/productSearch.js';

const CANDIDATE_LIMIT = 120;
const RESULT_LIMIT = 50;

const COLLECTIONS = [
  { model: Food, productType: 'Food', useNameField: false },
  { model: Clothes, productType: 'Clothes', useNameField: false },
  { model: Toy, productType: 'Toy', useNameField: false },
  { model: Accessory, productType: 'Accessory', useNameField: false },
  { model: GroomingEssential, productType: 'GroomingEssential', useNameField: false },
  { model: HealthSupplement, productType: 'HealthSupplement', useNameField: true },
  { model: House, productType: 'House', useNameField: true },
];

const fetchCandidates = async (collection, q) => {
  const filter = buildMongoSearchFilter(q, collection.useNameField);
  let items = await collection.model.find(filter).limit(CANDIDATE_LIMIT).lean();

  if (items.length < 8) {
    const broader = await collection.model.find().sort({ createdAt: -1 }).limit(CANDIDATE_LIMIT).lean();
    const seen = new Set(items.map((p) => String(p._id)));
    broader.forEach((p) => {
      const id = String(p._id);
      if (!seen.has(id)) {
        seen.add(id);
        items.push(p);
      }
    });
  }

  return items
    .filter((product) => matchesSearchQuery(product, q))
    .map((product) => ({ ...product, _productType: collection.productType }));
};

// @desc    Search products across all collections (name, brand, category, description, features, fuzzy)
// @route   GET /api/v1/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0,
        message: 'Enter at least 2 characters to search',
      });
    }

    const batches = await Promise.all(COLLECTIONS.map((collection) => fetchCandidates(collection, q)));
    const results = batches
      .flat()
      .sort((a, b) => searchRelevanceScore(b, q) - searchRelevanceScore(a, q))
      .slice(0, RESULT_LIMIT);

    res.status(200).json({
      success: true,
      data: results,
      total: results.length,
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Search failed',
    });
  }
};
