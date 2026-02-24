import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ['Dog', 'Cat', 'Bird', 'Fish', 'Other'],
    },

    subCategory: {
      type: String,
      required: true,
      enum: ['Dry Food', 'Wet Food', 'Treats'],
    },

    capacity: {
      type: String, // e.g. "1kg", "3kg", "400g"
      required: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      required: true,
    },

    discountType: {
      type: String,
      required: true,
    },

    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    baseUnit: {
      type: String,
      default: 'pieces',
      required: true,
    },

    taxes: {
      type: Number,
      default: 18, // GST @ 18%
      required: true,
    },

    images: {
      type: [String],
      required: true,
      validate: [(v) => v.length > 0, 'At least one image is required'],
    },

    // Optional fields
    itemCode: {
      type: String,
      trim: true,
    },

    hsn: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    details: {
      type: [String],
    },

    keyFeatures: {
      type: [String],
    },

    flavours: {
      type: [String],
    },

    nutrients: {
      type: [String], // e.g. Protein, Fat, Fiber, Calcium
    },

    healthBenefits: {
      type: [String],
    },

    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Food', productSchema);
