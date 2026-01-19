import { api } from './client';
import type {
  TransactionResponse,
  TransactionsListResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '@/types';

/**
 * Transaction API functions
 */
export const transactionsApi = {
  /**
   * Get all transactions
   */
  list: async (): Promise<TransactionResponse[]> => {
    const response = await api.get<TransactionsListResponse>('transactions');
    return response.data.transactions;
  },

  /**
   * Create a new transaction
   */
  create: async (data: CreateTransactionRequest): Promise<TransactionResponse> => {
    const response = await api.post<{ success: boolean; data: TransactionResponse }>(
      'transactions',
      data
    );
    return response.data.data;
  },

  /**
   * Update a transaction
   */
  update: async (
    id: string,
    data: UpdateTransactionRequest
  ): Promise<TransactionResponse> => {
    const response = await api.put<{ success: boolean; data: TransactionResponse }>(
      `transactions/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a transaction
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`transactions/${id}`);
  },
};
