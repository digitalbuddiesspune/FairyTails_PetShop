import HealthSupplement from '../models/HealthSupplement.js';

// @desc    Get all health supplements (with optional filters)
// @route   GET /api/v1/health-supplements
// @access  Public
export const getAllHealthSupplements = async (req, res) => {
  try {
    const { subCategory, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (subCategory) filter.subCategory = subCategory.toLowerCase(); // "dog" or "cat"

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { discountPrice: 1 };
    if (sort === 'price-high') sortObj = { discountPrice: -1 };
    if (sort === 'name-asc') sortObj = { productName: 1 };
    if (sort === 'name-desc') sortObj = { productName: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [supplements, total] = await Promise.all([
      HealthSupplement.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      HealthSupplement.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: supplements.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: supplements,
    });
  } catch (error) {
    console.error('❌ Get all health supplements error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching health supplements',
    });
  }
};

// @desc    Get single health supplement by ID
// @route   GET /api/v1/health-supplements/:id
// @access  Public
export const getHealthSupplementById = async (req, res) => {
  try {
    const supplement = await HealthSupplement.findById(req.params.id);

    if (!supplement) {
      return res.status(404).json({
        success: false,
        message: 'Health supplement not found',
      });
    }

    res.status(200).json({
      success: true,
      data: supplement,
    });
  } catch (error) {
    console.error('❌ Get health supplement by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching health supplement',
    });
  }
};

// @desc    Create a new health supplement
// @route   POST /api/v1/health-supplements
// @access  Public (should be Admin in production)
export const createHealthSupplement = async (req, res) => {
  try {
    const {
      category, subCategory, productName, mrp, discountPrice,
      discountType, availableStock, expiryDate, baseUnit, taxes, images,
      // Optional fields
      itemCode, hsn, size, description, highlights, usage,
    } = req.body;

    // Basic validation - only required fields (baseUnit and taxes have defaults in schema)
    if (!productName || !subCategory || 
        mrp === undefined || mrp === null || mrp === '' ||
        discountPrice === undefined || discountPrice === null || discountPrice === '' ||
        !discountType || 
        availableStock === undefined || availableStock === null || availableStock === '' ||
        !expiryDate ||
        !images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: productName, subCategory, mrp, discountPrice, discountType, availableStock, expiryDate, and at least one image',
      });
    }

    const supplement = await HealthSupplement.create({
      category, subCategory, productName, mrp, discountPrice,
      discountType, availableStock, expiryDate, baseUnit, taxes, images,
      // Optional fields
      itemCode, hsn, size, description, highlights, usage,
    });

    res.status(201).json({
      success: true,
      message: 'Health supplement created successfully',
      data: supplement,
    });
  } catch (error) {
    console.error('❌ Create health supplement error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating health supplement',
    });
  }
};

// @desc    Update a health supplement
// @route   PUT /api/v1/health-supplements/:id
// @access  Public (should be Admin in production)
export const updateHealthSupplement = async (req, res) => {
  try {
    const supplement = await HealthSupplement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supplement) {
      return res.status(404).json({
        success: false,
        message: 'Health supplement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Health supplement updated successfully',
      data: supplement,
    });
  } catch (error) {
    console.error('❌ Update health supplement error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating health supplement',
    });
  }
};

// @desc    Delete a health supplement
// @route   DELETE /api/v1/health-supplements/:id
// @access  Public (should be Admin in production)
export const deleteHealthSupplement = async (req, res) => {
  try {
    const supplement = await HealthSupplement.findByIdAndDelete(req.params.id);

    if (!supplement) {
      return res.status(404).json({
        success: false,
        message: 'Health supplement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Health supplement deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete health supplement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting health supplement',
    });
  }
};

// @desc    Get health supplements by subCategory (dog or cat)
// @route   GET /api/v1/health-supplements/subcategory/:subCategory
// @access  Public
export const getHealthSupplementsBySubCategory = async (req, res) => {
  try {
    const { subCategory } = req.params;
    const sub = subCategory.toLowerCase();

    if (!['dog', 'cat'].includes(sub)) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory must be either "dog" or "cat"',
      });
    }

    const supplements = await HealthSupplement.find({ subCategory: sub }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: supplements.length,
      data: supplements,
    });
  } catch (error) {
    console.error('❌ Get health supplements by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching health supplements by subcategory',
    });
  }
};

