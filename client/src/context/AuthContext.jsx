import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:8000"; 
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Setup axios headers for authorized requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          setIsAuthenticated(true);
          
          // Fetch current user data
          await getCurrentUser();
        } catch (err) {
          console.error("Error verifying authentication", err);
          localStorage.removeItem("token");
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
      const response = await axios.post(`${API_URL}/register`, userData);
      
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      
      // Set axios default header for future requests
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
      
      const response = await axios.post(`${API_URL}/login`, formData);
      
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      
      setIsAuthenticated(true);
      
      // Get user data after successful login
      await getCurrentUser();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
  };  
  
  const getCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`);
      console.log("Current user data:", response.data);
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching user data", err);
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
    logout,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
  );
}