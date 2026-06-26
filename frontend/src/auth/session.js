const USER_TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'adminToken';
const USER_DATA_KEY = 'user';
const ADMIN_DATA_KEY = 'admin';

export const ADMIN_AUTH_CHANGED_EVENT = 'admin-auth-changed';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const isValidStoredToken = (token) =>
  typeof token === 'string' && token.length > 0 && token !== 'undefined' && token !== 'null';

export const getApiBearerToken = () => localStorage.getItem(USER_TOKEN_KEY);

export const getAuthToken = () => getApiBearerToken();

export const isUserAuthenticated = () => Boolean(getApiBearerToken());

export const getStoredUser = () => safeJsonParse(localStorage.getItem(USER_DATA_KEY));

export const getAdminToken = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return isValidStoredToken(token) ? token : null;
};

export const getStoredAdmin = () => safeJsonParse(localStorage.getItem(ADMIN_DATA_KEY));

export const setAdminSession = ({ token, ...admin }) => {
  if (!isValidStoredToken(token)) {
    throw new Error('Invalid admin token');
  }

  const profile = { ...admin };
  delete profile.token;

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED_EVENT));
};

export const clearUserSession = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  window.dispatchEvent(new Event('auth-changed'));
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_DATA_KEY);
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED_EVENT));
};

export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  const admin = getStoredAdmin();
  return Boolean(token && admin);
};

export const redirectToAdminSignIn = () => {
  clearAdminSession();
  window.location.replace('/admin/signin');
};
