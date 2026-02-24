import mongoose from "mongoose";

/* Dimensions sub-schema */
const dimensionsSchema = new mongoose.Schema(
  {
    height: {
      type: String,
    },
    width: {
      type: String,
    },
    depth: {
      type: String,
    },
    weight: {
      type: String,
    },
  },
  { _id: false }
);

/* Main House schema */
const houseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["house"],
      default: "house",
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

    description: {
      type: String,
      trim: true,
    },

    highlights: {
      type: [String],
    },

    dimensions: {
      type: dimensionsSchema,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("House", houseSchema);
