import Address from '../models/Address.js';

// @desc    Create a new address (skip if identical one already exists)
// @route   POST /api/v1/addresses
// @access  Private
export const createAddress = async (req, res) => {
  try {
    const {
      addressType, firstName, lastName, phone,
      streetAddress, city, state, pincode, paymentMethod,
    } = req.body;

    // Check for duplicate — same user + same core fields
    const existing = await Address.findOne({
      userId: req.user._id,
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      phone,
      streetAddress: streetAddress?.trim(),
      city: city?.trim(),
      state: state?.trim(),
      pincode,
    });

    if (existing) {
      // Return the existing address instead of creating a duplicate
      return res.status(200).json({ success: true, data: existing, reused: true });
    }

    const address = await Address.create({
      userId: req.user._id,
      addressType,
      firstName,
      lastName,
      phone,
      streetAddress,
      city,
      state,
      pincode,
      paymentMethod,
    });

    res.status(201).json({ success: true, data: address });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all addresses for logged-in user (auto-cleans duplicates)
// @route   GET /api/v1/addresses
// @access  Private
export const getMyAddresses = async (req, res) => {
  try {
    const all = await Address.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Deduplicate — keep the newest entry per unique address fingerprint
    const seen = new Map();
    const duplicateIds = [];

    for (const addr of all) {
      const key = [
        addr.firstName?.trim().toLowerCase(),
        addr.lastName?.trim().toLowerCase(),
        addr.phone,
        addr.streetAddress?.trim().toLowerCase(),
        addr.city?.trim().toLowerCase(),
        addr.state?.trim().toLowerCase(),
        addr.pincode,
      ].join('|');

      if (seen.has(key)) {
        duplicateIds.push(addr._id); // older duplicate
      } else {
        seen.set(key, addr);
      }
    }

    // Remove duplicates from DB in background (fire-and-forget)
    if (duplicateIds.length > 0) {
      Address.deleteMany({ _id: { $in: duplicateIds } }).catch(() => {});
    }

    res.status(200).json({ success: true, data: Array.from(seen.values()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single address by ID
// @route   GET /api/v1/addresses/:id
// @access  Private
export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.status(200).json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update an address
// @route   PUT /api/v1/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.status(200).json({ success: true, data: address });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/v1/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
