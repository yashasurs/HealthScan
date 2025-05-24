import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';
import axios from 'axios';
import SecureStorage from './SecureStorage';

/**
 * Utility for testing authentication functionality
 */
class AuthTestUtility {  /**
   * Get the current authentication status and token details
   * @returns {Promise<Object>} Authentication status information
   */
  static async getAuthStatus() {
    try {
      // Get tokens from secure storage
      const tokens = await SecureStorage.getTokens();
      const userData = await SecureStorage.getUserData();
      
      return {
        isAuthenticated: !!(tokens && tokens.access_token),
        tokens,
        userData,
        timestamp: new Date().toISOString(),
        storageType: tokens ? (await AsyncStorage.getItem('tokens_in_keychain') === 'true' ? 'Keychain' : 'AsyncStorage') : 'None'
      };
    } catch (error) {
      console.error('Error getting auth status:', error);
      return {
        isAuthenticated: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
  /**
   * Test token refresh functionality
   * @returns {Promise<Object>} Test results
   */
  static async testTokenRefresh() {
    try {
      const tokens = await SecureStorage.getTokens();
      
      if (!tokens || !tokens.refresh_token) {
        return {
          success: false,
          message: 'No refresh token available',
          timestamp: new Date().toISOString(),
        };
      }
      
      // Try to refresh the token
      const response = await axios.post(`${API_BASE_URL}/refresh`, {
        refresh_token: tokens.refresh_token
      });
      
      // Check if we got a new access token
      const success = !!response.data.access_token;
      
      // Don't store the new token, we're just testing
      
      return {
        success,
        message: success ? 'Token refresh successful' : 'Token refresh failed',
        response: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token refresh failed',
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
  /**
   * Test API access with current token
   * @returns {Promise<Object>} Test results
   */
  static async testApiAccess(endpoint = '/users/me') {
    try {
      const tokens = await SecureStorage.getTokens();
      
      if (!tokens || !tokens.access_token) {
        return {
          success: false,
          message: 'No auth token available',
          timestamp: new Date().toISOString(),
        };
      }
      
      // Try to access the API
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `${tokens.token_type || 'Bearer'} ${tokens.access_token}`,
        },
      });
      
      return {
        success: true,
        message: 'API access successful',
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'API access failed',
        error: error.response?.data || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString(),
      };
    }
  }
  /**
   * Clear all authentication data for testing
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllAuthData() {
    try {
      return await SecureStorage.clearAuthData();
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return false;
    }
  }
}

export default AuthTestUtility;
