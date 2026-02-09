import express from 'express';
import {
  getAllFood,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  addReview,
  getFoodByCategory,
  seedFood,
} from '../controllers/foodController.js';

const router = express.Router();

// Seed route
router.post('/food/seed', seedFood);

// Category route
router.get('/food/category/:category', getFoodByCategory);

// Public routes
router.get('/food', getAllFood);
router.post('/food', createFood);

// ID-based routes
router.get('/food/:id', getFoodById);
router.put('/food/:id', updateFood);
router.delete('/food/:id', deleteFood);

// Reviews
router.post('/food/:id/reviews', addReview);

export default router;
