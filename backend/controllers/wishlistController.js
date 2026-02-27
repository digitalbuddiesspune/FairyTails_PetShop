import Wishlist from '../models/Wishlist.js';
import Food from '../models/Food.js';
import Clothes from '../models/Clothes.js';
import Toy from '../models/Toy.js';
import House from '../models/House.js';
import Accessory from '../models/Accessory.js';
import GroomingEssential from '../models/GroomingEssential.js';
import HealthSupplement from '../models/HealthSupplement.js';

// All product collections for resolving wishlist item documents
const PRODUCT_MODELS = [
  Food,
  Clothes,
  Toy,
  House,
  Accessory,
  GroomingEssential,
  HealthSupplement,
];

// Given an array of ObjectId values, fetch matching product documents
// from all product collections and return them in the same order.
const resolveWishlistItems = async (itemIds = []) => {
  if (!itemIds.length) return [];

  const idStrings = itemIds.map((id) => id.toString());
  const uniqueIds = [...new Set(idStrings)];

  const allDocs = [];
  for (const Model of PRODUCT_MODELS) {
    const docs = await Model.find({ _id: { $in: uniqueIds } }).lean();
    allDocs.push(...docs);
  }

  const byId = new Map();
  for (const doc of allDocs) {
    byId.set(doc._id.toString(), doc);
  }

  return idStrings
    .map((id) => byId.get(id))
    .filter(Boolean);
};

// @desc    Get user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    const products = await resolveWishlistItems(wishlist.items || []);
    const payload = {
      ...wishlist.toObject(),
      items: products,
    };

    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item in wishlist (add if not present, remove if present)
// @route   POST /api/v1/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    const index = wishlist.items.findIndex((id) => id.toString() === productId);
    let action;

    if (index > -1) {
      wishlist.items.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.items.push(productId);
      action = 'added';
    }

    await wishlist.save();

    const products = await resolveWishlistItems(wishlist.items || []);
    const payload = {
      ...wishlist.toObject(),
      items: products,
    };

    res.status(200).json({ success: true, message: `Product ${action}`, action, data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    const index = wishlist.items.findIndex((id) => id.toString() === productId);
    if (index > -1) {
      wishlist.items.splice(index, 1);
      await wishlist.save();
    }

    const products = await resolveWishlistItems(wishlist.items || []);
    const payload = {
      ...wishlist.toObject(),
      items: products,
    };

    res.status(200).json({ success: true, message: 'Removed from wishlist', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
