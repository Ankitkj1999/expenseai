import { api } from './client';
import type {
  TransactionResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '@/types';

interface PaginatedTransactionResponse {
  success: boolean;
  data: TransactionResponse[];
  total: number;
  limit: number;
  skip: number;
  count: number;
}

/**
 * Transaction API functions
 */
export const transactionsApi = {
  /**
   * Get all transactions
   */
  list: async (): Promise<TransactionResponse[]> => {
    const response = await api.get<PaginatedTransactionResponse>('transactions');
    return response.data.data;
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
