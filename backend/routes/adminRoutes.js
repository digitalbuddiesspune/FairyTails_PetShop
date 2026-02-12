import express from 'express';
import { adminSignup, adminSignin, getAdminMe, getAllUsers, deleteUser } from '../controllers/adminController.js';
import { getAllOrders, getOrderByIdAdmin, updateOrderStatus, updatePaymentStatus } from '../controllers/orderController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', adminSignup);  // Use via Postman only to create admin
router.post('/signin', adminSignin);

// Protected routes (admin only)
router.get('/me', protectAdmin, getAdminMe);
router.get('/users', protectAdmin, getAllUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

// Admin order management
router.get('/orders', protectAdmin, getAllOrders);
router.get('/orders/:id', protectAdmin, getOrderByIdAdmin);
router.put('/orders/:id/status', protectAdmin, updateOrderStatus);
router.put('/orders/:id/payment', protectAdmin, updatePaymentStatus);

export default router;
