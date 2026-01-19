'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api/transactions';
import { queryKeys } from '@/lib/constants/queryKeys';
import type { TransactionResponse, CreateTransactionRequest, UpdateTransactionRequest } from '@/types';
import { toast } from 'sonner';

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
    onError: (error: Error) => {
      console.error('Failed to create transaction:', error);
      toast.error('Failed to create transaction');
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
    onError: (error: Error) => {
      console.error('Failed to update transaction:', error);
      toast.error('Failed to update transaction');
    },
  });
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete transaction:', error);
      toast.error('Failed to delete transaction');
    },
  });
}
