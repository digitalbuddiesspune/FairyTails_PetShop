import express from 'express';
import {
  getAllHealthSupplements,
  getHealthSupplementById,
  createHealthSupplement,
  updateHealthSupplement,
  deleteHealthSupplement,
  getHealthSupplementsBySubCategory,
  seedHealthSupplements,
} from '../controllers/healthSupplementController.js';

const router = express.Router();

// Seed route (must be before /:id to avoid conflict)
router.post('/seed', seedHealthSupplements);

// SubCategory route (must be before /:id to avoid conflict)
router.get('/subcategory/:subCategory', getHealthSupplementsBySubCategory);

// Public routes
router.get('/', getAllHealthSupplements);
router.post('/', createHealthSupplement);

// ID-based routes
router.get('/:id', getHealthSupplementById);
router.put('/:id', updateHealthSupplement);
router.delete('/:id', deleteHealthSupplement);

export default router;
