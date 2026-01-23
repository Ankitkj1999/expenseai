'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  recurringTransactionsApi,
  type RecurringTransaction,
  type CreateRecurringTransactionRequest,
  type UpdateRecurringTransactionRequest,
} from '@/lib/api/recurring';
import { queryKeys } from '@/lib/constants/queryKeys';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/utils/errorHandling';

/**
 * Hook to fetch all recurring transactions
 */
export function useRecurringTransactions() {
  return useQuery({
    queryKey: queryKeys.recurring,
    queryFn: recurringTransactionsApi.list,
  });
}

/**
 * Hook to create a new recurring transaction
 */
export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringTransactionRequest) => recurringTransactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
      toast.success('Recurring transaction created successfully');
    },
    onError: (error) => {
      console.error('Failed to create recurring transaction:', error);
      handleApiError(error, 'Failed to create recurring transaction');
    },
  });
}

/**
 * Hook to update a recurring transaction
 */
export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringTransactionRequest }) =>
      recurringTransactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
      toast.success('Recurring transaction updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update recurring transaction:', error);
      handleApiError(error, 'Failed to update recurring transaction');
    },
  });
}

/**
 * Hook to delete a recurring transaction
 */
export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringTransactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
      toast.success('Recurring transaction deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete recurring transaction:', error);
      handleApiError(error, 'Failed to delete recurring transaction');
    },
  });
}

/**
 * Hook to pause a recurring transaction
 */
export function usePauseRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringTransactionsApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
      toast.success('Recurring transaction paused');
    },
    onError: (error) => {
      console.error('Failed to pause recurring transaction:', error);
      handleApiError(error, 'Failed to pause recurring transaction');
    },
  });
}

/**
 * Hook to resume a recurring transaction
 */
export function useResumeRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringTransactionsApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
      toast.success('Recurring transaction resumed');
    },
    onError: (error) => {
      console.error('Failed to resume recurring transaction:', error);
      handleApiError(error, 'Failed to resume recurring transaction');
    },
  });
}
