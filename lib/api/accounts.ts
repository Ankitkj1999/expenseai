import { api } from './client';

export interface Account {
  _id: string;
  userId: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'wallet';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'wallet';
  balance: number;
  currency?: string;
  icon?: string;
  color?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: 'cash' | 'bank' | 'credit' | 'wallet';
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

interface AccountsResponse {
  success: boolean;
  data: {
    accounts: Account[];
    totalBalance: number;
    count: number;
  };
}

interface AccountResponse {
  success: boolean;
  data: Account;
}

/**
 * Accounts API functions
 */
export const accountsApi = {
  /**
   * Get all accounts
   */
  list: async (): Promise<Account[]> => {
    const response = await api.get<AccountsResponse>('accounts');
    return response.data.data.accounts;
  },

  /**
   * Create a new account
   */
  create: async (data: CreateAccountRequest): Promise<Account> => {
    const response = await api.post<AccountResponse>('accounts', data);
    return response.data.data;
  },

  /**
   * Update an account
   */
  update: async (id: string, data: UpdateAccountRequest): Promise<Account> => {
    const response = await api.put<AccountResponse>(`accounts/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete an account
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`accounts/${id}`);
  },
};
