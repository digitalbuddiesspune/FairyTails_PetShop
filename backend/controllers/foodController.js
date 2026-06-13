import Food from '../models/Food.js';

const normalizeFoodPayload = (body = {}) => {
  const data = { ...body };

  if (Array.isArray(data.prices) && data.prices.length > 0) {
    data.prices = data.prices
      .map((row) => ({
        capacity: String(row.capacity || '').trim(),
        mrp: Number(row.mrp),
        discountedPrice: Number(row.discountedPrice ?? row.discountPrice),
        availableStock: Number(row.availableStock ?? 0),
      }))
      .filter((row) => row.capacity && Number.isFinite(row.mrp) && Number.isFinite(row.discountedPrice));

    if (!data.prices.length) {
      return { error: 'Please provide at least one valid capacity variant with MRP and sale price' };
    }

    const lowest = data.prices.reduce(
      (min, row) => (row.discountedPrice < min.discountedPrice ? row : min),
      data.prices[0]
    );

    data.capacity = data.prices[0].capacity;
    data.mrp = lowest.mrp;
    data.discountPrice = lowest.discountedPrice;
    data.availableStock = data.prices.reduce((sum, row) => sum + row.availableStock, 0);
    return { data };
  }

  if (
    data.capacity &&
    data.mrp !== undefined &&
    data.mrp !== null &&
    data.mrp !== '' &&
    data.discountPrice !== undefined &&
    data.discountPrice !== null &&
    data.discountPrice !== ''
  ) {
    data.prices = [
      {
        capacity: String(data.capacity).trim(),
        mrp: Number(data.mrp),
        discountedPrice: Number(data.discountPrice),
        availableStock: Number(data.availableStock ?? 0),
      },
    ];
    data.mrp = Number(data.mrp);
    data.discountPrice = Number(data.discountPrice);
    data.availableStock = Number(data.availableStock ?? 0);
    return { data };
  }

  return { error: 'Please provide at least one capacity variant with MRP and sale price' };
};

const validateFoodRequired = (data) => {
  if (!data.productName || !data.category || !data.subCategory || !data.discountType || !data.expiryDate) {
    return 'Please provide productName, category, subCategory, discountType, and expiryDate';
  }
  if (!data.images || !data.images.length) {
    return 'Please provide at least one image';
  }
  if (!data.prices || !data.prices.length) {
    return 'Please provide at least one capacity variant with pricing';
  }
  return null;
};

// @desc    Get all food products (with optional filters)
// @route   GET /api/food
// @access  Public
export const getAllFood = async (req, res) => {
  try {
    const { category, subCategory, brand, sort, page = 1, limit = 12 } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category; // "Dog" or "Cat"
    if (subCategory) filter.subCategory = subCategory; // "Dry Food", "Wet Food", "Treats"
    if (brand) filter.brand = { $regex: brand, $options: 'i' };

    // Build sort object
    let sortObj = { createdAt: -1 }; // default: newest first
    if (sort === 'price-low') sortObj = { discountPrice: 1 };
    if (sort === 'price-high') sortObj = { discountPrice: -1 };
    if (sort === 'rating') sortObj = { 'reviews.rating': -1 };
    if (sort === 'name-asc') sortObj = { productName: 1 };
    if (sort === 'name-desc') sortObj = { productName: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [foods, total] = await Promise.all([
      Food.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Food.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: foods,
    });
  } catch (error) {
    console.error('❌ Get all food error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching food products',
    });
  }
};

// @desc    Get single food product by ID
// @route   GET /api/food/:id
// @access  Public
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('reviews.user', 'name');

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    console.error('❌ Get food by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching food product',
    });
  }
};

// @desc    Create a new food product
// @route   POST /api/food
// @access  Public (should be Admin in production)
export const createFood = async (req, res) => {
  try {
    const normalized = normalizeFoodPayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ success: false, message: normalized.error });
    }

    const data = normalized.data;
    const validationError = validateFoodRequired(data);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const food = await Food.create(data);

    res.status(201).json({
      success: true,
      message: 'Food product created successfully',
      data: food,
    });
  } catch (error) {
    console.error('❌ Create food error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating food product',
    });
  }
};

