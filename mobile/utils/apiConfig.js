/**
 * API configuration file
 * Contains base URLs and endpoints for the FastAPI backend
 */

// Base URL for the API
export const API_BASE_URL = 'http://localhost:8000';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  SIGNUP: '/register',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/refresh',
  PASSWORD_RESET: '/password-reset',
  PASSWORD_RESET_CONFIRM: '/password-reset-confirm',
  VERIFY_EMAIL: '/verify-email',
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: '/users/me',
  UPDATE_PROFILE: '/users/me',
};

// Medical record endpoints
export const MEDICAL_ENDPOINTS = {
  RECORDS: '/medical/records',
  RECORD_DETAIL: (id) => `/medical/records/${id}`,
};

// Document endpoints
export const DOCUMENT_ENDPOINTS = {
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: (id) => `/documents/${id}`,
  UPLOAD: '/documents/upload',
};
