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

// Seed route (must be before /:id to avoid conflict)
router.post('/seed', seedFood);

// Category route (must be before /:id to avoid conflict)
router.get('/category/:category', getFoodByCategory);

// Public routes
router.get('/', getAllFood);
router.post('/', createFood);

// ID-based routes
router.get('/:id', getFoodById);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

// Reviews
router.post('/:id/reviews', addReview);

export default router;
