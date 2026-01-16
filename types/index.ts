import { IUser } from '@/lib/db/models/User';

// Auth request/response types
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}

export interface UserResponse {
  user: {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

// JWT payload type
export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Authenticated request type
export interface AuthenticatedUser {
  id: string;
  email: string;
}

export type { IUser };

// Account types
export type AccountType = 'cash' | 'bank' | 'credit' | 'wallet';

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export interface AccountResponse {
  _id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountsListResponse {
  accounts: AccountResponse[];
  totalBalance: number;
  count: number;
}
