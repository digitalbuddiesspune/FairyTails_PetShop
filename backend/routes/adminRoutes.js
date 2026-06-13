import express from 'express';
import multer from 'multer';
import { adminSignup, adminSignin, getAdminMe, getAllUsers, deleteUser, changeAdminPassword } from '../controllers/adminController.js';
import { getAllOrders, getOrderByIdAdmin, updateOrderStatus, updatePaymentStatus } from '../controllers/orderController.js';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { createAdminImagePresign, uploadAdminImage } from '../controllers/uploadController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();
const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES },
});

// Public routes
router.post('/signup', adminSignup);  // Use via Postman only to create admin
router.post('/signin', adminSignin);

// Protected routes (admin only)
router.get('/me', protectAdmin, getAdminMe);
router.put('/change-password', protectAdmin, changeAdminPassword);
router.get('/users', protectAdmin, getAllUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

// Admin order management
router.get('/orders', protectAdmin, getAllOrders);
router.get('/orders/:id', protectAdmin, getOrderByIdAdmin);
router.put('/orders/:id/status', protectAdmin, updateOrderStatus);
router.put('/orders/:id/payment', protectAdmin, updatePaymentStatus);

// Admin banner management
router.get('/banners', protectAdmin, getAllBanners);
router.post('/banners', protectAdmin, createBanner);
router.put('/banners/:id', protectAdmin, updateBanner);
router.delete('/banners/:id', protectAdmin, deleteBanner);

// Admin testimonial management
router.get('/testimonials', protectAdmin, getAllTestimonials);
router.post('/testimonials', protectAdmin, createTestimonial);
router.put('/testimonials/:id', protectAdmin, updateTestimonial);
router.delete('/testimonials/:id', protectAdmin, deleteTestimonial);

// Admin image upload — presigned direct-to-S3 (preferred)
router.post('/upload/presign', protectAdmin, createAdminImagePresign);

// Legacy proxy upload through API
router.post('/upload/image', protectAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image must be 4 MB or smaller.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed',
      });
    }
    next();
  });
}, uploadAdminImage);

export default router;