// @desc    Seed sample health supplements
// @route   POST /api/v1/health-supplements/seed
// @access  Public (should be Admin only)
export const seedHealthSupplements = async (req, res) => {
  try {
    await HealthSupplement.deleteMany({});

    const sampleSupplements = [
      {
        category: 'health-supplement',
        subCategory: 'dog',
        name: 'Joint Care Supplement for Dogs',
        price: 899,
        discountPrice: 749,
        discountPercentage: 17,
        highlights: [
          'Glucosamine & Chondroitin formula',
          'Supports hip & joint health',
          'Improves mobility in senior dogs',
          'Chicken flavoured chewable tablets',
        ],
        description: 'Advanced joint care supplement with Glucosamine, Chondroitin, and MSM to support healthy cartilage and improve mobility in dogs of all ages.',
        usage: {
          dosage: '1 tablet daily for dogs up to 15kg, 2 tablets for dogs over 15kg',
          ageGroup: 'Adult & Senior Dogs',
        },
        expiryDate: new Date('2027-12-15'),
        availableStock: 40,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
      },
      {
        category: 'health-supplement',
        subCategory: 'dog',
        name: 'Omega 3-6-9 Skin & Coat Supplement',
        price: 699,
        discountPrice: 599,
        discountPercentage: 14,
        highlights: [
          'Fish oil based Omega 3-6-9',
          'Promotes shiny coat & healthy skin',
          'Reduces itching and shedding',
          'Soft gel capsules',
        ],
        description: 'Premium fish oil supplement rich in Omega 3, 6, and 9 fatty acids for healthy skin, shiny coat, and reduced shedding in dogs.',
        usage: {
          dosage: '1 capsule per 10kg body weight daily',
          ageGroup: 'All Ages',
        },
        expiryDate: new Date('2027-09-20'),
        availableStock: 55,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
      },
      {
        category: 'health-supplement',
        subCategory: 'dog',
        name: 'Multivitamin Chews for Puppies',
        price: 549,
        discountPrice: 449,
        discountPercentage: 18,
        highlights: [
          'Essential vitamins A, D, E & B complex',
          'Supports growth & development',
          'Boosts immune system',
          'Tasty chicken flavour',
        ],
        description: 'Complete multivitamin supplement specially formulated for growing puppies with essential vitamins and minerals for strong bones, healthy growth, and immune support.',
        usage: {
          dosage: '1 chew daily for puppies 2–12 months',
          ageGroup: 'Puppies (2–12 months)',
        },
        expiryDate: new Date('2027-11-30'),
        availableStock: 60,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
      },
      {
        category: 'health-supplement',
        subCategory: 'cat',
        name: 'Hairball Control Supplement for Cats',
        price: 599,
        discountPrice: 499,
        discountPercentage: 17,
        highlights: [
          'Natural fibre blend formula',
          'Reduces hairball formation',
          'Supports healthy digestion',
          'Malt flavoured paste',
        ],
        description: 'Specially formulated hairball control supplement with natural fibres and malt extract to help cats pass hairballs easily and support digestive health.',
        usage: {
          dosage: '2–3 cm strip daily, mixed with food',
          ageGroup: 'Adult Cats',
        },
        expiryDate: new Date('2027-08-25'),
        availableStock: 45,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
      },
      {
        category: 'health-supplement',
        subCategory: 'cat',
        name: 'Lysine Immune Support for Cats',
        price: 799,
        discountPrice: 649,
        discountPercentage: 19,
        highlights: [
          'L-Lysine amino acid supplement',
          'Boosts immune function',
          'Supports respiratory health',
          'Powder form — easy to mix with food',
        ],
        description: 'L-Lysine supplement to support immune system health and respiratory function in cats. Easy-to-use powder form that mixes seamlessly into wet or dry food.',
        usage: {
          dosage: '1/2 scoop daily for kittens, 1 scoop for adults',
          ageGroup: 'All Ages',
        },
        expiryDate: new Date('2027-10-10'),
        availableStock: 35,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
      },
      {
        category: 'health-supplement',
        subCategory: 'cat',
        name: 'Taurine & Heart Health Supplement',
        price: 749,
        discountPrice: 629,
        discountPercentage: 16,
        highlights: [
          'Essential Taurine for heart health',
          'Supports vision & brain function',
          'Chewable tablet form',
          'Tuna flavoured',
        ],
        description: 'Taurine supplement essential for feline heart health, vision, and brain function. Tuna-flavoured chewable tablets that cats love.',
        usage: {
          dosage: '1 tablet daily',
          ageGroup: 'Adult & Senior Cats',
        },
        expiryDate: new Date('2027-07-15'),
        availableStock: 30,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
      },
    ];

    const created = await HealthSupplement.insertMany(sampleSupplements);

    res.status(201).json({
      success: true,
      message: `${created.length} health supplements seeded successfully`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    console.error('❌ Seed health supplements error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding health supplements',
    });
  }
};
