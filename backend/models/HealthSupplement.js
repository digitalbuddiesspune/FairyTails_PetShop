import mongoose from "mongoose";

/* Usage sub-schema */
const usageSchema = new mongoose.Schema(
  {
    dosage: {
      type: String,
    },
    ageGroup: {
      type: String,
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

    productName: {
      type: String,
      required: true,
      trim: true,
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

    taxes: {
      type: Number,
      default: 18, // GST @ 18%
      required: true,
    },

    baseUnit: {
      type: String,
      default: 'pieces',
      required: true,
    },

    images: {
      type: [String],
      required: true,
      validate: [
        (v) => v.length > 0,
        "At least one image is required",
      ],
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

    size: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    highlights: {
      type: [String],
    },

    usage: {
      type: usageSchema,
    },

    saleDiscount: {
      type: Number,
      default: 0,
    },

    taxRateLabel: {
      type: String,
      trim: true,
    },

    inclusiveOfTax: {
      type: Boolean,
      default: true,
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
