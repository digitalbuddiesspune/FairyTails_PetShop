import Category from '../models/Category.js';

// Default category seed data matching the navbar structure
const defaultCategories = [
  {
    name: 'Dogs',
    slug: 'dogs',
    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg',
    subcategories: [
      { name: 'Dry Food', subSubCategories: [] },
      { name: 'Wet Food', subSubCategories: [] },
      { name: 'Dog Clothes', subSubCategories: [] },
      {
        name: 'Treats',
        subSubCategories: ['Dental Treats', 'Biscuits', 'Healthy Treats']
      }
    ]
  },
  {
    name: 'Cats',
    slug: 'cats',
    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg',
    subcategories: [
      { name: 'Dry Food', subSubCategories: [] },
      { name: 'Wet Food', subSubCategories: [] },
      { name: 'Treats', subSubCategories: [] },
      { name: 'Cat Clothes', subSubCategories: [] }
    ]
  },
  {
    name: 'Toys',
    slug: 'toys',
    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288630/Untitled_design_asmctz.png',
    subcategories: [
      { name: 'Dogs', subSubCategories: [] },
      { name: 'Cats', subSubCategories: [] }
    ]
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770289827/Untitled_design_5_uondnk.svg',
    subcategories: [
      { name: 'Dogs', subSubCategories: [] },
      { name: 'Cats', subSubCategories: [] }
    ]
  },
  {
    name: 'Grooming & Essential',
    slug: 'grooming-and-essential',
    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770289192/Untitled_design_3_fzqdjq.svg',
    subcategories: [
      { name: 'Dogs', subSubCategories: [] },
      { name: 'Cats', subSubCategories: [] }
    ]
  },
  {
    name: 'Health & Supplement',
    slug: 'health-and-supplement',
    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770287785/Untitled_design_2_xnht2p.svg',
    subcategories: [
      { name: 'Dogs', subSubCategories: [] },
      { name: 'Cats', subSubCategories: [] }
    ]
  },
  {
    name: 'Beds & House',
    slug: 'beds-and-house',
    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770289385/Untitled_design_4_tpstae.svg',
    subcategories: [
      { name: 'Dogs', subSubCategories: [] },
      { name: 'Cats', subSubCategories: [] }
    ]
  }
];

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching categories'
    });
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('❌ Get category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching category'
    });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public (should be Admin in production)
export const createCategory = async (req, res) => {
  try {
    const { name, slug, image, subcategories } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a category name'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      slug: slug || name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      slug,
      image: image || '',
      subcategories: subcategories || []
    });

    console.log('✅ Category created:', category.name);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating category'
    });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:slug
// @access  Public (should be Admin in production)
export const updateCategory = async (req, res) => {
  try {
    const { name, image, subcategories } = req.body;

    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Update fields if provided
    if (name) category.name = name;
    if (image !== undefined) category.image = image;
    if (subcategories) category.subcategories = subcategories;

    await category.save();

    console.log('✅ Category updated:', category.name);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating category'
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:slug
// @access  Public (should be Admin in production)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    console.log('✅ Category deleted:', category.name);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting category'
    });
  }
};

// @desc    Seed default categories into the database
// @route   POST /api/categories/seed
// @access  Public (should be Admin in production)
export const seedCategories = async (req, res) => {
  try {
    // Clear existing categories
    await Category.deleteMany({});

    // Insert categories one by one to trigger validation hooks
    const categories = [];
    for (const cat of defaultCategories) {
      const created = await Category.create(cat);
      categories.push(created);
    }

    console.log('✅ Categories seeded:', categories.length);

    res.status(201).json({
      success: true,
      message: `${categories.length} categories seeded successfully`,
      data: categories
    });
  } catch (error) {
    console.error('❌ Seed categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error seeding categories'
    });
  }
};
