// A centralized API service with authentication
import axios from 'axios';

/**
 * Creates an axios instance with proper authentication headers
 * @returns {axios.AxiosInstance}
 */
export const createApiService = () => {
  const token = localStorage.getItem('token');
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

export default createApiService;
