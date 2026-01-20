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
export type AccountType = 'cash' | 'bank' | 'credit' | 'wallet' | 'savings';

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

// Transaction types
export type TransactionType = 'expense' | 'income' | 'transfer';

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  description: string;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  tags?: string[];
  date?: string;
  attachments?: Array<{
    url: string;
    type: string;
    extractedData?: Record<string, unknown>;
  }>;
  aiGenerated?: boolean;
  metadata?: {
    location?: string;
    notes?: string;
  };
}

export interface UpdateTransactionRequest {
  type?: TransactionType;
  amount?: number;
  description?: string;
  accountId?: string;
  toAccountId?: string;
  categoryId?: string;
  tags?: string[];
  date?: string;
  attachments?: Array<{
    url: string;
    type: string;
    extractedData?: Record<string, unknown>;
  }>;
  aiGenerated?: boolean;
  metadata?: {
    location?: string;
    notes?: string;
  };
}

export interface TransactionResponse {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  accountId: string | AccountResponse;
  toAccountId?: string | AccountResponse;
  categoryId?: string | CategoryResponse;
  tags: string[];
  date: Date;
  attachments: Array<{
    url: string;
    type: string;
    extractedData?: Record<string, unknown>;
  }>;
  aiGenerated: boolean;
  metadata: {
    location?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionsListResponse {
  transactions: TransactionResponse[];
  total: number;
  limit: number;
  skip: number;
}

// Category types
export type CategoryType = 'expense' | 'income';

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
}

export interface CategoryResponse {
  _id: string;
  userId: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: Date;
}

export interface CategoriesListResponse {
  categories: CategoryResponse[];
  count: number;
}

// Budget types
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CreateBudgetRequest {
  name: string;
  categoryId?: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  alertThreshold?: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  categoryId?: string;
  amount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  alertThreshold?: number;
  isActive?: boolean;
}

export interface BudgetResponse {
  _id: string;
  userId: string;
  name: string;
  categoryId?: string | CategoryResponse;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  alertThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetStatusResponse {
  budget: BudgetResponse;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  shouldAlert: boolean;
}

export interface BudgetsListResponse {
  budgets: BudgetResponse[];
  count: number;
}
