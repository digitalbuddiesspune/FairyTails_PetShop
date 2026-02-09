import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories
} from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);             // GET    /api/categories
router.get('/:slug', getCategoryBySlug);    // GET    /api/categories/:slug

// Admin routes (add protect + admin middleware in production)
router.post('/', createCategory);           // POST   /api/categories
router.put('/:slug', updateCategory);       // PUT    /api/categories/:slug
router.delete('/:slug', deleteCategory);    // DELETE /api/categories/:slug

// Seed route - populates DB with default categories
router.post('/seed', seedCategories);       // POST   /api/categories/seed

export default router;
