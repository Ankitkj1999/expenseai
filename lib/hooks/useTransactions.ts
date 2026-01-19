'use client';

import { useState, useEffect, useCallback } from 'react';
import { transactionsApi } from '@/lib/api/transactions';
import type { TransactionResponse } from '@/types';
import { toast } from 'sonner';

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionsApi.list();
      setTransactions(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to load transactions');
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const deleteTransaction = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error('Failed to delete transaction');
      throw error;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
    deleteTransaction,
  };
}
