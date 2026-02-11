import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// User routes
router.route('/').get(getMyOrders).post(placeOrder);
router.route('/:id').get(getOrderById);

// Admin routes
router.get('/admin/all', getAllOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
