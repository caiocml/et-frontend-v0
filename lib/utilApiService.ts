import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Define the base URL for your API
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
const API_BASE_URL = 'http://localhost:8081/api/';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add a request interceptor to handle authentication
apiClient.interceptors.request.use(
  (config) => {
    // Check if we have a token in localStorage (in a real app, consider using a more secure storage for tokens)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token && config.headers) {
      // Add token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear auth cookie
        document.cookie = "user=; path=/; max-age=0";
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * UtilApiService provides methods for making HTTP requests to the backend API
 */
export const UtilApiService = {
  /**
   * Make a GET request to the specified path
   * @param path - The API endpoint path (without the base URL)
   * @param config - Optional Axios request configuration
   * @returns A promise that resolves with the response data
   */
  async get<T = any>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.get(path, config);
      return response.data;
    } catch (error) {
      console.error(`GET request to ${path} failed:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request to the specified path with the provided data
   * @param path - The API endpoint path (without the base URL)
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns A promise that resolves with the response data
   */
  async post<T = any>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(path, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST request to ${path} failed:`, error);
      throw error;
    }
  },

  /**
   * Make a PUT request to the specified path with the provided data
   * @param path - The API endpoint path (without the base URL)
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns A promise that resolves with the response data
   */
  async put<T = any>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(path, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT request to ${path} failed:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request to the specified path
   * @param path - The API endpoint path (without the base URL)
   * @param config - Optional Axios request configuration
   * @returns A promise that resolves with the response data
   */
  async delete<T = any>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(path, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE request to ${path} failed:`, error);
      throw error;
    }
  }
};

export default UtilApiService; 