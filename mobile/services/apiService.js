// API Service for making authenticated requests
import axios from 'axios';
import { useAuth } from '../Contexts/Authcontext';

const API_BASE_URL = 'https://healthscan-e868bea9b278.herokuapp.com';

/**
 * Creates an axios instance with authentication headers and refresh token functionality
 * @param {Function} getValidToken - Function to get a valid access token
 * @param {Function} refreshAccessToken - Function to refresh the access token
 * @returns {axios.AxiosInstance}
 */
const createApiService = (getValidToken, refreshAccessToken) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor to add current token to each request
  instance.interceptors.request.use(
    async (config) => {
      try {
        const token = await getValidToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get valid token for request:', error);
        throw error;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh on 401 errors
  instance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const newToken = await refreshAccessToken();
          
          // Update the authorization header with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request with the new token
          return instance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Emit auth error event for the app to handle (e.g., redirect to login)
          const { DeviceEventEmitter } = require('react-native');
          DeviceEventEmitter.emit('authError', refreshError);
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Hook to get authenticated API service
 * @returns {Object} API service instance with methods
 */
export const useApiService = () => {
  const { getValidToken, refreshAccessToken } = useAuth();

  const getAuthenticatedApi = async () => {
    return createApiService(getValidToken, refreshAccessToken);
  };

  return {
    getAuthenticatedApi,    // Auth API
    auth: {
      getCurrentUser: async () => {
        const api = await getAuthenticatedApi();
        return api.get('/me');
      },
      updateUser: async (userData) => {
        const api = await getAuthenticatedApi();
        return api.put('/user', userData);
      }
    },    // Collections API
    collections: {
      getAll: async () => {
        const api = await getAuthenticatedApi();
        return api.get('/collections/');
      },
      get: async (collectionId) => {
        const api = await getAuthenticatedApi();
        return api.get(`/collections/${collectionId}`);
      },
      create: async (collectionData) => {
        const api = await getAuthenticatedApi();
        return api.post('/collections/', collectionData);
      },
      update: async (collectionId, collectionData) => {
        const api = await getAuthenticatedApi();
        return api.put(`/collections/${collectionId}`, collectionData);
      },
      updatePartial: async (collectionId, collectionData) => {
        const api = await getAuthenticatedApi();
        return api.patch(`/collections/${collectionId}`, collectionData);
      },
      delete: async (collectionId) => {
        const api = await getAuthenticatedApi();
        return api.delete(`/collections/${collectionId}`);
      },
      getRecords: async (collectionId) => {
        const api = await getAuthenticatedApi();
        return api.get(`/collections/${collectionId}/records`);
      },
      addRecord: async (collectionId, recordId) => {
        const api = await getAuthenticatedApi();
        return api.put(`/collections/${collectionId}/records/${recordId}`);
      },
      removeRecord: async (collectionId, recordId) => {
        const api = await getAuthenticatedApi();
        return api.delete(`/collections/${collectionId}/records/${recordId}`);
      },      getShared: async (shareToken) => {
        // Public endpoint - no auth required
        const publicApi = axios.create({
          baseURL: API_BASE_URL,
          headers: { 'Content-Type': 'application/json' }
        });
        return publicApi.get(`/collections/share/${shareToken}`);
      },
      saveShared: async (shareToken) => {
        const api = await getAuthenticatedApi();
        return api.post(`/collections/share/${shareToken}/save`);
      }
    },// Records API
    records: {
      getAll: async () => {
        const api = await getAuthenticatedApi();
        return api.get('/records/');
      },
      get: async (recordId) => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/${recordId}`);
      },
      update: async (recordId, recordData) => {
        const api = await getAuthenticatedApi();
        return api.patch(`/records/${recordId}`, recordData);
      },
      updateContent: async (recordId, content) => {
        const api = await getAuthenticatedApi();
        return api.patch(`/records/${recordId}/content`, null, {
          params: { content }
        });
      },
      delete: async (recordId) => {
        const api = await getAuthenticatedApi();
        return api.delete(`/records/${recordId}`);
      },      getPdf: async (recordId) => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/${recordId}/pdf`, {
          responseType: 'blob'
        });
      },      getShared: async (shareToken) => {
        // Public endpoint - no auth required
        const publicApi = axios.create({
          baseURL: API_BASE_URL,
          headers: { 'Content-Type': 'application/json' }
        });
        return publicApi.get(`/records/share/${shareToken}`);
      },
      getSharedPdf: async (shareToken) => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/share/${shareToken}/pdf`, {
          responseType: 'blob'
        });
      },
      saveShared: async (shareToken) => {
        const api = await getAuthenticatedApi();
        return api.post(`/records/share/${shareToken}/save`);
      },
      getUnorganized: async () => {
        const api = await getAuthenticatedApi();
        const response = await api.get('/records/');
        // Filter records that don't belong to any collection
        const unorganizedRecords = response.data.filter(record => !record.collection_id);
        return { data: unorganizedRecords };
      }
    },    // OCR API
    ocr: {
      processFiles: async (files) => {
        const api = await getAuthenticatedApi();
        const formData = new FormData();
        
        files.forEach((file, index) => {
          // Ensure the file object has the correct properties for React Native FormData
          const fileObject = {
            uri: file.uri,
            type: file.type || file.mimeType || 'image/jpeg',
            name: file.filename || file.name || `file_${index}.jpg`
          };
          
          formData.append('files', fileObject);
        });

        let url = '/ocr/get-text';
        
        return api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      },
      processFilesToCollection: async (files, collectionId) => {
        const api = await getAuthenticatedApi();
        const formData = new FormData();
        
        files.forEach((file, index) => {
          // Ensure the file object has the correct properties for React Native FormData
          const fileObject = {
            uri: file.uri,
            type: file.type || file.mimeType || 'image/jpeg',
            name: file.filename || file.name || `file_${index}.jpg`
          };
          
          formData.append('files', fileObject);
        });

        let url = `/ocr/get-text?collection_id=${collectionId}`;
        
        return api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
    },

    // QR Code API
    qr: {
      getRecordQR: async (recordId) => {
        const api = await getAuthenticatedApi();
        return api.post(`/qr/record/${recordId}`, {}, {
          responseType: 'blob'
        });
      },
      getCollectionQR: async (collectionId) => {
        const api = await getAuthenticatedApi();
        return api.post(`/qr/collection/${collectionId}`, {}, {
          responseType: 'blob'
        });
      }
    }
  };
};
