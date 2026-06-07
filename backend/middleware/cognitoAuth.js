import { CognitoJwtVerifier } from 'aws-jwt-verify';
import crypto from 'crypto';

import User from '../models/User.js';
import Admin from '../models/Admin.js';

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'ap-south-1_6kSN7qDBD';
const COGNITO_ADMIN_GROUP = (process.env.COGNITO_ADMIN_GROUP || 'admin').toLowerCase();
const COGNITO_ADMIN_EMAILS = (process.env.COGNITO_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: 'access',
  clientId: null,
});

const idTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  clientId: null,
});

const getBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) return null;
  return authorizationHeader.split(' ')[1];
};

const randomPassword = () => crypto.randomBytes(24).toString('hex');

const COGNITO_DEBUG =
  process.env.COGNITO_DEBUG === 'true' || process.env.NODE_ENV === 'development';

const looksLikeUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || '').trim());

const isRealEmail = (value) => {
  if (!value || typeof value !== 'string') return false;
  const email = value.trim().toLowerCase();
  if (email.endsWith('@cognito.com')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const syntheticEmailFromSub = (sub) => {
  const normalizedId = String(sub || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  return normalizedId ? `${normalizedId}@cognito.com` : '';
};

const pickFirstRealEmail = (...candidates) => {
  for (const candidate of candidates) {
    if (isRealEmail(candidate)) return candidate.trim().toLowerCase();
  }
  return null;
};

const resolveDisplayName = (payload, email) => {
  const fromParts = [payload?.given_name, payload?.family_name].filter(Boolean).join(' ').trim();
  const preferred = payload?.preferred_username?.trim();
  const cognitoUsername = payload?.['cognito:username']?.trim();
  const username = payload?.username?.trim();

  if (payload?.name?.trim()) return payload.name.trim();
  if (fromParts) return fromParts;
  if (preferred && !looksLikeUuid(preferred)) return preferred;
  if (email) return email.split('@')[0];
  if (cognitoUsername && isRealEmail(cognitoUsername)) return cognitoUsername.split('@')[0];
  if (username && isRealEmail(username)) return username.split('@')[0];
  if (cognitoUsername && !looksLikeUuid(cognitoUsername)) return cognitoUsername;
  if (username && !looksLikeUuid(username)) return username;
  return '';
};

export const logCognitoPayload = (label, payload = {}) => {
  if (!COGNITO_DEBUG || !payload) return;

  const profile = extractCognitoProfile(payload);
  console.info(`[Cognito:${label}]`, {
    token_use: payload.token_use,
    sub: payload.sub,
    claims: {
      email: payload.email ?? null,
      name: payload.name ?? null,
      given_name: payload.given_name ?? null,
      family_name: payload.family_name ?? null,
      preferred_username: payload.preferred_username ?? null,
      username: payload.username ?? null,
      'cognito:username': payload['cognito:username'] ?? null,
      phone_number: payload.phone_number ?? null,
    },
    resolved: profile,
  });
};

export const extractCognitoProfile = (payload = {}) => {
  const sub = payload?.sub || '';
  const email = pickFirstRealEmail(
    payload?.email,
    payload?.preferred_username,
    payload?.username,
    payload?.['cognito:username']
  );
  const name = resolveDisplayName(payload, email);
  const phone = payload?.phone_number || '';

  return {
    sub,
    email,
    name: String(name).trim() || 'User',
    phone: String(phone).trim(),
  };
};

const shouldReplacePlaceholderName = (name) =>
  !name || name === 'Cognito User' || name === 'User';

const shouldReplaceSyntheticEmail = (email) =>
  !email || String(email).toLowerCase().endsWith('@cognito.com');

export const syncUserFromCognitoProfile = async (user, profile) => {
  if (!user || !profile) return user;

  let dirty = false;

  if (profile.sub && user.cognitoSub !== profile.sub) {
    user.cognitoSub = profile.sub;
    dirty = true;
  }

  if (profile.email && shouldReplaceSyntheticEmail(user.email)) {
    const conflict = await User.findOne({ email: profile.email, _id: { $ne: user._id } });
    if (!conflict) {
      user.email = profile.email;
      dirty = true;
    }
  }

  if (profile.name && shouldReplacePlaceholderName(user.name)) {
    user.name = profile.name;
    dirty = true;
  }

  if (profile.phone && !user.phone) {
    user.phone = profile.phone;
    dirty = true;
  }

  if (dirty) await user.save();
  return user;
};

export const findOrProvisionUser = async (payload) => {
  logCognitoPayload('findOrProvisionUser', payload);
  const profile = extractCognitoProfile(payload);
  if (!profile.sub && !profile.email) {
    throw new Error('Invalid Cognito token profile');
  }

  let user = null;

  if (profile.sub) {
    user = await User.findOne({ cognitoSub: profile.sub }).select('-password');
  }

  if (!user && profile.email) {
    user = await User.findOne({ email: profile.email }).select('-password');
  }

  if (!user && profile.sub) {
    user = await User.findOne({ email: syntheticEmailFromSub(profile.sub) }).select('-password');
  }

  if (!user) {
    const emailToSave = profile.email || syntheticEmailFromSub(profile.sub);
    if (!emailToSave) throw new Error('Unable to derive user email from Cognito token');

    const created = await User.create({
      cognitoSub: profile.sub || undefined,
      name: profile.name,
      email: emailToSave,
      password: randomPassword(),
      phone: profile.phone || undefined,
    });
    return User.findById(created._id).select('-password');
  }

  return syncUserFromCognitoProfile(user, profile);
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

export const protectWithCognito = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const payload = await verifyCognitoToken(token);
    logCognitoPayload('protectWithCognito', payload);
    const user = await findOrProvisionUser(payload);

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

    const payload = await verifyCognitoToken(token);
    const email = extractCognitoProfile(payload).email || syntheticEmailFromSub(payload?.sub);
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
