import mongoose from "mongoose";

/* Main Toy schema */
const toySchema = new mongoose.Schema(
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
      enum: ["Toy"],
      default: "Toy",
    },

    subCategory: {
      type: String,
      required: true,
      enum: ["Dog", "Cat"],
    },

    price: {
      type: Number,
      required: true,
    },

    discountedPrice: {
      type: Number,
    },

    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    size: {
      type: String,
      default: "One Size",
    },

    availableStock: {
      type: Number,
      required: true,
      min: 0,
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
      required: true,
    },

    suitableFor: {
      type: String,
      enum: ["Puppy", "Adult", "All"],
      default: "All",
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

export default mongoose.model("Toy", toySchema);
