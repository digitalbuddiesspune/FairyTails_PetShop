import mongoose from "mongoose";

/* Main Accessories schema */
const accessoriesSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["accessories"],
      default: "accessories",
    },

    subCategory: {
      type: String,
      required: true,
      enum: ["dog", "cat"],
      lowercase: true,
    },

    productType: {
      type: String,
      enum: ["collar-leash"],
      lowercase: true,
    },

    subSubCategory: {
      type: String,
      enum: ["collar-leash"],
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

    size: {
      type: String,
      trim: true,
    },

    brand: {
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

    isReturnable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Accessory", accessoriesSchema);
