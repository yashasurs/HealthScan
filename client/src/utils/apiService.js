// A centralized API service with authentication
import axios from 'axios';

/**
 * Creates an axios instance with proper authentication headers
 * @returns {axios.AxiosInstance}
 */
export const createApiService = () => {
  const token = localStorage.getItem('token');
  console.log('Creating API service with token:', token ? 'Token present' : 'No token');
  if (!token) {
    console.warn('No authentication token found. API calls may fail.');
  }
  
  const instance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  
  // Add response interceptor for debugging
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

export default createApiService;
