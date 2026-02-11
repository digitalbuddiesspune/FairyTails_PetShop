import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.productType',
    },
    productType: {
      type: String,
      required: true,
      enum: ['Food', 'Clothes', 'Toy', 'House', 'Accessory', 'GroomingEssential', 'HealthSupplement'],
    },
    productName: { type: String, required: true },
    productImage: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: Number, default: 0 },
    price: { type: Number, required: true },       // discounted price per unit
    mrp: { type: Number, required: true },          // original MRP per unit
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    addressType: { type: String, enum: ['home', 'office'], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'Order must have at least one item'],
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'online'],
      required: true,
    },
    subtotal: { type: Number, required: true },     // sum of (price * qty)
    mrpTotal: { type: Number, required: true },      // sum of (mrp * qty)
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
