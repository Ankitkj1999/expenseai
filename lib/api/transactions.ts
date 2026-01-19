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
    const response = await api.get('transactions').json<TransactionsListResponse>();
    return response.transactions;
  },

  /**
   * Create a new transaction
   */
  create: async (data: CreateTransactionRequest): Promise<TransactionResponse> => {
    const response = await api
      .post('transactions', { json: data })
      .json<{ success: boolean; data: TransactionResponse }>();
    return response.data;
  },

  /**
   * Update a transaction
   */
  update: async (
    id: string,
    data: UpdateTransactionRequest
  ): Promise<TransactionResponse> => {
    const response = await api
      .put(`transactions/${id}`, { json: data })
      .json<{ success: boolean; data: TransactionResponse }>();
    return response.data;
  },

  /**
   * Delete a transaction
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`transactions/${id}`);
  },
};
