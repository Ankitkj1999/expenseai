import axios from 'axios';

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText;
      error.message = `${error.response.status}: ${message}`;
    } else if (error.request) {
      // Request made but no response
      error.message = 'No response from server';
    }
    return Promise.reject(error);
  }
);
