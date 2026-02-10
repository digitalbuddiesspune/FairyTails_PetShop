import express from 'express';
import {
  getAllToys,
  getToyById,
  createToy,
  updateToy,
  deleteToy,
  getToysBySubCategory,
  seedToys,
} from '../controllers/toyController.js';

const router = express.Router();

// Seed route (must be before /:id to avoid conflict)
router.post('/seed', seedToys);

// SubCategory route (must be before /:id to avoid conflict)
router.get('/subcategory/:subCategory', getToysBySubCategory);

// Public routes
router.get('/', getAllToys);
router.post('/', createToy);

// ID-based routes
router.get('/:id', getToyById);
router.put('/:id', updateToy);
router.delete('/:id', deleteToy);

export default router;
