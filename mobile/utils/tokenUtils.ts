// JWT token utilities
import { TokenPayload, UserRole } from '../types';

/**
 * Decode JWT token payload without verification
 * Note: This is for reading token data only, not for verification
 */
export const decodeJwtPayload = (token: string): TokenPayload | null => {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (base64url)
    const payload = parts[1];
    // Replace characters for base64 decoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);
    
    const decodedPayload = JSON.parse(atob(padded));
    
    return {
      user_id: decodedPayload.user_id,
      role: decodedPayload.role as UserRole,
      exp: decodedPayload.exp,
      iat: decodedPayload.iat
    };
  } catch (error) {
    console.error('Error decoding JWT payload:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

/**
 * Get user role from token
 */
export const getUserRoleFromToken = (token: string): UserRole | null => {
  const payload = decodeJwtPayload(token);
  return payload?.role || null;
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  return payload?.user_id || null;
};
