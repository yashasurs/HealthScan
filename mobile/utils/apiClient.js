import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';
import SecureStorage from './SecureStorage';

/**
 * Configured axios instance for API requests
 * Includes interceptors for authorization headers and token refresh
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get tokens from secure storage
      const tokens = await SecureStorage.getTokens();
      
      if (tokens && tokens.access_token) {
        const tokenType = tokens.token_type || 'Bearer';
        config.headers.Authorization = `${tokenType} ${tokens.access_token}`;
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (!error.response) {
      // Network error - no response from server
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Get status code
    const status = error.response.status;
    
    // If the error is unauthorized and we haven't tried to refresh the token yet
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
        try {
        // Check if we have a refresh token
        const tokens = await SecureStorage.getTokens();
        
        if (!tokens || !tokens.refresh_token) {
          throw new Error('No refresh token available');
        }
        
        console.log('Attempting to refresh token...');
        
        // Attempt to refresh the token using the refresh token
        // Use a different axios instance to avoid circular interceptor calls
        const response = await axios.post(`${API_BASE_URL}/refresh`, {
          refresh_token: tokens.refresh_token
        });
        
        if (!response.data.access_token) {
          throw new Error('Invalid token response');
        }
          console.log('Token refreshed successfully');
        
        // Store the new tokens securely
        await SecureStorage.storeTokens(response.data);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `${response.data.token_type || 'Bearer'} ${response.data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        
        // If token refresh fails, clear auth data
        await SecureStorage.clearAuthData();
        
        // Create a more descriptive error
        const authError = new Error('Your session has expired. Please log in again.');
        authError.isAuthError = true;
        return Promise.reject(authError);
      }
    }
    
    // Format error message from API response
    let errorMessage = 'An unexpected error occurred.';
    
    if (error.response.data) {
      if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
    }
    
    // Create a formatted error
    const formattedError = new Error(errorMessage);
    formattedError.status = status;
    formattedError.data = error.response.data;
    
    return Promise.reject(formattedError);
  }
);

export default apiClient;
