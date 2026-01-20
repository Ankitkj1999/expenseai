'use client';

import { useState } from 'react';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { TransactionDialog } from '@/components/forms/TransactionDialog';
import { QuickAddButton } from '@/components/transactions/QuickAddButton';
import { useTransactions, useDeleteTransaction } from '@/lib/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TransactionResponse } from '@/types';

export default function TransactionsPage() {
  const { data: transactions = [], isLoading, error } = useTransactions();
  const deleteTransactionMutation = useDeleteTransaction();
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleEdit = (transaction: TransactionResponse) => {
    setEditingTransaction(transaction);
  };

  const handleEditSuccess = () => {
    setEditingTransaction(null);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load transactions. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Manage your income, expenses, and transfers
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Start tracking your finances by adding your first transaction using the button below.
          </p>
        </div>
      )}

      {/* Transactions List */}
      {!isLoading && transactions.length > 0 && (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction._id}
              transaction={transaction}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Quick Add Button (FAB) */}
      <QuickAddButton />

      {/* Edit Dialog */}
      {editingTransaction && (
        <TransactionDialog
          mode="edit"
          initialData={editingTransaction}
          onSuccess={handleEditSuccess}
          trigger={<div />} // Hidden trigger, controlled by state
        />
      )}
    </div>
  );
}
