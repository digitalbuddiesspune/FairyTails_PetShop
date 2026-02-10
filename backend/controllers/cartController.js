import Cart from '../models/Cart.js';
import Food from '../models/Food.js';
import Clothes from '../models/Clothes.js';
import Toy from '../models/Toy.js';
import House from '../models/House.js';
import Accessory from '../models/Accessory.js';
import GroomingEssential from '../models/GroomingEssential.js';
import HealthSupplement from '../models/HealthSupplement.js';

// All product models for auto-detection
const PRODUCT_MODELS = [
  { name: 'Food', model: Food },
  { name: 'Clothes', model: Clothes },
  { name: 'Toy', model: Toy },
  { name: 'House', model: House },
  { name: 'Accessory', model: Accessory },
  { name: 'GroomingEssential', model: GroomingEssential },
  { name: 'HealthSupplement', model: HealthSupplement },
];

/**
 * Auto-detect which collection a product belongs to.
 * Searches all product collections in parallel.
 */
const detectProductType = async (productId) => {
  const results = await Promise.allSettled(
    PRODUCT_MODELS.map(async ({ name, model }) => {
      const doc = await model.findById(productId).select('_id').lean();
      if (doc) return name;
      throw new Error('not found');
    })
  );

  for (const r of results) {
    if (r.status === 'fulfilled') return r.value;
  }
  return null;
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items whose product was deleted (populate returns null)
    const validItems = cart.items.filter((item) => item.product != null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
      cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedSize = 0, productType: reqProductType } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Determine the product type
    let productType = reqProductType;
    if (!productType) {
      productType = await detectProductType(productId);
    }
    if (!productType) {
      return res.status(404).json({ success: false, message: 'Product not found in any collection' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if product already in cart with same size and same type
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.productType === productType
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, productType, quantity, selectedSize });
    }

    await cart.save();
    cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    res.status(200).json({ success: true, message: 'Item added to cart', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(itemId);
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    res.status(200).json({ success: true, message: 'Item removed', data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
