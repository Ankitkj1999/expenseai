import axios from 'axios';

/**
 * Extended error type with validation details
 */
export interface ApiError extends Error {
  statusCode?: number;
  validationErrors?: Array<{ field: string; message: string }>;
}

/**
 * Base API client configured for HTTP-only cookie authentication
 * - Automatically includes credentials (cookies) in all requests
 * - 30 second timeout
 * - Prefixes all requests with /api
 */
export const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true, // HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for enhanced error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data;
      
      // Extract error message - backend uses 'error' field, some may use 'message'
      const message = data?.error || data?.message || error.response.statusText;
      
      // Attach validation details if present
      if (data?.details && Array.isArray(data.details)) {
        (error as ApiError).validationErrors = data.details;
      }
      
      // Attach status code for easier error handling
      (error as ApiError).statusCode = error.response.status;
      
      // Set user-friendly error message
      error.message = message;
      
      // Handle authentication errors - redirect to login
      if (error.response.status === 401) {
        // Only redirect if not already on auth pages
        if (typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/signup')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request made but no response
      error.message = 'No response from server. Please check your connection.';
    } else {
      // Something else happened
      error.message = error.message || 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);
