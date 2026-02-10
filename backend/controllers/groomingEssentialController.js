import GroomingEssential from '../models/GroomingEssential.js';

// @desc    Get all grooming essentials (with optional filters)
// @route   GET /api/v1/grooming-essentials
// @access  Public
export const getAllGroomingEssentials = async (req, res) => {
  try {
    const { subCategory, brand, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (subCategory) filter.subCategory = subCategory.toLowerCase();
    if (brand) filter.brand = { $regex: brand, $options: 'i' };

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { 'variants.0.discountedPrice': 1 };
    if (sort === 'price-high') sortObj = { 'variants.0.discountedPrice': -1 };
    if (sort === 'name-asc') sortObj = { productName: 1 };
    if (sort === 'name-desc') sortObj = { productName: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      GroomingEssential.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      GroomingEssential.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: products,
    });
  } catch (error) {
    console.error('❌ Get all grooming essentials error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching grooming essentials',
    });
  }
};

// @desc    Get single grooming essential by ID
// @route   GET /api/v1/grooming-essentials/:id
// @access  Public
export const getGroomingEssentialById = async (req, res) => {
  try {
    const product = await GroomingEssential.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Grooming essential not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('❌ Get grooming essential by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching grooming essential',
    });
  }
};

// @desc    Create a new grooming essential
// @route   POST /api/v1/grooming-essentials
// @access  Public (should be Admin in production)
export const createGroomingEssential = async (req, res) => {
  try {
    const {
      category, subCategory, productName, brand, variants,
      description, keyFeatures, suitableFor, usageInstructions,
      images, isReturnable,
    } = req.body;

    if (!productName || !brand || !subCategory) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productName, brand, and subCategory',
      });
    }

    const product = await GroomingEssential.create({
      category, subCategory, productName, brand, variants,
      description, keyFeatures, suitableFor, usageInstructions,
      images, isReturnable,
    });

    res.status(201).json({
      success: true,
      message: 'Grooming essential created successfully',
      data: product,
    });
  } catch (error) {
    console.error('❌ Create grooming essential error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating grooming essential',
    });
  }
};

// @desc    Update a grooming essential
// @route   PUT /api/v1/grooming-essentials/:id
// @access  Public (should be Admin in production)
export const updateGroomingEssential = async (req, res) => {
  try {
    const product = await GroomingEssential.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Grooming essential not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Grooming essential updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('❌ Update grooming essential error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating grooming essential',
    });
  }
};

// @desc    Delete a grooming essential
// @route   DELETE /api/v1/grooming-essentials/:id
// @access  Public (should be Admin in production)
export const deleteGroomingEssential = async (req, res) => {
  try {
    const product = await GroomingEssential.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Grooming essential not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Grooming essential deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete grooming essential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting grooming essential',
    });
  }
};

// @desc    Get grooming essentials by subCategory (dog or cat)
// @route   GET /api/v1/grooming-essentials/subcategory/:subCategory
// @access  Public
export const getGroomingEssentialsBySubCategory = async (req, res) => {
  try {
    const { subCategory } = req.params;
    const sub = subCategory.toLowerCase();

    if (!['dog', 'cat'].includes(sub)) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory must be either "dog" or "cat"',
      });
    }

    const products = await GroomingEssential.find({ subCategory: sub }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('❌ Get grooming essentials by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching grooming essentials by subcategory',
    });
  }
};

