import mongoose from "mongoose";

/* Main Toy schema */
const toySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["toy"],
      default: "toy",
      lowercase: true,
      immutable: true,
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

    brand: {
      type: String,
      trim: true,
    },

    size: {
      type: String,
      trim: true,
    },

    material: {
      type: String,
      trim: true,
    },

    color: {
      type: [String],
    },

    productDetails: {
      type: [String],
    },

    keyFeatures: {
      type: [String],
    },

    expiryDate: {
      type: Date,
      default: null,
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

    suitableFor: {
      type: String,
      enum: ["Puppy", "Adult", "All"],
      default: "All",
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

export default mongoose.model("Toy", toySchema);
