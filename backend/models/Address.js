import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    addressType: {
      type: String,
      enum: {
        values: ["home", "office"],
        message: "Address type must be either home or office",
      },
      required: [true, "Address type is required"],
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [3, "First name must be at least 3 characters"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [1, "Last name must be at least 1 character"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message:
          "Phone number must be 10 digits and start with 6, 7, 8, or 9",
      },
    },

    streetAddress: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v);
        },
        message: "Enter a valid 6-digit Indian pincode",
      },
    },

    paymentMethod: {
      type: String,
      enum: {
        values: ["cash_on_delivery", "online"],
        message: "Payment method must be cash_on_delivery or online",
      },
      required: [true, "Payment method is required"],
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
