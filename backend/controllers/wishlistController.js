import Wishlist from '../models/Wishlist.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item in wishlist (add if not present, remove if present)
// @route   POST /api/wishlist
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

    const index = wishlist.items.indexOf(productId);
    let action;

    if (index > -1) {
      wishlist.items.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.items.push(productId);
      action = 'added';
    }

    await wishlist.save();
    wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items');

    res.status(200).json({ success: true, message: `Product ${action}`, action, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    const index = wishlist.items.indexOf(productId);
    if (index > -1) {
      wishlist.items.splice(index, 1);
      await wishlist.save();
    }

    const updated = await Wishlist.findOne({ user: req.user._id }).populate('items');
    res.status(200).json({ success: true, message: 'Removed from wishlist', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
