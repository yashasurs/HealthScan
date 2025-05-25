import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './apiConfig';
import SecureStorage from './SecureStorage';

/**
 * Authentication Service Class
 * Handles all authentication related operations with the FastAPI backend
 */
class AuthService {  /**
   * Logs in a user with email, username, and password
   * @param {string} email - User's email
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @param {boolean} rememberMe - Whether to keep the user logged in
   * @returns {Promise} - The API response with access token and token type
   */
  async login(email, username, password, rememberMe = false) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        username,
        password,
      });
      
      // Store tokens in AsyncStorage
      await this.storeAuthData(response.data, rememberMe);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.formatError(error);
    }
  }
    /**
   * Registers a new user
   * @param {Object} userData - User registration data
   * @param {boolean} storeTokens - Whether to store tokens after registration
   * @returns {Promise} - The API response
   */
  async register(userData, storeTokens = true) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.SIGNUP, userData);
      
      // If registration returns tokens and storeTokens is true, save them
      if (storeTokens && response.data.access_token) {
        await this.storeAuthData(response.data, false);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.formatError(error);
    }
  }
    /**
   * Logs out the current user
   * @returns {Promise} - Resolves when logout is complete
   */
  async logout() {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      // Call logout endpoint to invalidate the token on the server
      if (refreshToken) {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {
          refresh_token: refreshToken
        });
      }
      
      // Clear stored tokens and user data
      await this.clearAuthData();
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the tokens even if the API call fails
      await this.clearAuthData();
      return true;
    }
  }
  /**
   * Gets the current user's profile data
   * @returns {Promise} - The user profile data
   */
  async getCurrentUser() {
    try {
      // Get token to verify authentication
      const tokens = await SecureStorage.getTokens();
      if (!tokens || !tokens.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await apiClient.get(USER_ENDPOINTS.PROFILE);
      
      // Update stored user data
      await SecureStorage.storeUserData(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw this.formatError(error);
    }
  }
    /**
   * Checks if the user is authenticated
   * @returns {Promise<boolean>} - True if authenticated
   */
  async isAuthenticated() {
    try {
      const tokens = await SecureStorage.getTokens();
      return !!(tokens && tokens.access_token);
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
  
  /**
   * Requests a password reset for an email
   * @param {string} email - The email to reset password for
   * @returns {Promise} - The API response
   */
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.PASSWORD_RESET, { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw this.formatError(error);
    }
  }
  
  /**
   * Confirms a password reset with token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise} - The API response
   */
  async confirmPasswordReset(token, newPassword) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.PASSWORD_RESET_CONFIRM, {
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw this.formatError(error);
    }
  }  /**
   * Refreshes the authentication token using the refresh token
   * @returns {Promise} - The new tokens
   */
  async refreshToken() {
    try {
      // Get tokens from secure storage
      const tokens = await SecureStorage.getTokens();
      
      if (!tokens || !tokens.refresh_token) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refresh_token: tokens.refresh_token
      });
      
      // Store the new tokens
      if (response.data.access_token) {
        await SecureStorage.storeTokens(response.data);
      } else {
        throw new Error('Invalid token response');
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear auth data
      await this.clearAuthData();
      throw this.formatError(error);
    }
  }/**
   * Stores authentication data in AsyncStorage
   * @param {Object} data - The authentication data
   * @param {boolean} rememberMe - Whether to keep the user logged in
   * @returns {Promise} - Resolves when storage is complete
   * @private
   */
  async storeAuthData(data, rememberMe) {
    try {
      // Store tokens securely
      await SecureStorage.storeTokens(data);
      
      // Store remember me preference separately
      if (rememberMe) {
        await AsyncStorage.setItem('remember_me', 'true');
      } else {
        await AsyncStorage.removeItem('remember_me');
      }
      
      return true;
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }  /**
   * Clears all authentication data from AsyncStorage
   * @returns {Promise} - Resolves when clearing is complete
   * @private
   */
  async clearAuthData() {
    try {
      // Use SecureStorage to clear all auth data
      await SecureStorage.clearAuthData();
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }
  
  /**
   * Formats an error for consistent error handling
   * @param {Error} error - The error to format
   * @returns {Error} - The formatted error
   * @private
   */
  formatError(error) {
    // Format API errors for consistent handling
    if (error.response) {
      // The request was made and the server responded with an error status
      const { status, data } = error.response;
      const message = data.detail || data.message || 'An error occurred';
      
      const formattedError = new Error(message);
      formattedError.status = status;
      formattedError.data = data;
      
      return formattedError;
    }
    
    if (error.request) {
      // The request was made but no response was received
      return new Error('Network error. Please check your connection.');
    }
    
    // Something else happened in setting up the request
    return error;
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