// @desc    Update a food product
// @route   PUT /api/food/:id
// @access  Public (should be Admin in production)
export const updateFood = async (req, res) => {
  try {
    const normalized = normalizeFoodPayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ success: false, message: normalized.error });
    }

    const data = normalized.data;
    const validationError = validateFoodRequired(data);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const food = await Food.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food product updated successfully',
      data: food,
    });
  } catch (error) {
    console.error('❌ Update food error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating food product',
    });
  }
};

// @desc    Delete a food product
// @route   DELETE /api/food/:id
// @access  Public (should be Admin in production)
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food product deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete food error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting food product',
    });
  }
};

// @desc    Add a review to a food product
// @route   POST /api/food/:id/reviews
// @access  Public (should be Auth in production)
export const addReview = async (req, res) => {
  try {
    const { rating, comment, user } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating',
      });
    }

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food product not found',
      });
    }

    food.reviews.push({ user, rating, comment });
    await food.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: food,
    });
  } catch (error) {
    console.error('❌ Add review error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error adding review',
    });
  }
};

// @desc    Get food products by category (Dog or Cat)
// @route   GET /api/food/category/:category
// @access  Public
export const getFoodByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!['Dog', 'Cat'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be either "Dog" or "Cat"',
      });
    }

    const foods = await Food.find({ category }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error('❌ Get food by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching food by category',
    });
  }
};

