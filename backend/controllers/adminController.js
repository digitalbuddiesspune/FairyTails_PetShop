import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token for admin
const generateAdminToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fairytails_petshop_secret_key_2024';
  return jwt.sign({ id: String(id), role: 'admin' }, secret, {
    expiresIn: '30d'
  });
};

// @desc    Register a new admin (Postman only)
// @route   POST /api/v1/admin/signup
// @access  Public
export const adminSignup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const adminExists = await Admin.findOne({ email: email.toLowerCase() });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists with this email' });
    }

    const admin = await Admin.create({
      email: email.trim().toLowerCase(),
      password
    });

    const token = generateAdminToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        _id: admin._id,
        email: admin.email,
        role: 'admin',
        token
      }
    });
  } catch (error) {
    console.error('❌ Admin signup error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Login admin
// @route   POST /api/v1/admin/signin
// @access  Public
export const adminSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateAdminToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        _id: admin._id,
        email: admin.email,
        role: 'admin',
        token
      }
    });
  } catch (error) {
    console.error('❌ Admin signin error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get current admin profile
// @route   GET /api/v1/admin/me
// @access  Private (admin only)
export const getAdminMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: req.admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    // Calculate total ordered quantity for each user
    const usersWithOrderQuantity = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id });
        const totalQuantity = orders.reduce((sum, order) => {
          const orderQuantity = (order.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
          return sum + orderQuantity;
        }, 0);
        
        return {
          ...user.toObject(),
          totalOrderedQuantity: totalQuantity
        };
      })
    );
    
    res.status(200).json({ success: true, count: usersWithOrderQuantity.length, data: usersWithOrderQuantity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change admin password
// @route   PUT /api/v1/admin/change-password
// @access  Private (admin only)
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
