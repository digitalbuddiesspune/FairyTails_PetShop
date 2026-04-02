import { CognitoJwtVerifier } from 'aws-jwt-verify';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import Admin from '../models/Admin.js';

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'ap-south-1_6kSN7qDBD';
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || '2bg7a4mpp4ci2l0qph9km9nlb7';
const COGNITO_ADMIN_GROUP = (process.env.COGNITO_ADMIN_GROUP || 'admin').toLowerCase();
const JWT_SECRET = process.env.JWT_SECRET || 'fairytails_petshop_secret_key_2024';
const COGNITO_ADMIN_EMAILS = (process.env.COGNITO_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: 'access',
});

const idTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: 'id',
});

const getBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) return null;
  return authorizationHeader.split(' ')[1];
};

const randomPassword = () => crypto.randomBytes(24).toString('hex');

const normalizeEmail = (payload) => {
  const email = payload?.email || payload?.username || payload?.['cognito:username'];
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

const normalizeName = (payload) => {
  const name = payload?.name || payload?.given_name || payload?.['cognito:username'] || 'Cognito User';
  return String(name).trim();
};

const parseJwtPayload = (token) => {
  try {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

const verifyCognitoToken = async (token) => {
  const tokenPayload = parseJwtPayload(token);
  const tokenUse = tokenPayload?.token_use;

  if (tokenUse === 'access') {
    return accessTokenVerifier.verify(token);
  }
  if (tokenUse === 'id') {
    return idTokenVerifier.verify(token);
  }

  // Unknown token type: try access first, then id as fallback.
  try {
    return await accessTokenVerifier.verify(token);
  } catch (accessError) {
    try {
      return await idTokenVerifier.verify(token);
    } catch {
      throw accessError;
    }
  }
};

const verifyLegacyJwt = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const verifyToken = async (token) => {
  try {
    const payload = await verifyCognitoToken(token);
    return { provider: 'cognito', payload };
  } catch (cognitoError) {
    const legacyPayload = verifyLegacyJwt(token);
    if (legacyPayload) {
      return { provider: 'legacy', payload: legacyPayload };
    }
    throw cognitoError;
  }
};

export const protectWithCognito = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const verified = await verifyToken(token);

    if (verified.provider === 'legacy') {
      const userId = verified.payload?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token payload' });
      }

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      req.user = user;
      req.auth = verified.payload;
      req.authProvider = 'legacy-jwt';
      return next();
    }

    const payload = verified.payload;
    const email = normalizeEmail(payload);
    if (!email) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid Cognito token' });
    }

    let user = await User.findOne({ email }).select('-password');
    if (!user) {
      const created = await User.create({
        name: normalizeName(payload),
        email,
        password: randomPassword(),
      });
      user = await User.findById(created._id).select('-password');
    }

    req.user = user;
    req.auth = payload;
    req.authProvider = 'cognito';
    return next();
  } catch (error) {
    console.error('User auth verification failed:', error?.message || error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: error?.message || 'Unknown token verification error',
    });
  }
};

export const protectAdminWithCognito = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const verified = await verifyToken(token);

    if (verified.provider === 'legacy') {
      const payload = verified.payload;
      const adminId = payload?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token payload' });
      }

      if (payload?.role && payload.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized as admin',
        });
      }

      const admin = await Admin.findById(adminId).select('-password');
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
      }

      req.admin = admin;
      req.auth = payload;
      req.authProvider = 'legacy-jwt';
      return next();
    }

    const payload = verified.payload;
    const email = normalizeEmail(payload);
    if (!email) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid Cognito token' });
    }

    const groups = Array.isArray(payload?.['cognito:groups'])
      ? payload['cognito:groups'].map((group) => String(group).toLowerCase())
      : [];

    const isAdminByGroup = groups.includes(COGNITO_ADMIN_GROUP);
    const isAdminByEmail = COGNITO_ADMIN_EMAILS.includes(email);

    if (!isAdminByGroup && !isAdminByEmail) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin',
      });
    }

    let admin = await Admin.findOne({ email }).select('-password');
    if (!admin) {
      const created = await Admin.create({
        email,
        password: randomPassword(),
      });
      admin = await Admin.findById(created._id).select('-password');
    }

    req.admin = admin;
    req.auth = payload;
    req.authProvider = 'cognito';
    return next();
  } catch (error) {
    console.error('Admin auth verification failed:', error?.message || error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: error?.message || 'Unknown token verification error',
    });
  }
};

