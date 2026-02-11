import express from 'express';
import {
  createAddress,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from '../controllers/addressController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All address routes require authentication
router.use(protect);

router.route('/')
  .get(getMyAddresses)
  .post(createAddress);

router.route('/:id')
  .get(getAddressById)
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
