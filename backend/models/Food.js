import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema(
  {
    capacity: {
      type: String, // e.g. "1kg", "3kg", "400g"
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

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

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    prices: {
      type: [priceSchema],
      required: true,
      validate: [(v) => v.length > 0, 'At least one price option is required'],
    },

    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },

    details: {
      type: [String],
      
    },

    keyFeatures: {
      type: [String],
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ['Dog', 'Cat', 'Bird', 'Fish','Other'],
    },

    subCategory: {
      type: String,
      required: true,
      enum: ['Dry Food', 'Wet Food', 'Treats'],
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    images: {
      type: [String],
      required: true,
      validate: [(v) => v.length > 0, 'At least one image is required'],
    },

    flavours: {
      type: [String],
      required: true,
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
