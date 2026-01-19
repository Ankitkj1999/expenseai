import ky from 'ky';

/**
 * Base API client configured for HTTP-only cookie authentication
 * - Automatically includes credentials (cookies) in all requests
 * - 30 second timeout
 * - Retries failed requests twice
 * - Prefixes all requests with /api
 */
export const api = ky.create({
  prefixUrl: '/api',
  credentials: 'include', // HTTP-only cookies
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'delete'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeError: [
      (error) => {
        const { response } = error;
        if (response && response.body) {
          error.name = 'APIError';
          error.message = `${response.status}: ${response.statusText}`;
        }
        return error;
      },
    ],
  },
});
