import mongoose from "mongoose";

/* Volume + Price + Stock schema */
const variantSchema = new mongoose.Schema(
  {
    volume: {
      type: String, // e.g. "250ml", "500ml"
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
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

/* Main Grooming Essentials schema */
const groomingEssentialSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["grooming-essentials"],
      default: "grooming-essentials",
    },

    subCategory: {
      type: String,
      required: true,
      enum: ["dog", "cat"],
      lowercase: true,
    },

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

    variants: {
      type: [variantSchema],
      required: true,
      validate: [
        (v) => v.length > 0,
        "At least one variant is required",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    keyFeatures: {
      type: [String],
      required: true,
    },

    suitableFor: {
      type: String,
      enum: ["Dogs", "Cats", "Both"],
      default: "Both",
    },

    usageInstructions: {
      type: [String],
    },

    images: {
      type: [String],
      required: true,
      validate: [
        (v) => v.length > 0,
        "At least one image is required",
      ],
    },

    isReturnable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "GroomingEssential",
  groomingEssentialSchema
);
