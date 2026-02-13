import Food from '../models/Food.js';
import Clothes from '../models/Clothes.js';
import Toy from '../models/Toy.js';
import Accessory from '../models/Accessory.js';
import GroomingEssential from '../models/GroomingEssential.js';
import HealthSupplement from '../models/HealthSupplement.js';
import House from '../models/House.js';

const SEARCH_LIMIT = 50;

// Build search filter - most models use productName, House/HealthSupplement use name
const regex = (q) => ({ $regex: q, $options: 'i' });
const productNameFilter = (q) => ({
  $or: [
    { productName: regex(q) },
    { brand: regex(q) },
    { subCategory: regex(q) },
  ],
});
const nameFilter = (q) => ({
  $or: [
    { name: regex(q) },
    { brand: regex(q) },
    { subCategory: regex(q) },
  ],
});

// @desc    Search products across all collections
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

    const pf = productNameFilter(q);
    const nf = nameFilter(q);

    const [foods, clothes, toys, accessories, grooming, health, houses] = await Promise.all([
      Food.find(pf).limit(SEARCH_LIMIT).lean(),
      Clothes.find(pf).limit(SEARCH_LIMIT).lean(),
      Toy.find(pf).limit(SEARCH_LIMIT).lean(),
      Accessory.find(pf).limit(SEARCH_LIMIT).lean(),
      GroomingEssential.find(pf).limit(SEARCH_LIMIT).lean(),
      HealthSupplement.find(nf).limit(SEARCH_LIMIT).lean(),
      House.find(nf).limit(SEARCH_LIMIT).lean(),
    ]);

    const results = [
      ...foods.map((p) => ({ ...p, _productType: 'Food' })),
      ...clothes.map((p) => ({ ...p, _productType: 'Clothes' })),
      ...toys.map((p) => ({ ...p, _productType: 'Toy' })),
      ...accessories.map((p) => ({ ...p, _productType: 'Accessory' })),
      ...grooming.map((p) => ({ ...p, _productType: 'GroomingEssential' })),
      ...health.map((p) => ({ ...p, _productType: 'HealthSupplement' })),
      ...houses.map((p) => ({ ...p, _productType: 'House' })),
    ];

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
