import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setIsAuthenticated(true);
          await getCurrentUser();
        } catch (err) {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);
  const register = async (userData) => {
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, userData);
      
      const { access_token, refresh_token } = response.data;
      localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      
      setIsAuthenticated(true);
      await getCurrentUser();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
      throw err;
    }
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      
      const response = await axios.post(`${API_BASE_URL}/login`, formData);
      
      // Check if 2FA is required
      if (response.data.require_totp) {
        return {
          require_totp: true,
          user_id: response.data.user_id
        };
      }
      
      const { access_token, refresh_token } = response.data;
      localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      
      setIsAuthenticated(true);
      await getCurrentUser();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
      throw err;
    }
  };

  const verifyTOTP = async (totpCode, userId) => {
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/login/verify-totp?user_id=${userId}`, {
        totp_code: totpCode
      });
      
      const { access_token, refresh_token } = response.data;
      localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      
      setIsAuthenticated(true);
      await getCurrentUser();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid TOTP code");
      throw err;
    }
  };

  const setup2FA = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/totp/setup`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to setup 2FA");
      throw err;
    }
  };

  const activate2FA = async (totpCode) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/totp/activate`, {
        totp_code: totpCode
      });
      await getCurrentUser();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to activate 2FA");
      throw err;
    }
  };

  const disable2FA = async (totpCode) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/totp/disable`, {
        totp_code: totpCode
      });
      await getCurrentUser();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to disable 2FA");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
  };
  
  const getCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/me`);
      setUser(response.data);
      return response.data;
    } catch (err) {
      return null;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    register,
    login,
    verifyTOTP,
    setup2FA,
    activate2FA,
    disable2FA,
    logout,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
  );
}