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
app.use('/api/v1', wishlistRoutes);

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
