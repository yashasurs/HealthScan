import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

const API_URL = 'http://10.0.2.2:8000';

// Create the auth context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!token;const getToken = async () => {
    try {
      if (token) return token;
      
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        return storedToken;
      }
      
      throw new Error('No authentication token found');
    } catch (error) {
      console.error("Authentication error:", error.message);
      await logout();
      return null;
    }
  };
  // Load token and user from AsyncStorage on app start
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedRefreshToken = await AsyncStorage.getItem("refresh_token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load auth data from AsyncStorage", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);  const register = async (userData) => {
    try {
      setError(null);
      
      // Prepare data matching server schema
      const registrationData = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        blood_group: userData.blood_group || null,
        aadhar: userData.aadhar || null,
        allergies: userData.allergies || null,
        doctor_name: userData.doctor_name || null,
        visit_date: userData.visit_date ? new Date(userData.visit_date).toISOString() : null
      };

      const response = await axios.post(`${API_URL}/register`, registrationData);

      const { access_token, refresh_token } = response.data;
      
      // Get user profile data after successful registration
      const userResponse = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      // Set tokens and user data
      setToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userResponse.data);
      
      await Promise.all([
        AsyncStorage.setItem("token", access_token),
        AsyncStorage.setItem("refresh_token", refresh_token),
        AsyncStorage.setItem("user", JSON.stringify(userResponse.data))
      ]);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };  const login = async (username, password) => {
    try {
      setError(null);
      
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await axios.post(`${API_URL}/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, refresh_token } = response.data;
      if (!access_token) {
        throw new Error('Server response missing access token');
      }

      // Get user profile data after successful login
      const userResponse = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userResponse.data);
      
      await Promise.all([
        AsyncStorage.setItem("token", access_token),
        AsyncStorage.setItem("refresh_token", refresh_token),
        AsyncStorage.setItem("user", JSON.stringify(userResponse.data))
      ]);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };  const logout = async () => {
    try {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setError(null);
      await Promise.all([
        AsyncStorage.removeItem("token"),
        AsyncStorage.removeItem("refresh_token"),
        AsyncStorage.removeItem("user")
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshAccessToken = async () => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: new_refresh_token } = response.data;
      
      setToken(access_token);
      setRefreshToken(new_refresh_token);
      
      await Promise.all([
        AsyncStorage.setItem("token", access_token),
        AsyncStorage.setItem("refresh_token", new_refresh_token)
      ]);
      
      return access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const getValidToken = async () => {
    try {
      if (!token) {
        throw new Error('No access token available');
      }

      // Check if token is still valid by making a simple request
      try {
        await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return token;
      } catch (error) {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          return await refreshAccessToken();
        }
        throw error;
      }
    } catch (error) {
      console.error("Failed to get valid token:", error);
      await logout();
      throw error;
    }
  };
  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      refreshToken,
      isAuthenticated, 
      loading,
      error,
      getToken,
      getValidToken, 
      login, 
      logout,
      register,
      refreshAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};