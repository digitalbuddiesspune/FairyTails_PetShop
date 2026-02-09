import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token for admin
const generateAdminToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fairytails_petshop_secret_key_2024';
  return jwt.sign({ id, role: 'admin' }, secret, {
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
    const admin = await Admin.findById(req.admin.id);
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
