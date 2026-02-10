import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env variables FIRST before anything else
dotenv.config();

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import clothesRoutes from './routes/clothesRoutes.js';
import toyRoutes from './routes/toyRoutes.js';
import healthSupplementRoutes from './routes/healthSupplementRoutes.js';
import houseRoutes from './routes/houseRoutes.js';
import accessoryRoutes from './routes/accessoryRoutes.js';
import groomingEssentialRoutes from './routes/groomingEssentialRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
connectDB();

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'FairyTails Pet Shop API is running' });
});

// Auth routes
app.use('/api/v1', authRoutes);

// Category routes
app.use('/api/v1', categoryRoutes);

// Food routes
app.use('/api/v1', foodRoutes);

// Cart routes
app.use('/api/v1', cartRoutes);

// Wishlist routes
app.use('/api/v1/wishlist', wishlistRoutes);

// Admin routes
app.use('/api/v1/admin', adminRoutes);

// Clothes routes
app.use('/api/v1/clothes', clothesRoutes);

// Toy routes
app.use('/api/v1/toys', toyRoutes);

// Health Supplement routes
app.use('/api/v1/health-supplements', healthSupplementRoutes);

// House routes
app.use('/api/v1/houses', houseRoutes);

// Accessory routes
app.use('/api/v1/accessories', accessoryRoutes);

// Grooming Essentials routes
app.use('/api/v1/grooming-essentials', groomingEssentialRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
