import express from 'express';
import {
  getAllGroomingEssentials,
  getGroomingEssentialById,
  createGroomingEssential,
  updateGroomingEssential,
  deleteGroomingEssential,
  getGroomingEssentialsBySubCategory,
  seedGroomingEssentials,
} from '../controllers/groomingEssentialController.js';

const router = express.Router();

// Seed route (must be before /:id to avoid conflict)
router.post('/seed', seedGroomingEssentials);

// SubCategory route (must be before /:id to avoid conflict)
router.get('/subcategory/:subCategory', getGroomingEssentialsBySubCategory);

// Public routes
router.get('/', getAllGroomingEssentials);
router.post('/', createGroomingEssential);

// ID-based routes
router.get('/:id', getGroomingEssentialById);
router.put('/:id', updateGroomingEssential);
router.delete('/:id', deleteGroomingEssential);

export default router;
