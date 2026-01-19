import { api } from './client';
import type { IUser } from '@/types';

// Type alias for convenience
type User = IUser;

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  success: boolean;
  data: User;
  message?: string;
}

/**
 * Authentication API functions
 * All functions use HTTP-only cookies for session management
 */
export const authApi = {
  /**
   * Get current authenticated user
   * Returns null if not authenticated
   */
  me: async (): Promise<User | null> => {
    try {
      const response = await api.get<AuthResponse>('auth/me');
      return response.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Login with email and password
   * Sets HTTP-only cookie on success
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post<AuthResponse>('auth/login', credentials);
    return response.data.data;
  },

  /**
   * Register new user
   * Sets HTTP-only cookie on success
   */
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<AuthResponse>('auth/register', data);
    return response.data.data;
  },

  /**
   * Logout current user
   * Clears HTTP-only cookie
   */
  logout: async (): Promise<void> => {
    await api.post('auth/logout');
  },
};
