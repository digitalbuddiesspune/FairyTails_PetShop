import mongoose from "mongoose";

/* Usage sub-schema */
const usageSchema = new mongoose.Schema(
  {
    dosage: {
      type: String,
      required: true,
    },
    ageGroup: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/* Main Health Supplement schema */
const healthSupplementSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["health-supplement"],
      default: "health-supplement",
    },

    subCategory: {
      type: String,
      required: true,
      enum: ["dog", "cat"],
      lowercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      required: true,
    },

    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    highlights: {
      type: [String],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    usage: {
      type: usageSchema,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "HealthSupplement",
  healthSupplementSchema
);
