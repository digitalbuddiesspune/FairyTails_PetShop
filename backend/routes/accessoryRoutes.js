import express from 'express';
import {
  getAllAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getAccessoriesBySubCategory,
  seedAccessories,
} from '../controllers/accessoryController.js';

const router = express.Router();

// Seed route (must be before /:id to avoid conflict)
router.post('/seed', seedAccessories);

// SubCategory route (must be before /:id to avoid conflict)
router.get('/subcategory/:subCategory', getAccessoriesBySubCategory);

// Public routes
router.get('/', getAllAccessories);
router.post('/', createAccessory);

// ID-based routes
router.get('/:id', getAccessoryById);
router.put('/:id', updateAccessory);
router.delete('/:id', deleteAccessory);

export default router;
