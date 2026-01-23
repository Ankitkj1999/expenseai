'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api/transactions';
import { queryKeys } from '@/lib/constants/queryKeys';
import type { TransactionResponse, CreateTransactionRequest, UpdateTransactionRequest } from '@/types';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/utils/errorHandling';

/**
 * Hook to fetch all transactions
 */
export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions(),
    queryFn: transactionsApi.list,
  });
}

/**
 * Hook to create a new transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
      handleApiError(error, 'Failed to create transaction');
    },
  });
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionRequest }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update transaction:', error);
      handleApiError(error, 'Failed to update transaction');
    },
  });
}

/**
 * Hook to delete a transaction with optimistic updates
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    // Optimistically remove transaction from UI before server confirms
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions() });
      
      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData<TransactionResponse[]>(queryKeys.transactions());
      
      // Optimistically update to the new value
      if (previousTransactions) {
        queryClient.setQueryData<TransactionResponse[]>(
          queryKeys.transactions(),
          previousTransactions.filter((t) => t._id !== id)
        );
      }
      
      // Return context with the snapshot
      return { previousTransactions };
    },
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
    },
    onError: (error, _id, context) => {
      // Rollback to previous value on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKeys.transactions(), context.previousTransactions);
      }
      console.error('Failed to delete transaction:', error);
      handleApiError(error, 'Failed to delete transaction');
    },
    // Always refetch after error or success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
}
