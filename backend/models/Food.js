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

const priceSchema = new mongoose.Schema(
  {
    capacity: {
      type: String,
      required: true,
      trim: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
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

    prices: {
      type: [priceSchema],
      default: [],
    },

    // Legacy flat fields — synced from prices[] for list sorting / older clients
    capacity: {
      type: String,
      trim: true,
    },

    mrp: {
      type: Number,
    },

    discountPrice: {
      type: Number,
    },

    discountType: {
      type: String,
      required: true,
    },

    availableStock: {
      type: Number,
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

    purchasePrice: {
      type: Number,
      default: 0,
    },

    saleDiscount: {
      type: Number,
      default: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    itemLocation: {
      type: String,
      trim: true,
    },

    taxRateLabel: {
      type: String,
      trim: true,
    },

    inclusiveOfTax: {
      type: Boolean,
      default: true,
    },

    secondaryUnit: {
      type: String,
      trim: true,
    },

    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
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
