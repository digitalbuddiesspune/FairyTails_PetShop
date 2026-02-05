import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env variables FIRST before anything else
dotenv.config();

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
connectDB();

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'FairyTails Pet Shop API is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

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
