import mongoose from "mongoose";

/* Size + Stock + Price schema */
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL"],
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

/* Main Clothes schema */
const clothesSchema = new mongoose.Schema(
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

    category: {
      type: String,
      required: true,
      enum: ["Dog", "Cat"],
    },

    subCategory: {
      type: String,
      required: true,
      enum: ["Clothing", "Dresses", "Winter Wear", "Rain Wear"],
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

    careInstructions: {
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

    expectedDeliveryDays: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Clothes", clothesSchema);
