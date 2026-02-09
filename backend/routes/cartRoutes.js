import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All cart routes are protected (user must be logged in)
router.use(protect);

router.route('/cart')
  .get(getCart)       // GET /api/cart
  .post(addToCart)    // POST /api/cart
  .delete(clearCart); // DELETE /api/cart (clear all)

router.route('/cart/:itemId')
  .put(updateCartItem)    // PUT /api/cart/:itemId
  .delete(removeFromCart); // DELETE /api/cart/:itemId

export default router;
