import mongoose from 'mongoose';

// Sub-subcategory schema (e.g., "Dental Treats", "Biscuits" under Treats)
const subSubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sub-subcategory name is required'],
    trim: true
  }
}, { _id: false });

// Subcategory schema (e.g., "Dry Food", "Wet Food" under Dog)
const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true
  },
  // Optional deeper nesting (e.g., Treats -> Dental Treats, Biscuits)
  subSubCategories: {
    type: [String],
    default: []
  }
}, { _id: false });

// Main Category schema (e.g., "Dogs", "Cats", "Toys")
const categorySchema = new mongoose.Schema({
  // Display name of the category
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  // URL-friendly slug (auto-generated from name, lowercase, hyphen-separated)
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  // Category image URL (Cloudinary or any CDN)
  image: {
    type: String,
    default: ''
  },
  // Array of subcategories with optional sub-subcategories
  subcategories: {
    type: [subcategorySchema],
    default: []
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Pre-save hook: auto-generate slug from name if not provided
categorySchema.pre('save', function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[&]/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