// @desc    Seed sample grooming essentials
// @route   POST /api/v1/grooming-essentials/seed
// @access  Public (should be Admin only)
export const seedGroomingEssentials = async (req, res) => {
  try {
    await GroomingEssential.deleteMany({});

    const sampleProducts = [
      {
        category: 'grooming-essentials',
        subCategory: 'dog',
        productName: 'Oatmeal & Aloe Dog Shampoo',
        brand: 'PawSpa',
        variants: [
          { volume: '250ml', mrp: 399, discountedPrice: 329, discountPercentage: 18, availableStock: 50 },
          { volume: '500ml', mrp: 649, discountedPrice: 549, discountPercentage: 15, availableStock: 35 },
        ],
        description: 'Gentle oatmeal and aloe vera shampoo that soothes dry, itchy skin while leaving your dog\'s coat soft and shiny.',
        keyFeatures: [
          'Natural oatmeal & aloe formula',
          'Soothes dry & itchy skin',
          'Paraben & sulphate free',
          'Pleasant lavender scent',
        ],
        suitableFor: 'Dogs',
        usageInstructions: ['Wet coat thoroughly', 'Apply shampoo and lather well', 'Leave for 2–3 minutes', 'Rinse completely'],
        images: ['https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg'],
        isReturnable: true,
      },
      {
        category: 'grooming-essentials',
        subCategory: 'dog',
        productName: 'De-shedding Slicker Brush',
        brand: 'PawSpa',
        variants: [
          { volume: 'Standard', mrp: 499, discountedPrice: 399, discountPercentage: 20, availableStock: 40 },
        ],
        description: 'Professional-grade slicker brush that removes loose fur, tangles, and mats while stimulating natural oils for a healthy coat.',
        keyFeatures: [
          'Fine bent wire bristles',
          'Reduces shedding up to 90%',
          'Comfort-grip handle',
          'Suitable for all coat types',
        ],
        suitableFor: 'Dogs',
        usageInstructions: ['Brush in the direction of hair growth', 'Use gentle strokes', 'Brush 2–3 times per week'],
        images: ['https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg'],
        isReturnable: true,
      },
      {
        category: 'grooming-essentials',
        subCategory: 'dog',
        productName: 'Paw & Nose Balm',
        brand: 'PawSpa',
        variants: [
          { volume: '50g', mrp: 349, discountedPrice: 279, discountPercentage: 20, availableStock: 45 },
        ],
        description: 'All-natural beeswax and shea butter balm that moisturises and protects cracked paws and dry noses.',
        keyFeatures: [
          'Beeswax & shea butter',
          '100% natural ingredients',
          'Heals cracked paws',
          'Safe if licked',
        ],
        suitableFor: 'Dogs',
        usageInstructions: ['Apply a thin layer to paws or nose', 'Gently massage in', 'Use daily or as needed'],
        images: ['https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg'],
        isReturnable: true,
      },
      {
        category: 'grooming-essentials',
        subCategory: 'cat',
        productName: 'Waterless Cat Shampoo Foam',
        brand: 'MeowClean',
        variants: [
          { volume: '200ml', mrp: 449, discountedPrice: 369, discountPercentage: 18, availableStock: 40 },
        ],
        description: 'No-rinse foaming shampoo for cats who dislike water. Cleans, deodorises, and conditions the coat without the stress of bathing.',
        keyFeatures: [
          'No water or rinsing needed',
          'Gentle plant-based formula',
          'Deodorises & conditions',
          'Stress-free grooming',
        ],
        suitableFor: 'Cats',
        usageInstructions: ['Shake well', 'Dispense foam onto coat', 'Massage in thoroughly', 'Towel dry'],
        images: ['https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg'],
        isReturnable: true,
      },
      {
        category: 'grooming-essentials',
        subCategory: 'cat',
        productName: 'Cat Nail Clipper with Safety Guard',
        brand: 'MeowClean',
        variants: [
          { volume: 'Standard', mrp: 299, discountedPrice: 249, discountPercentage: 17, availableStock: 55 },
        ],
        description: 'Precision stainless-steel nail clipper with a built-in safety guard to prevent over-cutting. Ergonomic non-slip handles.',
        keyFeatures: [
          'Safety guard prevents over-cutting',
          'Sharp stainless-steel blades',
          'Non-slip ergonomic handles',
          'Suitable for all cat breeds',
        ],
        suitableFor: 'Cats',
        usageInstructions: ['Hold paw gently', 'Clip only the tip of the nail', 'Avoid the quick (pink area)', 'Reward with a treat'],
        images: ['https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg'],
        isReturnable: true,
      },
      {
        category: 'grooming-essentials',
        subCategory: 'cat',
        productName: 'Ear Cleaning Solution for Cats',
        brand: 'MeowClean',
        variants: [
          { volume: '100ml', mrp: 349, discountedPrice: 289, discountPercentage: 17, availableStock: 35 },
        ],
        description: 'Gentle ear cleaning solution that dissolves wax build-up and prevents ear infections in cats. Non-irritating, vet-recommended formula.',
        keyFeatures: [
          'Dissolves ear wax',
          'Prevents infections',
          'Non-irritating formula',
          'Vet recommended',
        ],
        suitableFor: 'Cats',
        usageInstructions: ['Apply 3–5 drops into ear canal', 'Gently massage base of ear', 'Let cat shake head', 'Wipe excess with cotton ball'],
        images: ['https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg'],
        isReturnable: true,
      },
    ];

    const created = await GroomingEssential.insertMany(sampleProducts);

    res.status(201).json({
      success: true,
      message: `${created.length} grooming essentials seeded successfully`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    console.error('❌ Seed grooming essentials error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding grooming essentials',
    });
  }
};
