import express from 'express';
import { signup, signin, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.route('/signup').post(signup);
router.route('/sign-in').post(signin);

// Protected routes
router.get('/me', protect, getMe);

export default router;
