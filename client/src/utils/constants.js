// Common constants used throughout the application
export const API_BASE_URL = 'https://healthscan-e868bea9b278.herokuapp.com';

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

export const FILE_TYPES = {
  ACCEPTED: 'image/*',
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UPLOAD: '/upload',
  COLLECTIONS: '/collections',
  RECORDS: '/records',
  PROFILE: '/profile',
};

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const UI_MESSAGES = {
  LOADING: 'Loading...',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  SUCCESS_SAVE: 'Saved successfully!',
  CONFIRM_DELETE: 'Are you sure you want to delete this item?',
};
