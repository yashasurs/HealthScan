// A centralized API service with authentication
import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/refresh`, { refresh_token: refreshToken });

    const { access_token, refresh_token: new_refresh_token } = response.data;
    localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, new_refresh_token);
    
    return access_token;
  } catch (error) {
    // If refresh fails, clear tokens and redirect to login
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    window.location.href = '/login';
    throw error;
  }
};

/**
 * Creates an axios instance with proper authentication headers
 * @returns {axios.AxiosInstance}
 */
export const createApiService = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
    // Add response interceptor for token refresh
  instance.interceptors.response.use(
    response => {
      return response;
    },
    async error => {
      const originalRequest = error.config;
      
      // If we get a 401 and haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await refreshAccessToken();
          
          // Update the authorization header
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          instance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
            // Retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
};

// Collections API
export const collectionsAPI = {
  getAll: async () => {
    const api = createApiService();
    return api.get('/collections/');
  },
  
  getById: async (collectionId) => {
    const api = createApiService();
    return api.get(`/collections/${collectionId}`);
  },
  
  create: async (collectionData) => {
    const api = createApiService();
    return api.post('/collections/', collectionData);
  },
  
  update: async (collectionId, collectionData) => {
    const api = createApiService();
    return api.put(`/collections/${collectionId}`, collectionData);
  },
  
  delete: async (collectionId) => {
    const api = createApiService();
    return api.delete(`/collections/${collectionId}`);
  },
  
  getRecords: async (collectionId) => {
    const api = createApiService();
    return api.get(`/collections/${collectionId}/records`);
  },
  
  addRecord: async (collectionId, recordId) => {
    const api = createApiService();
    return api.put(`/collections/${collectionId}/records/${recordId}`);
  },
  
  removeRecord: async (collectionId, recordId) => {
    const api = createApiService();
    return api.delete(`/collections/${collectionId}/records/${recordId}`);
  },

  // Move a record from one collection to another
  moveRecord: async (fromCollectionId, toCollectionId, recordId) => {
    const api = createApiService();
    // Add the record to the new collection (this will automatically move it)
    return api.put(`/collections/${toCollectionId}/records/${recordId}`);
  }
};

// User API
export const userAPI = {
  getCurrentUser: async () => {
    const api = createApiService();
    return api.get('/me');
  },
  
  updateUser: async (userData) => {
    const api = createApiService();
    return api.put('/user', userData);
  },
  
  deleteUser: async () => {
    const api = createApiService();
    return api.delete('/user');
  }
};

// OCR API
export const ocrAPI = {
  processImages: async (files, collectionId = null) => {
    const api = createApiService();
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    let url = '/ocr/images-to-text';
    if (collectionId) {
      url += `?collection_id=${collectionId}`;
    }
    
    return api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Authentication and 2FA API
export const authAPI = {
  login: async (username, password) => {
    const api = createApiService();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    return api.post('/login', formData);
  },

  verifyTOTP: async (totpCode, userId) => {
    const api = createApiService();
    return api.post(`/login/verify-totp?user_id=${userId}`, {
      totp_code: totpCode
    });
  },

  setup2FA: async () => {
    const api = createApiService();
    return api.post('/totp/setup');
  },

  activate2FA: async (totpCode) => {
    const api = createApiService();
    return api.post('/totp/activate', {
      totp_code: totpCode
    });
  },

  disable2FA: async (totpCode) => {
    const api = createApiService();
    return api.post('/totp/disable', {
      totp_code: totpCode
    });
  },

  get2FAQRCode: async () => {
    const api = createApiService();
    return api.post('/totp/setup?response_format=qrcode', {}, {
      responseType: 'blob'
    });
  }
};

// QR Code API
export const qrAPI = {
  generateQR: async (link) => {
    const api = createApiService();
    return api.post('/qr/get-qr', { link }, {
      responseType: 'blob'
    });
  },

  generateCollectionQR: async (collectionId) => {
    const api = createApiService();
    return api.post(`/qr/collection/${collectionId}`, {}, {
      responseType: 'blob'
    });
  },

  generateRecordQR: async (recordId) => {
    const api = createApiService();
    return api.post(`/qr/record/${recordId}`, {}, {
      responseType: 'blob'
    });
  }
};

// Records API
export const recordsAPI = {
  getAll: async () => {
    const api = createApiService();
    return api.get('/records/');
  },

  getById: async (recordId) => {
    const api = createApiService();
    return api.get(`/records/${recordId}`);
  },

  delete: async (recordId) => {
    const api = createApiService();
    return api.delete(`/records/${recordId}`);
  },

  update: async (recordId, recordData) => {
    const api = createApiService();
    return api.put(`/records/${recordId}`, recordData);
  }
};

// Doctor Verification API
export const doctorAPI = {
  registerDoctor: async (resumeFile) => {
    const api = createApiService();
    const formData = new FormData();
    formData.append('resume', resumeFile);
    
    return api.post('/doctor/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getDoctorDashboard: async () => {
    const api = createApiService();
    return api.get('/doctor/dashboard');
  },

  getDoctorPatients: async () => {
    const api = createApiService();
    return api.get('/doctor/patients');
  }
};

export default createApiService;
