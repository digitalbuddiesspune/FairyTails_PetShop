import express from 'express';
import { getBanners } from '../controllers/bannerController.js';

const router = express.Router();

// Public route - get active banners
router.get('/', getBanners);

export default router;
