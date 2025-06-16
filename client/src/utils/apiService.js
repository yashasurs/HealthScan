// A centralized API service with authentication
import axios from 'axios';

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  try {
    const response = await axios.post('https://healthscan-e868bea9b278.herokuapp.com/refresh', null, {
      params: { refresh_token: refreshToken }
    });

    const { access_token, refresh_token: new_refresh_token } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', new_refresh_token);
    
    return access_token;
  } catch (error) {
    // If refresh fails, clear tokens and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    throw error;
  }
};

/**
 * Creates an axios instance with proper authentication headers
 * @returns {axios.AxiosInstance}
 */
export const createApiService = () => {
  const token = localStorage.getItem('token');
    const instance = axios.create({
    baseURL: 'https://healthscan-e868bea9b278.herokuapp.com',
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

export default createApiService;
