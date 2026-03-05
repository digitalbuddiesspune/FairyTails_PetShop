import express from 'express';
import { getTestimonials } from '../controllers/testimonialController.js';

const router = express.Router();

// Public route - get active testimonials
router.get('/', getTestimonials);

export default router;
