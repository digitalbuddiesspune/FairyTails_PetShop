import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { extractCognitoProfile, syncUserFromCognitoProfile } from '../middleware/cognitoAuth.js';

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fairytails_petshop_secret_key_2024';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    console.log('📝 Signup request received:', req.body);
    
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    console.log('Creating new user...');
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    console.log('✅ User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/signin
// @access  Public
export const signin = async (req, res) => {
  try {
    console.log('🔐 Signin request received:', req.body.email);
    
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ User logged in successfully:', user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token
      }
    });
  } catch (error) {
    console.error('❌ Signin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Sync Cognito profile (name/email/phone) into Mongo user
// @route   POST /api/auth/cognito-sync
// @access  Private
export const syncCognitoProfile = async (req, res) => {
  try {
    const tokenProfile = extractCognitoProfile(req.auth || {});
    const bodyProfile = extractCognitoProfile({
      sub: req.body?.sub,
      email: req.body?.email,
      name: req.body?.name,
      phone_number: req.body?.phone,
      given_name: req.body?.given_name,
      family_name: req.body?.family_name,
    });

    const profile = {
      sub: tokenProfile.sub || bodyProfile.sub,
      email: bodyProfile.email || tokenProfile.email,
      name: bodyProfile.name || tokenProfile.name,
      phone: bodyProfile.phone || tokenProfile.phone,
    };

    if (profile.sub && req.user?.cognitoSub && profile.sub !== req.user.cognitoSub) {
      return res.status(403).json({
        success: false,
        message: 'Cognito profile does not match authenticated user',
      });
    }

    const user = await syncUserFromCognitoProfile(req.user, profile);

    res.status(200).json({
      success: true,
      message: 'Cognito profile synced',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('❌ Cognito profile sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during Cognito profile sync',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Find user and update
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    console.log('✅ User profile updated:', user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during update'
    });
  }
};
