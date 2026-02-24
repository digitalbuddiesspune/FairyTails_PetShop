import Accessory from '../models/Accessory.js';

// @desc    Get all accessories (with optional filters)
// @route   GET /api/v1/accessories
// @access  Public
export const getAllAccessories = async (req, res) => {
  try {
    const { subCategory, brand, material, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (subCategory) filter.subCategory = subCategory.toLowerCase();
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (material) filter.material = { $regex: material, $options: 'i' };

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { discountPrice: 1 };
    if (sort === 'price-high') sortObj = { discountPrice: -1 };
    if (sort === 'name-asc') sortObj = { productName: 1 };
    if (sort === 'name-desc') sortObj = { productName: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [accessories, total] = await Promise.all([
      Accessory.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Accessory.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: accessories.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: accessories,
    });
  } catch (error) {
    console.error('❌ Get all accessories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching accessories',
    });
  }
};

// @desc    Get single accessory by ID
// @route   GET /api/v1/accessories/:id
// @access  Public
export const getAccessoryById = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: accessory,
    });
  } catch (error) {
    console.error('❌ Get accessory by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching accessory',
    });
  }
};

// @desc    Create a new accessory
// @route   POST /api/v1/accessories
// @access  Public (should be Admin in production)
export const createAccessory = async (req, res) => {
  try {
    const {
      category, subCategory, productName, mrp, discountPrice,
      discountType, availableStock, baseUnit, taxes, images,
      // Optional fields
      brand, material, color, productDetails, keyFeatures,
      isReturnable,
    } = req.body;

    // Basic validation - only required fields (baseUnit and taxes have defaults in schema)
    if (!productName || !subCategory || 
        mrp === undefined || mrp === null || mrp === '' ||
        discountPrice === undefined || discountPrice === null || discountPrice === '' ||
        !discountType || 
        availableStock === undefined || availableStock === null || availableStock === '' ||
        !images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: productName, subCategory, mrp, discountPrice, discountType, availableStock, and at least one image',
      });
    }

    const accessory = await Accessory.create({
      category, subCategory, productName, mrp, discountPrice,
      discountType, availableStock, baseUnit, taxes, images,
      // Optional fields
      brand, material, color, productDetails, keyFeatures,
      isReturnable,
    });

    res.status(201).json({
      success: true,
      message: 'Accessory created successfully',
      data: accessory,
    });
  } catch (error) {
    console.error('❌ Create accessory error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating accessory',
    });
  }
};

// @desc    Update an accessory
// @route   PUT /api/v1/accessories/:id
// @access  Public (should be Admin in production)
export const updateAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Accessory updated successfully',
      data: accessory,
    });
  } catch (error) {
    console.error('❌ Update accessory error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating accessory',
    });
  }
};

// @desc    Delete an accessory
// @route   DELETE /api/v1/accessories/:id
// @access  Public (should be Admin in production)
export const deleteAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findByIdAndDelete(req.params.id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Accessory deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete accessory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting accessory',
    });
  }
};

// @desc    Get accessories by subCategory (dog or cat)
// @route   GET /api/v1/accessories/subcategory/:subCategory
// @access  Public
export const getAccessoriesBySubCategory = async (req, res) => {
  try {
    const { subCategory } = req.params;
    const sub = subCategory.toLowerCase();

    if (!['dog', 'cat'].includes(sub)) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory must be either "dog" or "cat"',
      });
    }

    const accessories = await Accessory.find({ subCategory: sub }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: accessories.length,
      data: accessories,
    });
  } catch (error) {
    console.error('❌ Get accessories by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching accessories by subcategory',
    });
  }
};

