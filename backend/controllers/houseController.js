import House from '../models/House.js';

// @desc    Get all houses (with optional filters)
// @route   GET /api/v1/houses
// @access  Public
export const getAllHouses = async (req, res) => {
  try {
    const { subCategory, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (subCategory) filter.subCategory = subCategory.toLowerCase();

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { discountPrice: 1, price: 1 };
    if (sort === 'price-high') sortObj = { discountPrice: -1, price: -1 };
    if (sort === 'name-asc') sortObj = { name: 1 };
    if (sort === 'name-desc') sortObj = { name: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [houses, total] = await Promise.all([
      House.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      House.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: houses.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: houses,
    });
  } catch (error) {
    console.error('❌ Get all houses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching houses',
    });
  }
};

// @desc    Get single house by ID
// @route   GET /api/v1/houses/:id
// @access  Public
export const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found',
      });
    }

    res.status(200).json({
      success: true,
      data: house,
    });
  } catch (error) {
    console.error('❌ Get house by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching house',
    });
  }
};

// @desc    Create a new house
// @route   POST /api/v1/houses
// @access  Public (should be Admin in production)
export const createHouse = async (req, res) => {
  try {
    const {
      category, subCategory, name, price, discountPrice,
      discountPercentage, highlights, description, dimensions,
      availableStock, image,
    } = req.body;

    if (!name || !subCategory || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, subCategory, and price',
      });
    }

    const house = await House.create({
      category, subCategory, name, price, discountPrice,
      discountPercentage, highlights, description, dimensions,
      availableStock, image,
    });

    res.status(201).json({
      success: true,
      message: 'House created successfully',
      data: house,
    });
  } catch (error) {
    console.error('❌ Create house error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating house',
    });
  }
};

// @desc    Update a house
// @route   PUT /api/v1/houses/:id
// @access  Public (should be Admin in production)
export const updateHouse = async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'House updated successfully',
      data: house,
    });
  } catch (error) {
    console.error('❌ Update house error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating house',
    });
  }
};

// @desc    Delete a house
// @route   DELETE /api/v1/houses/:id
// @access  Public (should be Admin in production)
export const deleteHouse = async (req, res) => {
  try {
    const house = await House.findByIdAndDelete(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'House deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete house error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting house',
    });
  }
};

// @desc    Get houses by subCategory (dog or cat)
// @route   GET /api/v1/houses/subcategory/:subCategory
// @access  Public
export const getHousesBySubCategory = async (req, res) => {
  try {
    const { subCategory } = req.params;
    const sub = subCategory.toLowerCase();

    if (!['dog', 'cat'].includes(sub)) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory must be either "dog" or "cat"',
      });
    }

    const houses = await House.find({ subCategory: sub }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: houses.length,
      data: houses,
    });
  } catch (error) {
    console.error('❌ Get houses by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching houses by subcategory',
    });
  }
};

// @desc    Seed sample houses
// @route   POST /api/v1/houses/seed
// @access  Public (should be Admin only)
export const seedHouses = async (req, res) => {
  try {
    await House.deleteMany({});

    const sampleHouses = [
      {
        category: 'house',
        subCategory: 'dog',
        name: 'Cozy Wooden Dog House - Medium',
        price: 4999,
        discountPrice: 3999,
        discountPercentage: 20,
        highlights: [
          'Solid pinewood construction',
          'Waterproof asphalt roof',
          'Elevated floor keeps dry',
          'Easy assembly — no tools needed',
        ],
        description: 'A sturdy, weather-resistant wooden dog house with an elevated floor and waterproof roof. Perfect for medium-sized breeds. Easy snap-together assembly.',
        dimensions: { height: '76 cm', width: '71 cm', depth: '68 cm', weight: '12 kg' },
        availableStock: 15,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
      },
      {
        category: 'house',
        subCategory: 'dog',
        name: 'Plush Indoor Dog Bed House',
        price: 2499,
        discountPrice: 1999,
        discountPercentage: 20,
        highlights: [
          'Ultra-soft plush fabric',
          'Enclosed hood for security',
          'Machine-washable cover',
          'Non-slip bottom',
        ],
        description: 'Luxuriously soft indoor bed house with an enclosed hood to give your dog a sense of security. Removable, machine-washable cushion and cover.',
        dimensions: { height: '45 cm', width: '55 cm', depth: '50 cm', weight: '2.5 kg' },
        availableStock: 25,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
      },
      {
        category: 'house',
        subCategory: 'dog',
        name: 'XL Outdoor Dog Kennel',
        price: 7999,
        discountPrice: 6499,
        discountPercentage: 19,
        highlights: [
          'Heavy-duty plastic construction',
          'Ventilation system for airflow',
          'Snap-lock assembly',
          'Suitable for large breeds',
        ],
        description: 'Extra-large outdoor kennel designed for big breeds. Heavy-duty, UV-resistant plastic with built-in ventilation for year-round comfort. Tool-free snap-lock assembly.',
        dimensions: { height: '90 cm', width: '95 cm', depth: '100 cm', weight: '18 kg' },
        availableStock: 8,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
      },
      {
        category: 'house',
        subCategory: 'cat',
        name: 'Multi-Level Cat Tree House',
        price: 3999,
        discountPrice: 3299,
        discountPercentage: 18,
        highlights: [
          '3-level climbing tree with condo',
          'Sisal-wrapped scratching posts',
          'Plush-lined hideaway box',
          'Dangling toy included',
        ],
        description: 'A multi-level cat tree featuring a cozy hideaway condo, sisal scratching posts, and multiple perching platforms. Keeps your cat entertained and active.',
        dimensions: { height: '120 cm', width: '50 cm', depth: '50 cm', weight: '10 kg' },
        availableStock: 12,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
      },
      {
        category: 'house',
        subCategory: 'cat',
        name: 'Felt Cave Cat Bed',
        price: 1499,
        discountPrice: 1199,
        discountPercentage: 20,
        highlights: [
          '100% natural merino wool felt',
          'Cozy cave-shaped design',
          'Breathable & temperature-regulating',
          'Handcrafted',
        ],
        description: 'Handcrafted from 100% natural merino wool felt, this cave-style cat bed provides a warm, snug retreat. Naturally breathable and temperature-regulating.',
        dimensions: { height: '35 cm', width: '45 cm', depth: '45 cm', weight: '0.8 kg' },
        availableStock: 20,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
      },
      {
        category: 'house',
        subCategory: 'cat',
        name: 'Wall-Mounted Cat Shelves Set',
        price: 2999,
        discountPrice: 2499,
        discountPercentage: 17,
        highlights: [
          'Set of 4 wall-mounted shelves',
          'Sturdy bamboo construction',
          'Carpet-lined for grip',
          'Space-saving vertical design',
        ],
        description: 'Set of 4 wall-mounted bamboo shelves that create a vertical playground for your cat. Carpet-lined surfaces provide secure grip for climbing and lounging.',
        dimensions: { height: '15 cm each', width: '40 cm each', depth: '25 cm each', weight: '4 kg total' },
        availableStock: 10,
        image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
      },
    ];

    const created = await House.insertMany(sampleHouses);

    res.status(201).json({
      success: true,
      message: `${created.length} houses seeded successfully`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    console.error('❌ Seed houses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding houses',
    });
  }
};
