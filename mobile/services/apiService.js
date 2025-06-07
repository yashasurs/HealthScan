// API Service for making authenticated requests
import axios from 'axios';
import { useAuth } from '../Contexts/Authcontext';

const API_BASE_URL = 'http://10.0.2.2:8000';

/**
 * Creates an axios instance with authentication headers
 * @param {string} token - Authentication token
 * @returns {axios.AxiosInstance}
 */
const createApiService = (token) => {
  if (!token) {
    console.warn('No token provided to createApiService');
    throw new Error('Authentication token is required');
  }

  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });  instance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Use React Native's event emitter for auth errors
        const { DeviceEventEmitter } = require('react-native');
        DeviceEventEmitter.emit('authError', error);
        throw new Error('Authentication required');
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
  const { token, getToken } = useAuth();

  const getAuthenticatedApi = async () => {
    const currentToken = token || await getToken();
    return createApiService(currentToken);
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
      },
      getSummary: async (collectionId) => {
        const api = await getAuthenticatedApi();
        return api.get(`/collections/${collectionId}/summary`);
      },
      getShared: async (shareToken) => {
        const api = await getAuthenticatedApi();
        return api.get(`/collections/share/${shareToken}`);
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
      },
      getPdf: async (recordId) => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/${recordId}/pdf`, {
          responseType: 'blob'
        });
      },
      getSummary: async (recordId) => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/${recordId}/summary`);
      },
      getShared: async (shareToken) => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/share/${shareToken}`);
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
      }
    }
  };
};
