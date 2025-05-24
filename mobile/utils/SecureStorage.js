import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keychain service identifiers
const TOKEN_SERVICE = 'com.projectsunga.mobile.tokens';
const USER_SERVICE = 'com.projectsunga.mobile.user';

/**
 * Secure Storage Utility
 * Handles secure storage of sensitive information using Keychain
 * Falls back to AsyncStorage if Keychain is not available
 */
class SecureStorage {
  /**
   * Store authentication tokens securely
   * @param {Object} tokens - The tokens to store
   * @param {string} tokens.access_token - The access token
   * @param {string} tokens.refresh_token - The refresh token
   * @param {string} tokens.token_type - The token type (e.g., 'Bearer')
   * @returns {Promise<boolean>} - Success status
   */
  static async storeTokens(tokens) {
    try {
      const { access_token, refresh_token, token_type } = tokens;
      
      // Create a JSON string of all tokens
      const tokenData = JSON.stringify({
        access_token,
        refresh_token,
        token_type: token_type || 'Bearer',
        timestamp: new Date().toISOString(),
      });
      
      // Try to store in Keychain
      try {
        await Keychain.setGenericPassword('auth_tokens', tokenData, {
          service: TOKEN_SERVICE,
          accessControl: Keychain.ACCESS_CONTROL.USER_PRESENCE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
        
        // Also store a flag in AsyncStorage to indicate tokens are stored in Keychain
        await AsyncStorage.setItem('tokens_in_keychain', 'true');
        
        return true;
      } catch (keychainError) {
        console.warn('Failed to store tokens in Keychain, falling back to AsyncStorage', keychainError);
        
        // Fallback to AsyncStorage
        const storageItems = [
          ['auth_token', access_token],
          ['token_type', token_type || 'Bearer'],
        ];
        
        if (refresh_token) {
          storageItems.push(['refresh_token', refresh_token]);
        }
        
        await AsyncStorage.multiSet(storageItems);
        await AsyncStorage.setItem('tokens_in_keychain', 'false');
        
        return true;
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      return false;
    }
  }
  
  /**
   * Retrieve stored authentication tokens
   * @returns {Promise<Object|null>} - The stored tokens or null if not found
   */
  static async getTokens() {
    try {
      // Check if tokens are stored in Keychain
      const inKeychain = await AsyncStorage.getItem('tokens_in_keychain');
      
      if (inKeychain === 'true') {
        // Try to get from Keychain
        try {
          const credentials = await Keychain.getGenericPassword({
            service: TOKEN_SERVICE,
          });
          
          if (credentials) {
            return JSON.parse(credentials.password);
          }
        } catch (keychainError) {
          console.warn('Failed to retrieve tokens from Keychain', keychainError);
        }
      }
      
      // Fallback to AsyncStorage
      const access_token = await AsyncStorage.getItem('auth_token');
      const token_type = await AsyncStorage.getItem('token_type');
      const refresh_token = await AsyncStorage.getItem('refresh_token');
      
      if (!access_token) {
        return null;
      }
      
      return {
        access_token,
        token_type: token_type || 'Bearer',
        refresh_token,
      };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return null;
    }
  }
  
  /**
   * Store user data securely
   * @param {Object} userData - The user data to store
   * @returns {Promise<boolean>} - Success status
   */
  static async storeUserData(userData) {
    if (!userData) return false;
    
    try {
      const userDataString = JSON.stringify(userData);
      
      // Try to store in Keychain
      try {
        await Keychain.setGenericPassword('user_data', userDataString, {
          service: USER_SERVICE,
          accessControl: Keychain.ACCESS_CONTROL.USER_PRESENCE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
        
        // Also store a flag in AsyncStorage
        await AsyncStorage.setItem('user_data_in_keychain', 'true');
        
        return true;
      } catch (keychainError) {
        console.warn('Failed to store user data in Keychain, falling back to AsyncStorage', keychainError);
        
        // Fallback to AsyncStorage
        await AsyncStorage.setItem('user_data', userDataString);
        await AsyncStorage.setItem('user_data_in_keychain', 'false');
        
        return true;
      }
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  }
  
  /**
   * Retrieve stored user data
   * @returns {Promise<Object|null>} - The stored user data or null if not found
   */
  static async getUserData() {
    try {
      // Check if user data is stored in Keychain
      const inKeychain = await AsyncStorage.getItem('user_data_in_keychain');
      
      if (inKeychain === 'true') {
        // Try to get from Keychain
        try {
          const credentials = await Keychain.getGenericPassword({
            service: USER_SERVICE,
          });
          
          if (credentials) {
            return JSON.parse(credentials.password);
          }
        } catch (keychainError) {
          console.warn('Failed to retrieve user data from Keychain', keychainError);
        }
      }
      
      // Fallback to AsyncStorage
      const userDataString = await AsyncStorage.getItem('user_data');
      
      if (!userDataString) {
        return null;
      }
      
      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }
  
  /**
   * Clear all stored authentication data
   * @returns {Promise<boolean>} - Success status
   */
  static async clearAuthData() {
    try {
      // Try to clear from Keychain
      try {
        await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
        await Keychain.resetGenericPassword({ service: USER_SERVICE });
      } catch (keychainError) {
        console.warn('Failed to clear data from Keychain', keychainError);
      }
      
      // Also clear from AsyncStorage
      await AsyncStorage.multiRemove([
        'auth_token',
        'token_type',
        'refresh_token',
        'user_data',
        'tokens_in_keychain',
        'user_data_in_keychain',
        'remember_me',
      ]);
      
      return true;
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return false;
    }
  }
}

export default SecureStorage;
