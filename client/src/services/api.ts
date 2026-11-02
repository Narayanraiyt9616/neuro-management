import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { IApiError } from '../types';

/**
 * BizNexus Central Axios HTTP Client
 * Configured with automatic base URL routing, timeout, and response interceptors.
 */
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request interceptor: attach auth tokens and tenant ID if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('biznexus_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const activeBizId = localStorage.getItem('biznexus_active_business_id');
    if (activeBizId && config.headers && !config.headers['x-business-id']) {
      config.headers['x-business-id'] = activeBizId;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor: standard error extraction
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: { response?: { data?: { message?: string; errors?: Array<{ field: string; message: string }> }; status?: number }; message?: string }) => {
    const errorPayload: IApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected network error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
      raw: error
    };
    return Promise.reject(errorPayload);
  }
);

export default apiClient;

