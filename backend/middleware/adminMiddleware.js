import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const secret = process.env.JWT_SECRET || 'fairytails_petshop_secret_key_2024';
      const decoded = jwt.verify(token, secret);

      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized as admin',
        });
      }

      req.admin = await Admin.findById(String(decoded.id)).select('-password');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found',
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized, no token',
  });
};

export default protectAdmin;
