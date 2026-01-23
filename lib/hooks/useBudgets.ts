'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, type Budget, type CreateBudgetRequest, type UpdateBudgetRequest } from '@/lib/api/budgets';
import { queryKeys } from '@/lib/constants/queryKeys';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/utils/errorHandling';

/**
 * Hook to fetch all budgets
 */
export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets,
    queryFn: budgetsApi.list,
  });
}

/**
 * Hook to create a new budget
 */
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => budgetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      toast.success('Budget created successfully');
    },
    onError: (error) => {
      console.error('Failed to create budget:', error);
      handleApiError(error, 'Failed to create budget');
    },
  });
}

/**
 * Hook to update a budget
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetRequest }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      toast.success('Budget updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update budget:', error);
      handleApiError(error, 'Failed to update budget');
    },
  });
}

/**
 * Hook to delete a budget with optimistic updates
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets });
      
      const previousBudgets = queryClient.getQueryData<Budget[]>(queryKeys.budgets);
      
      if (previousBudgets) {
        queryClient.setQueryData<Budget[]>(
          queryKeys.budgets,
          previousBudgets.filter((b) => b._id !== id)
        );
      }
      
      return { previousBudgets };
    },
    onSuccess: () => {
      toast.success('Budget deleted successfully');
    },
    onError: (error, _id, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(queryKeys.budgets, context.previousBudgets);
      }
      console.error('Failed to delete budget:', error);
      handleApiError(error, 'Failed to delete budget');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
    },
  });
}
