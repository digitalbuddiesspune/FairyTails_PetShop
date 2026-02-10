import mongoose from "mongoose";

/* Size + Stock schema */
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "One Size"],
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
    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

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

    sizes: {
      type: [sizeSchema],
      required: true,
      validate: [
        (v) => v.length > 0,
        "At least one size option is required",
      ],
    },

    material: {
      type: String,
      trim: true,
    },

    color: {
      type: [String],
      required: true,
    },

    productDetails: {
      type: [String],
      required: true,
    },

    keyFeatures: {
      type: [String],
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
