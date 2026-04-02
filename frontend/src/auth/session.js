const USER_TOKEN_KEY = 'token';
const USER_DATA_KEY = 'user';
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

export const getAuthToken = () => localStorage.getItem(USER_TOKEN_KEY);

export const isUserAuthenticated = () => Boolean(getAuthToken());

export const getStoredUser = () => safeJsonParse(localStorage.getItem(USER_DATA_KEY));

export const persistCognitoSession = (oidcUser) => {
  if (!oidcUser) return null;
  const token = oidcUser.access_token || oidcUser.id_token;
  if (!token) return null;

  const mappedUser = buildUserFromOidc(oidcUser);
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(mappedUser));
  localStorage.setItem(OIDC_META_KEY, 'true');
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
  localStorage.removeItem(USER_DATA_KEY);
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

