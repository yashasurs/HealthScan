import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './AuthService';

// Create the authentication context
const AuthContext = createContext();

/**
 * Authentication Provider Component
 * Provides authentication state and methods to the app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load the user on app startup
  useEffect(() => {
    loadUser();
  }, []);
  
  /**
   * Loads the user from AsyncStorage or the API
   */
  const loadUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we have a token
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        // Try to load user from local storage first for quick rendering
        const userData = await AsyncStorage.getItem('user_data');
        
        if (userData) {
          setUser(JSON.parse(userData));
        }
        
        // Then get the latest user data from API
        try {
          const freshUserData = await authService.getCurrentUser();
          setUser(freshUserData);
        } catch (apiError) {
          // If API call fails, token might be expired
          if (apiError.status === 401) {
            try {
              // Try to refresh the token
              await authService.refreshToken();
              // If successful, try to get user again
              const refreshedUserData = await authService.getCurrentUser();
              setUser(refreshedUserData);
            } catch (refreshError) {
              // If refresh fails, user needs to login again
              await authService.clearAuthData();
              setUser(null);
            }
          } else {
            // For other errors, keep using cached user data
            console.error('Error fetching fresh user data:', apiError);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setError(error.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
    /**
   * Logs in a user with email, username, and password
   */
  const login = async (email, username, password, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, username, password, rememberMe);
      
      // Since the FastAPI response doesn't include user info directly,
      // we need to fetch it separately if needed
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (userError) {
        // If we can't get the user data, we'll still consider the user logged in
        // based on having a valid token
        setUser({ email, username });
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
    /**
   * Registers a new user
   */
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Register and store tokens if successful
      const response = await authService.register(userData, true);
      
      // If registration returns tokens, update user state
      if (response.access_token) {
        try {
          // Try to get user data if available
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (userError) {
          // If we can't get user data, set minimal user info
          setUser({ email: userData.email, username: userData.username });
        }
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Logs out the current user
   */
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handles password reset request
   */
  const requestPasswordReset = async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await authService.requestPasswordReset(email);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Confirms password reset with token and new password
   */
  const confirmPasswordReset = async (token, newPassword) => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await authService.confirmPasswordReset(token, newPassword);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // The value to be provided to consumers of this context
  const authContextValue = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    refreshUser: loadUser,
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
