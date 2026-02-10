import express from 'express';
import {
  getAllHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
  getHousesBySubCategory,
  seedHouses,
} from '../controllers/houseController.js';

const router = express.Router();

// Seed route (must be before /:id to avoid conflict)
router.post('/seed', seedHouses);

// SubCategory route (must be before /:id to avoid conflict)
router.get('/subcategory/:subCategory', getHousesBySubCategory);

// Public routes
router.get('/', getAllHouses);
router.post('/', createHouse);

// ID-based routes
router.get('/:id', getHouseById);
router.put('/:id', updateHouse);
router.delete('/:id', deleteHouse);

export default router;
