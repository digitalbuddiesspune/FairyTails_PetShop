import express from 'express';
import { signup, signin, getMe, updateProfile, syncCognitoProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes
router.get('/me', protect, getMe);
router.post('/cognito-sync', protect, syncCognitoProfile);
router.put('/update', protect, updateProfile);

export default router;
