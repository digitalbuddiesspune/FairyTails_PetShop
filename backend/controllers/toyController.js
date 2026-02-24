import Toy from '../models/Toy.js';

// @desc    Get all toys (with optional filters)
// @route   GET /api/v1/toys
// @access  Public
export const getAllToys = async (req, res) => {
  try {
    const { subCategory, brand, material, suitableFor, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (subCategory) filter.subCategory = subCategory; // "Dog" or "Cat"
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (material) filter.material = { $regex: material, $options: 'i' };
    if (suitableFor) filter.suitableFor = suitableFor;

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { discountPrice: 1 };
    if (sort === 'price-high') sortObj = { discountPrice: -1 };
    if (sort === 'name-asc') sortObj = { productName: 1 };
    if (sort === 'name-desc') sortObj = { productName: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [toys, total] = await Promise.all([
      Toy.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Toy.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: toys.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: toys,
    });
  } catch (error) {
    console.error('❌ Get all toys error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching toys',
    });
  }
};

// @desc    Get single toy by ID
// @route   GET /api/v1/toys/:id
// @access  Public
export const getToyById = async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.id);

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found',
      });
    }

    res.status(200).json({
      success: true,
      data: toy,
    });
  } catch (error) {
    console.error('❌ Get toy by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching toy',
    });
  }
};

// @desc    Create a new toy
// @route   POST /api/v1/toys
// @access  Public (should be Admin in production)
export const createToy = async (req, res) => {
  try {
    const {
      category, subCategory, productName, mrp, discountPrice,
      discountType, availableStock, baseUnit, taxes, images,
      // Optional fields
      itemCode, hsn, brand, size, material, color,
      productDetails, keyFeatures, suitableFor, isReturnable,
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

    const toy = await Toy.create({
      category, subCategory, productName, mrp, discountPrice,
      discountType, availableStock, baseUnit, taxes, images,
      // Optional fields
      itemCode, hsn, brand, size, material, color,
      productDetails, keyFeatures, suitableFor, isReturnable,
    });

    res.status(201).json({
      success: true,
      message: 'Toy created successfully',
      data: toy,
    });
  } catch (error) {
    console.error('❌ Create toy error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating toy',
    });
  }
};

// @desc    Update a toy
// @route   PUT /api/v1/toys/:id
// @access  Public (should be Admin in production)
export const updateToy = async (req, res) => {
  try {
    const toy = await Toy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toy updated successfully',
      data: toy,
    });
  } catch (error) {
    console.error('❌ Update toy error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating toy',
    });
  }
};

// @desc    Delete a toy
// @route   DELETE /api/v1/toys/:id
// @access  Public (should be Admin in production)
export const deleteToy = async (req, res) => {
  try {
    const toy = await Toy.findByIdAndDelete(req.params.id);

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toy deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete toy error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting toy',
    });
  }
};

// @desc    Get toys by subCategory (Dog or Cat)
// @route   GET /api/v1/toys/subcategory/:subCategory
// @access  Public
export const getToysBySubCategory = async (req, res) => {
  try {
    const { subCategory } = req.params;

    if (!['Dog', 'Cat'].includes(subCategory)) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory must be either "Dog" or "Cat"',
      });
    }

    const toys = await Toy.find({ subCategory }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: toys.length,
      data: toys,
    });
  } catch (error) {
    console.error('❌ Get toys by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching toys by subcategory',
    });
  }
};