// @desc    Seed sample accessories
// @route   POST /api/v1/accessories/seed
// @access  Public (should be Admin only)
export const seedAccessories = async (req, res) => {
  try {
    await Accessory.deleteMany({});

    const sampleAccessories = [
      {
        category: 'accessories',
        subCategory: 'dog',
        productName: 'Adjustable Nylon Dog Collar',
        brand: 'PawGear',
        sizes: [
          { size: 'S', mrp: 399, discountedPrice: 329, availableStock: 40 },
          { size: 'M', mrp: 449, discountedPrice: 369, availableStock: 35 },
          { size: 'L', mrp: 499, discountedPrice: 419, availableStock: 30 },
        ],
        material: 'Nylon',
        color: ['Red', 'Blue', 'Black'],
        productDetails: [
          'Durable nylon collar with quick-release buckle',
          'Reflective stitching for night visibility',
          'Adjustable for a perfect fit',
        ],
        keyFeatures: [
          'Quick-release buckle',
          'Reflective stitching',
          'Lightweight & durable',
          'D-ring for leash attachment',
        ],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
      },
      {
        category: 'accessories',
        subCategory: 'dog',
        productName: 'Retractable Dog Leash - 5m',
        brand: 'PawGear',
        sizes: [
          { size: 'One Size', mrp: 799, discountedPrice: 649, availableStock: 25 },
        ],
        material: 'ABS Plastic + Nylon Cord',
        color: ['Black', 'Grey'],
        productDetails: [
          '5-metre retractable leash with one-button lock',
          'Ergonomic grip handle',
          'Suitable for dogs up to 25kg',
        ],
        keyFeatures: [
          '5m retractable cord',
          'One-button brake & lock',
          'Ergonomic handle',
          'Tangle-free design',
        ],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
      },
      {
        category: 'accessories',
        subCategory: 'dog',
        productName: 'Stainless Steel Dog Bowl Set',
        brand: 'PetEssentials',
        sizes: [
          { size: 'M', mrp: 599, discountedPrice: 499, availableStock: 50 },
          { size: 'L', mrp: 799, discountedPrice: 649, availableStock: 30 },
        ],
        material: 'Stainless Steel',
        color: ['Silver'],
        productDetails: [
          'Set of 2 stainless steel bowls with non-slip rubber base',
          'Dishwasher safe and rust-resistant',
          'Perfect for food and water',
        ],
        keyFeatures: [
          'Non-slip rubber base',
          'Rust-resistant',
          'Dishwasher safe',
          'Set of 2 bowls',
        ],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
      },
      {
        category: 'accessories',
        subCategory: 'cat',
        productName: 'Breakaway Cat Collar with Bell',
        brand: 'MeowGear',
        sizes: [
          { size: 'XS', mrp: 249, discountedPrice: 199, availableStock: 50 },
          { size: 'S', mrp: 299, discountedPrice: 249, availableStock: 45 },
        ],
        material: 'Nylon + Metal Bell',
        color: ['Pink', 'Blue', 'Green'],
        productDetails: [
          'Safety breakaway buckle releases under pressure',
          'Lightweight bell to track your cat',
          'Soft nylon with adjustable fit',
        ],
        keyFeatures: [
          'Breakaway safety buckle',
          'Lightweight bell',
          'Adjustable fit',
          'Colourful designs',
        ],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        isReturnable: true,
      },
      {
        category: 'accessories',
        subCategory: 'cat',
        productName: 'Ceramic Cat Food & Water Bowl Set',
        brand: 'MeowGear',
        sizes: [
          { size: 'One Size', mrp: 699, discountedPrice: 549, availableStock: 30 },
        ],
        material: 'Ceramic',
        color: ['White', 'Pastel Blue'],
        productDetails: [
          'Set of 2 elevated ceramic bowls',
          'Tilted design reduces neck strain',
          'Non-slip silicone base',
        ],
        keyFeatures: [
          'Elevated tilted design',
          'Reduces neck strain',
          'Easy to clean',
          'Non-slip base',
        ],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        isReturnable: true,
      },
      {
        category: 'accessories',
        subCategory: 'cat',
        productName: 'Cat Harness & Leash Set',
        brand: 'MeowGear',
        sizes: [
          { size: 'S', mrp: 599, discountedPrice: 499, availableStock: 20 },
          { size: 'M', mrp: 649, discountedPrice: 549, availableStock: 18 },
        ],
        material: 'Breathable Mesh',
        color: ['Black', 'Orange'],
        productDetails: [
          'Escape-proof vest-style harness with 1.2m leash',
          'Breathable mesh for comfort',
          'Adjustable chest & belly straps',
        ],
        keyFeatures: [
          'Escape-proof design',
          'Breathable mesh',
          'Adjustable straps',
          'Includes 1.2m leash',
        ],
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        isReturnable: true,
      },
    ];

    const created = await Accessory.insertMany(sampleAccessories);

    res.status(201).json({
      success: true,
      message: `${created.length} accessories seeded successfully`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    console.error('❌ Seed accessories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding accessories',
    });
  }
};
