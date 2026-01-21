'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi, type Account, type AccountsListResult, type CreateAccountRequest, type UpdateAccountRequest } from '@/lib/api/accounts';
import { queryKeys } from '@/lib/constants/queryKeys';
import { toast } from 'sonner';

/**
 * Hook to fetch all accounts with total balance
 * Accounts are cached for 2 minutes since they change moderately
 */
export function useAccounts() {
  return useQuery<AccountsListResult>({
    queryKey: queryKeys.accounts,
    queryFn: accountsApi.list,
    staleTime: 2 * 60 * 1000, // 2 minutes - accounts change moderately
  });
}

/**
 * Hook to create a new account
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      toast.success('Account created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create account:', error);
      toast.error('Failed to create account');
    },
  });
}

/**
 * Hook to update an account
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
      accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      toast.success('Account updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update account:', error);
      toast.error('Failed to update account');
    },
  });
}

/**
 * Hook to delete an account with optimistic updates
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accounts });
      
      const previousData = queryClient.getQueryData<AccountsListResult>(queryKeys.accounts);
      
      if (previousData) {
        queryClient.setQueryData<AccountsListResult>(queryKeys.accounts, {
          ...previousData,
          accounts: previousData.accounts.filter((acc) => acc._id !== id),
        });
      }
      
      return { previousData };
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.accounts, context.previousData);
      }
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}
