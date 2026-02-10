import mongoose from "mongoose";

/* Dimensions sub-schema */
const dimensionsSchema = new mongoose.Schema(
  {
    height: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
    depth: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
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

    dimensions: {
      type: dimensionsSchema,
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

export default mongoose.model("House", houseSchema);