// @desc    Seed sample toys
// @route   POST /api/v1/toys/seed
// @access  Public (should be Admin only)
export const seedToys = async (req, res) => {
  try {
    await Toy.deleteMany({});

    const sampleToys = [
      {
        productName: 'Squeaky Bone Chew Toy',
        brand: 'PawPlay',
        category: 'Toy',
        subCategory: 'Dog',
        price: 349,
        discountedPrice: 299,
        discountPercentage: 14,
        size: 'One Size',
        availableStock: 50,
        material: 'Natural Rubber',
        color: ['Yellow', 'Red'],
        productDetails: [
          'Durable squeaky bone toy for dogs',
          'Made from non-toxic natural rubber',
          'Helps clean teeth while playing',
        ],
        keyFeatures: [
          'Built-in squeaker',
          'Non-toxic material',
          'Dental cleaning ridges',
          'Floats in water',
        ],
        suitableFor: 'All',
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
      },
      {
        productName: 'Rope Tug Toy - Large',
        brand: 'PawPlay',
        category: 'Toy',
        subCategory: 'Dog',
        price: 249,
        discountedPrice: 199,
        discountPercentage: 20,
        size: 'Large',
        availableStock: 40,
        material: 'Cotton Rope',
        color: ['Multicolor'],
        productDetails: [
          'Strong cotton rope tug toy for interactive play',
          'Great for tug-of-war and fetch',
          'Helps maintain dental health',
        ],
        keyFeatures: [
          'Durable cotton rope',
          'Cleans teeth naturally',
          'Perfect for tug-of-war',
          'Machine washable',
        ],
        suitableFor: 'Adult',
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
      },
      {
        productName: 'Interactive Feather Wand',
        brand: 'MeowFun',
        category: 'Toy',
        subCategory: 'Cat',
        price: 199,
        discountedPrice: 149,
        discountPercentage: 25,
        size: 'One Size',
        availableStock: 60,
        material: 'Flexible Rod + Natural Feathers',
        color: ['Purple', 'Pink'],
        productDetails: [
          'Interactive feather wand toy to stimulate hunting instincts',
          'Flexible rod with colourful feathers',
          'Encourages exercise and play',
        ],
        keyFeatures: [
          'Natural feather attachments',
          'Flexible & durable rod',
          'Stimulates hunting instincts',
          'Reduces boredom',
        ],
        suitableFor: 'All',
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        isReturnable: true,
      },
      {
        productName: 'Catnip Mouse Toy - 3 Pack',
        brand: 'MeowFun',
        category: 'Toy',
        subCategory: 'Cat',
        price: 299,
        discountedPrice: 249,
        discountPercentage: 17,
        size: 'One Size',
        availableStock: 45,
        material: 'Plush + Catnip',
        color: ['Grey', 'Brown', 'White'],
        productDetails: [
          'Set of 3 plush mouse toys filled with premium catnip',
          'Realistic design to trigger play instincts',
          'Soft and lightweight for easy batting',
        ],
        keyFeatures: [
          'Premium catnip filling',
          'Pack of 3 mice',
          'Soft plush material',
          'Encourages active play',
        ],
        suitableFor: 'All',
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        isReturnable: true,
      },
      {
        productName: 'Puppy Teething Ring',
        brand: 'PawPlay',
        category: 'Toy',
        subCategory: 'Dog',
        price: 199,
        discountedPrice: 159,
        discountPercentage: 20,
        size: 'Small',
        availableStock: 35,
        material: 'Soft TPR Rubber',
        color: ['Blue', 'Green'],
        productDetails: [
          'Gentle teething ring designed for puppies',
          'Soft textured surface soothes sore gums',
          'Can be frozen for extra cooling relief',
        ],
        keyFeatures: [
          'Freezable for relief',
          'Soft on puppy gums',
          'Non-toxic TPR rubber',
          'Easy to grip',
        ],
        suitableFor: 'Puppy',
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
        ],
        isReturnable: true,
      },
      {
        productName: 'Laser Pointer Cat Toy',
        brand: 'MeowFun',
        category: 'Toy',
        subCategory: 'Cat',
        price: 149,
        discountedPrice: 99,
        discountPercentage: 34,
        size: 'One Size',
        availableStock: 70,
        material: 'ABS Plastic',
        color: ['Silver'],
        productDetails: [
          'LED laser pointer with multiple patterns',
          'Provides hours of chasing fun for cats',
          'Compact and portable design',
        ],
        keyFeatures: [
          'Multiple laser patterns',
          'Battery operated',
          'Compact & portable',
          'Great for indoor play',
        ],
        suitableFor: 'All',
        images: [
          'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
        ],
        isReturnable: true,
      },
    ];

    const createdToys = await Toy.insertMany(sampleToys);

    res.status(201).json({
      success: true,
      message: `${createdToys.length} toys seeded successfully`,
      count: createdToys.length,
      data: createdToys,
    });
  } catch (error) {
    console.error('❌ Seed toys error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding toys',
    });
  }
};
