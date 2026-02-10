import Clothes from '../models/Clothes.js';

// @desc    Get all clothes (with optional filters)
// @route   GET /api/v1/clothes
// @access  Public
export const getAllClothes = async (req, res) => {
  try {
    const { category, subCategory, brand, color, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (color) filter.color = { $in: [color] };

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { 'sizes.0.discountedPrice': 1 };
    if (sort === 'price-high') sortObj = { 'sizes.0.discountedPrice': -1 };
    if (sort === 'name-asc') sortObj = { productName: 1 };
    if (sort === 'name-desc') sortObj = { productName: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [clothes, total] = await Promise.all([
      Clothes.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Clothes.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: clothes.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: clothes,
    });
  } catch (error) {
    console.error('❌ Get all clothes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching clothes',
    });
  }
};

// @desc    Get single clothes product by ID
// @route   GET /api/v1/clothes/:id
// @access  Public
export const getClothesById = async (req, res) => {
  try {
    const clothes = await Clothes.findById(req.params.id);

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: 'Clothes product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: clothes,
    });
  } catch (error) {
    console.error('❌ Get clothes by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching clothes product',
    });
  }
};

// @desc    Create a new clothes product
// @route   POST /api/v1/clothes
// @access  Public (should be Admin in production)
export const createClothes = async (req, res) => {
  try {
    const {
      productName, brand, category, subCategory, sizes,
      material, color, productDetails, keyFeatures,
      careInstructions, images, isReturnable, expectedDeliveryDays,
    } = req.body;

    if (!productName || !brand || !category || !subCategory) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productName, brand, category, and subCategory',
      });
    }

    const clothes = await Clothes.create({
      productName, brand, category, subCategory, sizes,
      material, color, productDetails, keyFeatures,
      careInstructions, images, isReturnable, expectedDeliveryDays,
    });

    res.status(201).json({
      success: true,
      message: 'Clothes product created successfully',
      data: clothes,
    });
  } catch (error) {
    console.error('❌ Create clothes error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating clothes product',
    });
  }
};

// @desc    Update a clothes product
// @route   PUT /api/v1/clothes/:id
// @access  Public (should be Admin in production)
export const updateClothes = async (req, res) => {
  try {
    const clothes = await Clothes.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: 'Clothes product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clothes product updated successfully',
      data: clothes,
    });
  } catch (error) {
    console.error('❌ Update clothes error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating clothes product',
    });
  }
};

// @desc    Delete a clothes product
// @route   DELETE /api/v1/clothes/:id
// @access  Public (should be Admin in production)
export const deleteClothes = async (req, res) => {
  try {
    const clothes = await Clothes.findByIdAndDelete(req.params.id);

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: 'Clothes product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clothes product deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete clothes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting clothes product',
    });
  }
};

// @desc    Get clothes by category (Dog or Cat)
// @route   GET /api/v1/clothes/category/:category
// @access  Public
export const getClothesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!['Dog', 'Cat'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be either "Dog" or "Cat"',
      });
    }

    const clothes = await Clothes.find({ category }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clothes.length,
      data: clothes,
    });
  } catch (error) {
    console.error('❌ Get clothes by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching clothes by category',
    });
  }
};

// @desc    Seed sample clothes products
// @route   POST /api/v1/clothes/seed
// @access  Public (should be Admin only)
export const seedClothes = async (req, res) => {
  try {
    await Clothes.deleteMany({});

    const sampleClothes = [
      {
        productName: 'Classic Striped Dog T-Shirt',
        brand: 'PawFashion',
        category: 'Dog',
        subCategory: 'Clothing',
        sizes: [
          { size: 'S', mrp: 499, discountedPrice: 399, availableStock: 30 },
          { size: 'M', mrp: 549, discountedPrice: 449, availableStock: 25 },
          { size: 'L', mrp: 599, discountedPrice: 499, availableStock: 20 },
        ],
        material: 'Cotton Blend',
        color: ['Red', 'Blue'],
        productDetails: [
          'Comfortable striped t-shirt for everyday wear',
          'Breathable cotton blend fabric',
          'Easy pull-on design with velcro closure',
        ],
        keyFeatures: [
          'Soft & breathable',
          'Easy to wear',
          'Machine washable',
          'Stretchable fabric',
        ],
        careInstructions: ['Machine wash cold', 'Tumble dry low', 'Do not bleach'],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
        expectedDeliveryDays: 4,
      },
      {
        productName: 'Winter Hoodie for Dogs',
        brand: 'PawFashion',
        category: 'Dog',
        subCategory: 'Winter Wear',
        sizes: [
          { size: 'M', mrp: 899, discountedPrice: 749, availableStock: 15 },
          { size: 'L', mrp: 999, discountedPrice: 849, availableStock: 12 },
          { size: 'XL', mrp: 1099, discountedPrice: 949, availableStock: 10 },
        ],
        material: 'Fleece',
        color: ['Grey', 'Black'],
        productDetails: [
          'Warm and cozy hoodie for cold days',
          'Soft fleece lining for extra comfort',
          'Hood with drawstring for a snug fit',
        ],
        keyFeatures: [
          'Warm fleece lining',
          'Adjustable hood',
          'Leash hole on back',
          'Easy zip closure',
        ],
        careInstructions: ['Hand wash recommended', 'Air dry'],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
        expectedDeliveryDays: 5,
      },
      {
        productName: 'Cat Princess Dress',
        brand: 'MeowStyle',
        category: 'Cat',
        subCategory: 'Dresses',
        sizes: [
          { size: 'XS', mrp: 699, discountedPrice: 599, availableStock: 20 },
          { size: 'S', mrp: 749, discountedPrice: 649, availableStock: 18 },
          { size: 'M', mrp: 799, discountedPrice: 699, availableStock: 15 },
        ],
        material: 'Tulle & Cotton',
        color: ['Pink', 'White'],
        productDetails: [
          'Adorable princess-style dress for cats',
          'Tulle skirt with cotton bodice',
          'Perfect for parties and photo shoots',
        ],
        keyFeatures: [
          'Cute tulle skirt',
          'Comfortable fit',
          'Adjustable straps',
          'Lightweight',
        ],
        careInstructions: ['Hand wash only', 'Do not wring', 'Lay flat to dry'],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        isReturnable: true,
        expectedDeliveryDays: 3,
      },
      {
        productName: 'Dog Raincoat with Reflective Strips',
        brand: 'PawFashion',
        category: 'Dog',
        subCategory: 'Rain Wear',
        sizes: [
          { size: 'M', mrp: 799, discountedPrice: 649, availableStock: 20 },
          { size: 'L', mrp: 899, discountedPrice: 749, availableStock: 18 },
          { size: 'XL', mrp: 999, discountedPrice: 849, availableStock: 12 },
        ],
        material: 'Waterproof Nylon',
        color: ['Yellow', 'Green'],
        productDetails: [
          'Fully waterproof raincoat for dogs',
          'Reflective strips for night visibility',
          'Adjustable belly strap for secure fit',
        ],
        keyFeatures: [
          '100% waterproof',
          'Reflective strips',
          'Adjustable fit',
          'Lightweight & packable',
        ],
        careInstructions: ['Wipe clean with damp cloth', 'Air dry'],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
        expectedDeliveryDays: 4,
      },
    ];

    const createdClothes = await Clothes.insertMany(sampleClothes);

    res.status(201).json({
      success: true,
      message: `${createdClothes.length} clothes products seeded successfully`,
      count: createdClothes.length,
      data: createdClothes,
    });
  } catch (error) {
    console.error('❌ Seed clothes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding clothes products',
    });
  }
};
