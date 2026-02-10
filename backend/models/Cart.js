import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'items.productType',
  },
  productType: {
    type: String,
    required: true,
    enum: ['Food', 'Clothes', 'Toy', 'House', 'Accessory', 'GroomingEssential', 'HealthSupplement'],
    default: 'Food',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  selectedSize: {
    type: Number, // index of the selected price/size option
    default: 0,
  },
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: {
    type: [cartItemSchema],
    default: [],
  },
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
