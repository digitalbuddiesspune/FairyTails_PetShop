import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Food from '../models/Food.js';
import Clothes from '../models/Clothes.js';
import Toy from '../models/Toy.js';
import House from '../models/House.js';
import Accessory from '../models/Accessory.js';
import GroomingEssential from '../models/GroomingEssential.js';
import HealthSupplement from '../models/HealthSupplement.js';

const MODEL_MAP = {
  Food,
  Clothes,
  Toy,
  House,
  Accessory,
  GroomingEssential,
  HealthSupplement,
};

/* ─── Helpers: extract pricing from any product type ──────────────────────── */

const getPricing = (product, productType, selectedSize) => {
  if (product.prices?.length > 0) {
    const p = product.prices[selectedSize] || product.prices[0];
    return { mrp: p.mrp, price: p.discountedPrice };
  }
  if (product.sizes?.length > 0) {
    const s = product.sizes[selectedSize] || product.sizes[0];
    return { mrp: s.mrp, price: s.discountedPrice };
  }
  if (product.variants?.length > 0) {
    const v = product.variants[selectedSize] || product.variants[0];
    return { mrp: v.mrp, price: v.discountedPrice };
  }
  const mrp = product.price || 0;
  const price = product.discountedPrice || product.discountPrice || mrp;
  return { mrp, price };
};

const getDisplayName = (product) => product.productName || product.name || 'Product';
const getDisplayImage = (product) => (Array.isArray(product.images) && product.images[0]) || product.image || '';

// @desc    Place order from cart
// @route   POST /api/v1/orders
// @access  Private
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Shipping address and payment method are required' });
    }

    // Only COD for now
    if (paymentMethod !== 'cash_on_delivery') {
      return res.status(400).json({ success: false, message: 'Only Cash on Delivery is available right now' });
    }

    // Get user cart with populated products
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Build order items with snapshot of pricing
    const orderItems = [];
    let subtotal = 0;
    let mrpTotal = 0;

    for (const item of cart.items) {
      if (!item.product) continue;
      const { mrp, price } = getPricing(item.product, item.productType, item.selectedSize);
      orderItems.push({
        product: item.product._id,
        productType: item.productType,
        productName: getDisplayName(item.product),
        productImage: getDisplayImage(item.product),
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        price,
        mrp,
      });
      subtotal += price * item.quantity;
      mrpTotal += mrp * item.quantity;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid items in cart' });
    }

    const discount = mrpTotal - subtotal;
    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const total = subtotal + deliveryCharge;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      mrpTotal,
      discount,
      deliveryCharge,
      total,
      status: 'placed',
    });

    // Clear the cart after order is placed
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Place order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/v1/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/v1/orders/admin/all
// @access  Private (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
