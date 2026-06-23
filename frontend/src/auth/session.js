const USER_TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'adminToken';
const USER_DATA_KEY = 'user';
const ADMIN_DATA_KEY = 'admin';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getApiBearerToken = () => localStorage.getItem(USER_TOKEN_KEY);

export const getAuthToken = () => getApiBearerToken();

export const isUserAuthenticated = () => Boolean(getApiBearerToken());

export const getStoredUser = () => safeJsonParse(localStorage.getItem(USER_DATA_KEY));

export const clearUserSession = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  window.dispatchEvent(new Event('auth-changed'));
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_DATA_KEY);
};

export const isAdminAuthenticated = () => {
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const adminData = localStorage.getItem(ADMIN_DATA_KEY);
  return Boolean(adminToken && adminData);
};
