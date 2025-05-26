// API Service for making authenticated requests
import axios from 'axios';
import { useAuth } from '../Contexts/Authcontext';

const API_BASE_URL = 'http://10.0.2.2:8000';

/**
 * Creates an axios instance with authentication headers
 * @param {string} token - Authentication token
 * @returns {axios.AxiosInstance}
 */
export const createApiService = (token) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });

  // Add response interceptor for debugging and error handling
  instance.interceptors.response.use(
    response => {
      console.log(`API call to ${response.config.url} successful:`, response.status);
      return response;
    },
    error => {
      console.error(`API call to ${error.config?.url} failed:`, error.response?.status, error.response?.data);
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
    getAuthenticatedApi,
    // Collections API
    collections: {
      getAll: async () => {
        const api = await getAuthenticatedApi();
        return api.get('/collections/');
      },
      create: async (collectionData) => {
        const api = await getAuthenticatedApi();
        return api.post('/collections/', collectionData);
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
      }
    },
    // Records API
    records: {
      getAll: async () => {
        const api = await getAuthenticatedApi();
        return api.get('/records/');
      },
      get: async (recordId) => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/${recordId}`);
      },
      update: async (recordId, content) => {
        const api = await getAuthenticatedApi();
        return api.patch(`/records/${recordId}`, null, {
          params: { content }
        });
      }
    },
    // OCR API
    ocr: {
      processFiles: async (files, collectionId = null) => {
        const api = await getAuthenticatedApi();
        const formData = new FormData();
        
        files.forEach(file => {
          formData.append('files', file);
        });

        let url = '/ocr/get-text';
        if (collectionId) {
          url += `?collection_id=${collectionId}`;
        }

        return api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
    }
  };
};

export default createApiService;
