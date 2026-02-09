import express from 'express';
import { adminSignup, adminSignin, getAdminMe } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', adminSignup);  // Use via Postman only to create admin
router.post('/signin', adminSignin);

// Protected routes (admin only)
router.get('/me', protectAdmin, getAdminMe);

export default router;
