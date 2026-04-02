import express from 'express';
import multer from 'multer';
import { adminSignup, adminSignin, getAdminMe, getAllUsers, deleteUser, changeAdminPassword } from '../controllers/adminController.js';
import { getAllOrders, getOrderByIdAdmin, updateOrderStatus, updatePaymentStatus } from '../controllers/orderController.js';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { uploadAdminImage } from '../controllers/uploadController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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

// Admin image upload (S3)
router.post('/upload/image', protectAdmin, upload.single('image'), uploadAdminImage);

export default router;
