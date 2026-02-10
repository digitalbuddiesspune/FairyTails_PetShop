import express from 'express';
import {
  getAllClothes,
  getClothesById,
  createClothes,
  updateClothes,
  deleteClothes,
  getClothesByCategory,
  seedClothes,
} from '../controllers/clothesController.js';

const router = express.Router();

// Seed route (must be before /:id to avoid conflict)
router.post('/seed', seedClothes);

// Category route (must be before /:id to avoid conflict)
router.get('/category/:category', getClothesByCategory);

// Public routes
router.get('/', getAllClothes);
router.post('/', createClothes);

// ID-based routes
router.get('/:id', getClothesById);
router.put('/:id', updateClothes);
router.delete('/:id', deleteClothes);

export default router;
