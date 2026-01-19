import { api } from './client';

export interface RecurringTransaction {
  _id: string;
  userId: string;
  type: 'expense' | 'income';
  amount: number;
  description: string;
  accountId: {
    _id: string;
    name: string;
    type: string;
    color: string;
  } | string;
  categoryId: {
    _id: string;
    name: string;
    type: string;
    icon: string;
    color: string;
  } | string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  lastGeneratedDate?: string;
  isActive: boolean;
  metadata: {
    dayOfMonth?: number;
    dayOfWeek?: number;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionRequest {
  type: 'expense' | 'income';
  amount: number;
  description: string;
  accountId: string;
  categoryId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  startDate?: string;
  endDate?: string;
  metadata?: {
    dayOfMonth?: number;
    dayOfWeek?: number;
    notes?: string;
  };
}

export interface UpdateRecurringTransactionRequest {
  type?: 'expense' | 'income';
  amount?: number;
  description?: string;
  accountId?: string;
  categoryId?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  metadata?: {
    dayOfMonth?: number;
    dayOfWeek?: number;
    notes?: string;
  };
}

interface RecurringTransactionsResponse {
  success: boolean;
  data: {
    data: RecurringTransaction[];
    count: number;
  };
}

interface RecurringTransactionResponse {
  success: boolean;
  data: RecurringTransaction;
}

/**
 * Recurring Transactions API functions
 */
export const recurringTransactionsApi = {
  /**
   * Get all recurring transactions
   */
  list: async (): Promise<RecurringTransaction[]> => {
    const response = await api.get<RecurringTransactionsResponse>('recurring-transactions');
    return response.data.data.data;
  },

  /**
   * Create a new recurring transaction
   */
  create: async (data: CreateRecurringTransactionRequest): Promise<RecurringTransaction> => {
    const response = await api.post<RecurringTransactionResponse>('recurring-transactions', data);
    return response.data.data;
  },

  /**
   * Update a recurring transaction
   */
  update: async (id: string, data: UpdateRecurringTransactionRequest): Promise<RecurringTransaction> => {
    const response = await api.put<RecurringTransactionResponse>(`recurring-transactions/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a recurring transaction
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`recurring-transactions/${id}`);
  },

  /**
   * Pause a recurring transaction
   */
  pause: async (id: string): Promise<RecurringTransaction> => {
    const response = await api.post<RecurringTransactionResponse>(`recurring-transactions/${id}/pause`);
    return response.data.data;
  },

  /**
   * Resume a recurring transaction
   */
  resume: async (id: string): Promise<RecurringTransaction> => {
    const response = await api.post<RecurringTransactionResponse>(`recurring-transactions/${id}/resume`);
    return response.data.data;
  },
};
