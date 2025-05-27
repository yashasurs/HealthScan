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
      return response;
    },
    error => {
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
