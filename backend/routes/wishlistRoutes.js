import express from 'express';
import { getWishlist, toggleWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All wishlist routes are protected (user must be logged in)
router.use(protect);

router.route('/wishlist')
  .get(getWishlist)       // GET /api/wishlist
  .post(toggleWishlist);  // POST /api/wishlist (toggle add/remove)

router.route('/wishlist/:productId')
  .delete(removeFromWishlist); // DELETE /api/wishlist/:productId

export default router;
