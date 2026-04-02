const USER_TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'adminToken';
const USER_DATA_KEY = 'user';
const ADMIN_DATA_KEY = 'admin';
const OIDC_META_KEY = 'oidc_user';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const buildUserFromOidc = (oidcUser) => {
  const profile = oidcUser?.profile || {};
  const fullName =
    profile.name ||
    [profile.given_name, profile.family_name].filter(Boolean).join(' ') ||
    profile.email ||
    'Cognito User';

  return {
    _id: profile.sub || profile.username || profile['cognito:username'],
    name: fullName,
    email: profile.email || profile.username || '',
    phone: profile.phone_number || '',
  };
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

const tokenHasAdminGroup = (idToken) => {
  const payload = decodeJwtPayload(idToken);
  const groups = payload?.['cognito:groups'];
  return Array.isArray(groups) && groups.includes('admin');
};

export const getAuthToken = () => localStorage.getItem(USER_TOKEN_KEY);

export const isUserAuthenticated = () => Boolean(getAuthToken());

export const getStoredUser = () => safeJsonParse(localStorage.getItem(USER_DATA_KEY));

export const persistCognitoSession = (oidcUser) => {
  if (!oidcUser) return null;
  const token = oidcUser.access_token || oidcUser.id_token;
  const idToken = oidcUser.id_token;
  if (!token) return null;

  const mappedUser = buildUserFromOidc(oidcUser);
  localStorage.setItem(USER_TOKEN_KEY, token);
  // Mirror token for legacy admin calls that still read adminToken.
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(mappedUser));
  localStorage.setItem(OIDC_META_KEY, 'true');

  // Admin access is based on Cognito ID token group claim.
  if (tokenHasAdminGroup(idToken)) {
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(mappedUser));
  } else {
    localStorage.removeItem(ADMIN_DATA_KEY);
  }

  window.dispatchEvent(new Event('auth-changed'));
  return token;
};

export const bootstrapTokenFromOidcStorage = (oidcConfig) => {
  const authority = oidcConfig?.authority;
  const clientId = oidcConfig?.client_id;
  if (!authority || !clientId) return null;

  const key = `oidc.user:${authority}:${clientId}`;
  const oidcUser =
    safeJsonParse(localStorage.getItem(key)) || safeJsonParse(sessionStorage.getItem(key));

  if (!oidcUser) return null;
  return persistCognitoSession(oidcUser);
};

export const clearUserSession = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(ADMIN_DATA_KEY);
  localStorage.removeItem(OIDC_META_KEY);
  // Clear oidc-client-ts persisted user/session caches.
  const stores = [localStorage, sessionStorage];
  for (const store of stores) {
    Object.keys(store).forEach((key) => {
      if (
        key.startsWith('oidc.user:') ||
        key.startsWith('oidc.session_state:') ||
        key.startsWith('oidc.authorize:') ||
        key.startsWith('oidc.signout:')
      ) {
        store.removeItem(key);
      }
    });
  }
  window.dispatchEvent(new Event('auth-changed'));
};

export const isOidcBackedSession = () => localStorage.getItem(OIDC_META_KEY) === 'true';

export const isAdminAuthenticated = () => {
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const adminData = localStorage.getItem(ADMIN_DATA_KEY);
  return Boolean(adminToken && adminData);
};

