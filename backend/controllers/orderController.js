import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Food from '../models/Food.js';
import Clothes from '../models/Clothes.js';
import Toy from '../models/Toy.js';
import House from '../models/House.js';
import Accessory from '../models/Accessory.js';
import GroomingEssential from '../models/GroomingEssential.js';
import HealthSupplement from '../models/HealthSupplement.js';
import Razorpay from 'razorpay';

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

    if (!['cash_on_delivery', 'online'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
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
    const gst = Math.round(subtotal * 0.18);  // 18% GST on subtotal
    const total = subtotal + gst + deliveryCharge;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      mrpTotal,
      discount,
      gst,
      deliveryCharge,
      total,
      status: 'placed',
      paymentStatus: paymentMethod === 'online' ? 'unpaid' : 'unpaid',
    });

    if (paymentMethod === 'cash_on_delivery') {
      cart.items = [];
      await cart.save();
      return res.status(201).json({ success: true, data: order });
    }

    // Online payment: create Razorpay order and return key + order id (cart cleared after payment verification)
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      await Order.findByIdAndDelete(order._id);
      return res.status(500).json({ success: false, message: 'Online payment is not configured' });
    }

    const amountInPaise = Math.round(total * 100);  // Convert to paise
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      data: order,
      razorpayOrderId: razorpayOrder.id,
      keyId,
      amountInPaise,
    });
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

// @desc    Cancel order (user — only if status is 'placed')
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'placed') {
      return res.status(400).json({ success: false, message: 'Order can only be cancelled when status is "placed"' });
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date() });
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify Razorpay payment and mark order paid (user)
// @route   POST /api/v1/orders/:id/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment ID and signature are required' });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.paymentMethod !== 'online' || !order.razorpayOrderId) {
      return res.status(400).json({ success: false, message: 'This order is not an online payment order' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ success: true, data: order, message: 'Already verified' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, message: 'Payment verification not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // Clear cart after successful payment
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({ success: true, data: order, message: 'Payment verified successfully' });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single order by ID (admin — no user filter)
// @route   GET /api/v1/admin/orders/:id
// @access  Private (Admin)
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/v1/admin/orders/:id/status
// @access  Private (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date() });

    // Auto-set paymentStatus to "paid" when delivered
    if (status === 'delivered') {
      order.paymentStatus = 'paid';

      // Deduct stock only if order was NOT already delivered (prevent double deduction)
      if (previousStatus !== 'delivered') {
        for (const item of order.items) {
          const Model = MODEL_MAP[item.productType];
          if (Model) {
            await Model.findByIdAndUpdate(item.product, {
              $inc: { availableStock: -item.quantity },
            });
          }
        }
      }
    }

    await order.save();

    // Re-populate user for response
    await order.populate('user', 'name email phone');
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update payment status (admin)
// @route   PUT /api/v1/admin/orders/:id/payment
// @access  Private (Admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['unpaid', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    await order.save();
    await order.populate('user', 'name email phone');

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
