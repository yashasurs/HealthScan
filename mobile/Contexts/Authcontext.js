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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!token;

  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      return storedToken;
    } catch (error) {
      console.error("Failed to retrieve token from AsyncStorage", error);
      return null;
    }
  };

  // Load token and user from AsyncStorage on app start
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load auth data from AsyncStorage", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const register = async (email, username, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/register`, {
        email,
        username,
        password
      });

      const { access_token } = response.data;
      const userData = { email, username };

      // Set token and user data directly after registration
      setToken(access_token);
      setUser(userData);
      await AsyncStorage.setItem("token", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      // Use URLSearchParams to send form-encoded data
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      const response = await axios.post(`${API_URL}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      const userData = { username };
      setToken(access_token);
      setUser(userData);
      await AsyncStorage.setItem("token", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      loading,
      error,
      getToken, 
      login, 
      logout,
      register
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