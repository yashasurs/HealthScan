// API Service for making authenticated requests
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DeviceEventEmitter } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole } from '@/types';

const API_BASE_URL = 'https://healthscan-e868bea9b278.herokuapp.com';

// Helper function to convert API response to proper User type
const convertApiUserToUser = (apiUser: any): User => {
  return {
    ...apiUser,
    role: apiUser.role ? (apiUser.role as UserRole) : UserRole.PATIENT
  };
};

interface Record {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
  updated_at: string;
  collection_id?: string;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  records?: Record[];
}

interface FileObject {
  uri: string;
  type?: string;
  name?: string;
  filename?: string;
  mimeType?: string;
}

interface CollectionData {
  name: string;
  description?: string;
}

interface RecordData {
  filename?: string;
  content?: string;
}

/**
 * Creates an axios instance with authentication headers and refresh token functionality
 */
const createApiService = (getValidToken: () => Promise<string | null>, refreshAccessToken: () => Promise<string>): AxiosInstance => {
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
 */
export const useApiService = () => {
  const { getValidToken, refreshAccessToken } = useAuth();

  const getAuthenticatedApi = async (): Promise<AxiosInstance> => {
    return createApiService(getValidToken, refreshAccessToken);
  };

  return {
    getAuthenticatedApi,
    
    // Auth API
    auth: {
      getCurrentUser: async (): Promise<AxiosResponse<User>> => {
        const api = await getAuthenticatedApi();
        const response = await api.get('/me');
        return {
          ...response,
          data: convertApiUserToUser(response.data)
        };
      },
      updateUser: async (userData: Partial<User>): Promise<AxiosResponse<User>> => {
        const api = await getAuthenticatedApi();
        const response = await api.put('/user', userData);
        return {
          ...response,
          data: convertApiUserToUser(response.data)
        };
      }
    },

    // Collections API
    collections: {
      getAll: async (): Promise<AxiosResponse<Collection[]>> => {
        const api = await getAuthenticatedApi();
        return api.get('/collections/');
      },
      get: async (collectionId: string): Promise<AxiosResponse<Collection>> => {
        const api = await getAuthenticatedApi();
        return api.get(`/collections/${collectionId}`);
      },
      create: async (collectionData: CollectionData): Promise<AxiosResponse<Collection>> => {
        const api = await getAuthenticatedApi();
        return api.post('/collections/', collectionData);
      },
      update: async (collectionId: string, collectionData: CollectionData): Promise<AxiosResponse<Collection>> => {
        const api = await getAuthenticatedApi();
        return api.put(`/collections/${collectionId}`, collectionData);
      },
      updatePartial: async (collectionId: string, collectionData: Partial<CollectionData>): Promise<AxiosResponse<Collection>> => {
        const api = await getAuthenticatedApi();
        return api.patch(`/collections/${collectionId}`, collectionData);
      },
      delete: async (collectionId: string): Promise<AxiosResponse<void>> => {
        const api = await getAuthenticatedApi();
        return api.delete(`/collections/${collectionId}`);
      },
      getRecords: async (collectionId: string): Promise<AxiosResponse<Record[]>> => {
        const api = await getAuthenticatedApi();
        return api.get(`/collections/${collectionId}/records`);
      },
      addRecord: async (collectionId: string, recordId: string): Promise<AxiosResponse<void>> => {
        const api = await getAuthenticatedApi();
        return api.put(`/collections/${collectionId}/records/${recordId}`);
      },
      removeRecord: async (collectionId: string, recordId: string): Promise<AxiosResponse<void>> => {
        const api = await getAuthenticatedApi();
        return api.delete(`/collections/${collectionId}/records/${recordId}`);
      },
      getShared: async (shareToken: string): Promise<AxiosResponse<Collection>> => {
        // Public endpoint - no auth required
        const publicApi = axios.create({
          baseURL: API_BASE_URL,
          headers: { 'Content-Type': 'application/json' }
        });
        return publicApi.get(`/collections/share/${shareToken}`);
      },
      saveShared: async (shareToken: string): Promise<AxiosResponse<Collection>> => {
        const api = await getAuthenticatedApi();
        return api.post(`/collections/share/${shareToken}/save`);
      }
    },

    // Records API
    records: {
      getAll: async (): Promise<AxiosResponse<Record[]>> => {
        const api = await getAuthenticatedApi();
        return api.get('/records/');
      },
      get: async (recordId: string): Promise<AxiosResponse<Record>> => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/${recordId}`);
      },
      update: async (recordId: string, recordData: Partial<RecordData>): Promise<AxiosResponse<Record>> => {
        const api = await getAuthenticatedApi();
        return api.patch(`/records/${recordId}`, recordData);
      },
      updateContent: async (recordId: string, content: string): Promise<AxiosResponse<Record>> => {
        const api = await getAuthenticatedApi();
        return api.patch(`/records/${recordId}/content`, null, {
          params: { content }
        });
      },
      delete: async (recordId: string): Promise<AxiosResponse<void>> => {
        const api = await getAuthenticatedApi();
        return api.delete(`/records/${recordId}`);
      },
      getPdf: async (recordId: string): Promise<AxiosResponse<Blob>> => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/${recordId}/pdf`, {
          responseType: 'blob'
        });
      },
      getShared: async (shareToken: string): Promise<AxiosResponse<Record>> => {
        // Public endpoint - no auth required
        const publicApi = axios.create({
          baseURL: API_BASE_URL,
          headers: { 'Content-Type': 'application/json' }
        });
        return publicApi.get(`/records/share/${shareToken}`);
      },
      getSharedPdf: async (shareToken: string): Promise<AxiosResponse<Blob>> => {
        const api = await getAuthenticatedApi();
        return api.get(`/records/share/${shareToken}/pdf`, {
          responseType: 'blob'
        });
      },
      saveShared: async (shareToken: string): Promise<AxiosResponse<Record>> => {
        const api = await getAuthenticatedApi();
        return api.post(`/records/share/${shareToken}/save`);
      },
      getUnorganized: async (): Promise<{ data: Record[] }> => {
        const api = await getAuthenticatedApi();
        const response = await api.get<Record[]>('/records/');
        // Filter records that don't belong to any collection
        const unorganizedRecords = response.data.filter(record => !record.collection_id);
        return { data: unorganizedRecords };
      }
    },

    // OCR API
    ocr: {
      processFiles: async (files: FileObject[]): Promise<AxiosResponse<Record[]>> => {
        const api = await getAuthenticatedApi();
        const formData = new FormData();
        
        files.forEach((file, index) => {
          // Ensure the file object has the correct properties for React Native FormData
          const fileObject = {
            uri: file.uri,
            type: file.type || file.mimeType || 'image/jpeg',
            name: file.filename || file.name || `file_${index}.jpg`
          } as any;
          
          formData.append('files', fileObject);
        });

        const url = '/ocr/get-text';
        
        return api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      },
      processFilesToCollection: async (files: FileObject[], collectionId: string): Promise<AxiosResponse<Record[]>> => {
        const api = await getAuthenticatedApi();
        const formData = new FormData();
        
        files.forEach((file, index) => {
          // Ensure the file object has the correct properties for React Native FormData
          const fileObject = {
            uri: file.uri,
            type: file.type || file.mimeType || 'image/jpeg',
            name: file.filename || file.name || `file_${index}.jpg`
          } as any;
          
          formData.append('files', fileObject);
        });

        const url = `/ocr/get-text?collection_id=${collectionId}`;
        
        return api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
    },

    // QR Code API
    qr: {
      getRecordQR: async (recordId: string): Promise<AxiosResponse<Blob>> => {
        const api = await getAuthenticatedApi();
        return api.post(`/qr/record/${recordId}`, {}, {
          responseType: 'blob'
        });
      },
      getCollectionQR: async (collectionId: string): Promise<AxiosResponse<Blob>> => {
        const api = await getAuthenticatedApi();
        return api.post(`/qr/collection/${collectionId}`, {}, {
          responseType: 'blob'
        });
      }
    }
  };
};