// @desc    Seed sample food products
// @route   POST /api/food/seed
// @access  Public (should be Admin only)
export const seedFood = async (req, res) => {
  try {
    await Food.deleteMany({});

    const sampleFood = [
      {
        productName: 'Royal Canin Maxi Adult Dog Food',
        brand: 'Royal Canin',
        prices: [
          { capacity: '1kg', mrp: 799, discountedPrice: 699 },
          { capacity: '4kg', mrp: 2899, discountedPrice: 2499 },
          { capacity: '15kg', mrp: 8999, discountedPrice: 7499 },
        ],
        details: [
          'Specially designed for large breed adult dogs (26-44 kg)',
          'Supports bone and joint health',
          'Highly digestible proteins for optimal nutrient absorption',
        ],
        keyFeatures: [
          'For large breed dogs (15 months+)',
          'Supports digestive health',
          'Maintains ideal weight',
          'Strengthens bones & joints',
        ],
        category: 'Dog',
        subCategory: 'Dry Food',
        expiryDate: new Date('2027-06-15'),
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        flavours: ['Chicken', 'Rice'],
        nutrients: ['Protein 26%', 'Fat 17%', 'Fiber 1.3%', 'Calcium 1.1%'],
        healthBenefits: ['Joint support', 'Healthy digestion', 'Shiny coat', 'Strong bones'],
      },
      {
        productName: 'Pedigree Adult Wet Dog Food - Chicken & Liver Chunks',
        brand: 'Pedigree',
        prices: [
          { capacity: '70g', mrp: 35, discountedPrice: 30 },
          { capacity: '130g', mrp: 60, discountedPrice: 50 },
        ],
        details: [
          'Made with real chicken and liver chunks in gravy',
          'Complete and balanced meal for adult dogs',
          'No artificial colours or flavours',
        ],
        keyFeatures: [
          'Real chicken & liver',
          'Rich in protein',
          'Easy to digest',
          'No artificial additives',
        ],
        category: 'Dog',
        subCategory: 'Wet Food',
        expiryDate: new Date('2027-03-20'),
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        flavours: ['Chicken & Liver'],
        nutrients: ['Protein 7%', 'Fat 4%', 'Fiber 1%', 'Moisture 82%'],
        healthBenefits: ['Healthy skin', 'Strong immunity', 'Good digestion'],
      },
      {
        productName: 'Drools Chicken & Egg Adult Dog Food',
        brand: 'Drools',
        prices: [
          { capacity: '1.2kg', mrp: 399, discountedPrice: 349 },
          { capacity: '3kg', mrp: 899, discountedPrice: 749 },
          { capacity: '10kg', mrp: 2699, discountedPrice: 2299 },
        ],
        details: [
          'Real chicken as the #1 ingredient',
          'Enriched with egg for extra protein',
          'Contains omega fatty acids for healthy coat',
        ],
        keyFeatures: [
          'Real chicken & egg',
          'Omega 3 & 6 fatty acids',
          'Healthy skin & coat',
          'Strong muscles & bones',
        ],
        category: 'Dog',
        subCategory: 'Dry Food',
        expiryDate: new Date('2027-08-10'),
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        flavours: ['Chicken & Egg'],
        nutrients: ['Protein 22%', 'Fat 10%', 'Fiber 4%', 'Calcium 1.2%'],
        healthBenefits: ['Muscle development', 'Shiny coat', 'Strong teeth', 'Healthy digestion'],
      },
      {
        productName: 'Whiskas Adult Cat Dry Food - Tuna Flavour',
        brand: 'Whiskas',
        prices: [
          { capacity: '480g', mrp: 199, discountedPrice: 169 },
          { capacity: '1.2kg', mrp: 499, discountedPrice: 429 },
          { capacity: '3kg', mrp: 1199, discountedPrice: 999 },
        ],
        details: [
          'Crunchy pockets with soft & tasty filling',
          'Formulated with optimal calcium for strong bones',
          'Helps maintain a healthy urinary tract',
        ],
        keyFeatures: [
          'Tuna flavour cats love',
          'Supports healthy urinary tract',
          'Strong bones & teeth',
          'Healthy coat & skin',
        ],
        category: 'Cat',
        subCategory: 'Dry Food',
        expiryDate: new Date('2027-05-25'),
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        flavours: ['Tuna'],
        nutrients: ['Protein 30%', 'Fat 11%', 'Fiber 4%', 'Calcium 1%'],
        healthBenefits: ['Urinary health', 'Strong bones', 'Shiny fur', 'Healthy weight'],
      },
      {
        productName: 'Sheba Rich Premium Wet Cat Food - Chicken Loaf',
        brand: 'Sheba',
        prices: [
          { capacity: '70g', mrp: 40, discountedPrice: 35 },
          { capacity: '85g', mrp: 50, discountedPrice: 42 },
        ],
        details: [
          'Premium loaf texture made with real chicken',
          'Crafted for fussy eaters',
          'Single serve tray for freshness',
        ],
        keyFeatures: [
          'Premium chicken loaf',
          'Irresistible taste',
          'Single serve freshness',
          'No artificial preservatives',
        ],
        category: 'Cat',
        subCategory: 'Wet Food',
        expiryDate: new Date('2027-04-18'),
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        flavours: ['Chicken Loaf'],
        nutrients: ['Protein 8%', 'Fat 4.5%', 'Fiber 0.5%', 'Moisture 82%'],
        healthBenefits: ['Hydration support', 'Lean protein', 'Healthy skin'],
      },
      {
        productName: 'Doggie Dental Sticks - Mint Fresh',
        brand: 'Doggie',
        prices: [
          { capacity: '7 sticks', mrp: 199, discountedPrice: 149 },
          { capacity: '28 sticks', mrp: 699, discountedPrice: 549 },
        ],
        details: [
          'Scientifically designed X-shape helps clean teeth',
          'Freshens breath with natural mint',
          'Low in fat – perfect daily treat',
        ],
        keyFeatures: [
          'Cleans teeth daily',
          'Freshens breath',
          'Low fat formula',
          'Vet recommended',
        ],
        category: 'Dog',
        subCategory: 'Treats',
        expiryDate: new Date('2027-09-30'),
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        flavours: ['Mint'],
        nutrients: ['Protein 8%', 'Fat 2%', 'Fiber 5%'],
        healthBenefits: ['Dental health', 'Fresh breath', 'Healthy gums'],
      },
    ];

    const createdFood = await Food.insertMany(sampleFood);

    res.status(201).json({
      success: true,
      message: `${createdFood.length} food products seeded successfully`,
      count: createdFood.length,
      data: createdFood,
    });
  } catch (error) {
    console.error('❌ Seed food error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding food products',
    });
  }
};
