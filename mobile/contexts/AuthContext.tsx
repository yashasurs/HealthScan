import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { UserRole } from '../types';
import { decodeJwtPayload, getUserRoleFromToken, isTokenExpired } from '../utils/tokenUtils';

const API_URL = 'http://10.0.2.2:8000';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  blood_group?: string;
  aadhar?: string;
  allergies?: string;
  doctor_name?: string;
  visit_date?: string;
  totp_enabled?: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
  // Doctor-specific fields
  specialization?: string;
  medical_license_number?: string;
  hospital_affiliation?: string;
  years_of_experience?: number;
  resume_verification_status?: boolean;
  resume_verification_confidence?: number;
  // Patient-specific fields
  doctor_id?: number;
}

interface UserData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  blood_group: string; // Required field
  aadhar?: string;
  allergies?: string;
  doctor_name?: string;
  visit_date?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isFirstLaunch: boolean;
  pendingUserId: number | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; requireTotp?: boolean; userId?: number }>;
  verifyTotp: (userId: number, totpCode: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: UserData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAndResetLaunch: () => Promise<void>;
  markLaunchComplete: () => Promise<void>;
  getToken: () => Promise<string | null>;
  getValidToken: () => Promise<string>;
  refreshAccessToken: () => Promise<string>;
  // Role-based access helpers
  isPatient: () => boolean;
  isDoctor: () => boolean;
  isAdmin: () => boolean;
  hasRole: (role: UserRole) => boolean;
  getUserRole: () => UserRole | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  require_totp: boolean;
  user_id?: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  require_totp: boolean;
}


// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(true);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  const isAuthenticated = !!token;

  const logout = async (): Promise<void> => {
    try {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setError(null);
      setPendingUserId(null);
      await Promise.all([
        AsyncStorage.removeItem("token"),
        AsyncStorage.removeItem("refresh_token"),
        AsyncStorage.removeItem("user")
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      if (token) return token;
      
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        return storedToken;
      }
      
      throw new Error('No authentication token found');
    } catch (error: any) {
      console.error("Authentication error:", error.message);
      await logout();
      return null;
    }
  };

  // Load token and user from AsyncStorage on app start
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const hasLaunchedBefore = await AsyncStorage.getItem("hasLaunchedBefore");
        const storedToken = await AsyncStorage.getItem("token");
        const storedRefreshToken = await AsyncStorage.getItem("refresh_token");
        const storedUser = await AsyncStorage.getItem("user");

        // Check if this is the first launch
        if (!hasLaunchedBefore) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
          
          if (storedToken && storedUser) {
            setToken(storedToken);
            setRefreshToken(storedRefreshToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error("Failed to load auth data from AsyncStorage", error);
        setIsFirstLaunch(false);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const markLaunchComplete = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem("hasLaunchedBefore", "true");
      setIsFirstLaunch(false);
    } catch (error) {
      console.error("Failed to mark launch complete:", error);
    }
  };

  const register = async (userData: UserData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      // Validate required fields
      if (!userData.blood_group || userData.blood_group.trim() === '') {
        const message = 'Blood group is required for registration';
        setError(message);
        return { success: false, error: message };
      }
      
      // Prepare data matching server schema - ensure blood_group is always included
      const registrationData = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        blood_group: userData.blood_group, // Must be provided (validated in UI)
        role: UserRole.PATIENT, // Always set role to patient for user registration
        ...(userData.aadhar && { aadhar: userData.aadhar }),
        ...(userData.allergies && { allergies: userData.allergies }),
        ...(userData.doctor_name && { doctor_name: userData.doctor_name }),
        ...(userData.visit_date && { visit_date: new Date(userData.visit_date).toISOString() })
      };

      const response = await axios.post<TokenResponse>(`${API_URL}/register`, registrationData);

      const { access_token, refresh_token } = response.data;
      
      // Get user profile data after successful registration
      const userResponse = await axios.get<User>(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      // Set tokens and user data
      console.log('Setting auth state after registration...');
      setToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userResponse.data);
      setPendingUserId(null); // Clear any pending TOTP state
      
      await Promise.all([
        AsyncStorage.setItem("token", access_token),
        AsyncStorage.setItem("refresh_token", refresh_token),
        AsyncStorage.setItem("user", JSON.stringify(userResponse.data))
      ]);
      
      console.log('Auth state set successfully, user:', userResponse.data);
      console.log('Is authenticated:', !!access_token);
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different error response formats
      let message = 'Registration failed';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // If detail is an array of validation errors, extract the messages
        if (Array.isArray(detail)) {
          message = detail.map((err: any) => err.msg || 'Validation error').join(', ');
        } else if (typeof detail === 'string') {
          message = detail;
        }
      }
      
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string; requireTotp?: boolean; userId?: number }> => {
    try {
      setError(null);
      
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const loginResult = response.data;
      
      // Check if TOTP is required
      if (loginResult.require_totp && loginResult.user_id) {
        setPendingUserId(loginResult.user_id);
        return { 
          success: false, 
          requireTotp: true, 
          userId: loginResult.user_id,
          error: 'TOTP verification required' 
        };
      }

      // For successful login without TOTP
      if (!loginResult.access_token || !loginResult.refresh_token) {
        throw new Error('Server response missing tokens');
      }

      // Get user profile data after successful login
      const userResponse = await axios.get<User>(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${loginResult.access_token}` }
      });

      setToken(loginResult.access_token);
      setRefreshToken(loginResult.refresh_token);
      setUser(userResponse.data);
      setPendingUserId(null); // Clear any pending TOTP state on successful login
      
      console.log('Login: Token set to:', loginResult.access_token ? 'TOKEN_EXISTS' : 'NO_TOKEN');
      console.log('Login: isAuthenticated should be:', !!loginResult.access_token);
      
      await Promise.all([
        AsyncStorage.setItem("token", loginResult.access_token),
        AsyncStorage.setItem("refresh_token", loginResult.refresh_token),
        AsyncStorage.setItem("user", JSON.stringify(userResponse.data))
      ]);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error response formats
      let message = 'Login failed';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // If detail is an array of validation errors, extract the messages
        if (Array.isArray(detail)) {
          message = detail.map((err: any) => err.msg || 'Validation error').join(', ');
        } else if (typeof detail === 'string') {
          message = detail;
        }
      } else if (error.message) {
        message = error.message;
      }
      
      setError(message);
      return { success: false, error: message };
    }
  };

  const verifyTotp = async (userId: number, totpCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const response = await axios.post<TokenResponse>(`${API_URL}/login/verify-totp`, {
        totp_code: totpCode
      }, {
        params: { user_id: userId },
        headers: { 'Content-Type': 'application/json' }
      });

      const { access_token, refresh_token } = response.data;

      // Get user profile data after successful TOTP verification
      const userResponse = await axios.get<User>(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userResponse.data);
      setPendingUserId(null); // Clear pending user ID after successful verification
      
      await Promise.all([
        AsyncStorage.setItem("token", access_token),
        AsyncStorage.setItem("refresh_token", refresh_token),
        AsyncStorage.setItem("user", JSON.stringify(userResponse.data))
      ]);
      
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'TOTP verification failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logoutAndResetLaunch = async (): Promise<void> => {
    try {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setError(null);
      setPendingUserId(null);
      setIsFirstLaunch(true); // Reset to first launch when logging out due to auth error
      await Promise.all([
        AsyncStorage.removeItem("token"),
        AsyncStorage.removeItem("refresh_token"),
        AsyncStorage.removeItem("user"),
        AsyncStorage.removeItem("hasLaunchedBefore") // Remove this so user sees landing page
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshAccessToken = async (): Promise<string> => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<TokenResponse>(`${API_URL}/refresh`, 
        refreshToken, // Send the refresh token as a string in the body
        {
          headers: { 'Content-Type': 'text/plain' }
        }
      );

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
      // If refresh fails, logout user and reset to show landing page
      await logoutAndResetLaunch();
      throw error;
    }
  };

  const getValidToken = async (): Promise<string> => {
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
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          return await refreshAccessToken();
        }
        throw error;
      }
    } catch (error) {
      console.error("Failed to get valid token:", error);
      await logoutAndResetLaunch();
      throw error;
    }
  };

  // Role-based access helpers
  const isPatient = (): boolean => {
    // Check user object first, then token as fallback
    if (user?.role) {
      return user.role === UserRole.PATIENT;
    }
    
    // Fallback to token if user object is not available
    if (token) {
      const roleFromToken = getUserRoleFromToken(token);
      return roleFromToken === UserRole.PATIENT;
    }
    
    return false;
  };

  const isDoctor = (): boolean => {
    // Check user object first, then token as fallback
    if (user?.role) {
      return user.role === UserRole.DOCTOR;
    }
    
    // Fallback to token if user object is not available
    if (token) {
      const roleFromToken = getUserRoleFromToken(token);
      return roleFromToken === UserRole.DOCTOR;
    }
    
    return false;
  };

  const isAdmin = (): boolean => {
    // Check user object first, then token as fallback
    if (user?.role) {
      return user.role === UserRole.ADMIN;
    }
    
    // Fallback to token if user object is not available
    if (token) {
      const roleFromToken = getUserRoleFromToken(token);
      return roleFromToken === UserRole.ADMIN;
    }
    
    return false;
  };

  const hasRole = (role: UserRole): boolean => {
    // Check user object first, then token as fallback
    if (user?.role) {
      return user.role === role;
    }
    
    // Fallback to token if user object is not available
    if (token) {
      const roleFromToken = getUserRoleFromToken(token);
      return roleFromToken === role;
    }
    
    return false;
  };

  const getUserRole = (): UserRole | null => {
    // Check user object first, then token as fallback
    if (user?.role) {
      return user.role;
    }
    
    // Fallback to token if user object is not available
    if (token) {
      return getUserRoleFromToken(token);
    }
    
    return null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      refreshToken,
      isAuthenticated, 
      loading,
      error,
      isFirstLaunch,
      pendingUserId,
      markLaunchComplete,
      getToken,
      getValidToken, 
      login,
      verifyTotp,
      logout,
      logoutAndResetLaunch,
      register,
      refreshAccessToken,
      // Role-based access helpers
      isPatient,
      isDoctor,
      isAdmin,
      hasRole,
      getUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
