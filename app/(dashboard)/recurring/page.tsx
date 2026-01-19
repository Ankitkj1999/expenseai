'use client';

import { useState } from 'react';
import {
  useRecurringTransactions,
  useDeleteRecurringTransaction,
  usePauseRecurringTransaction,
  useResumeRecurringTransaction,
} from '@/lib/hooks/useRecurringTransactions';
import { RecurringTransactionCard } from '@/components/recurring';
import { RecurringTransactionSheet } from '@/components/forms';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Repeat } from 'lucide-react';
import type { RecurringTransaction } from '@/lib/api/recurring';

export default function RecurringTransactionsPage() {
  const { data: transactions = [], isLoading, error } = useRecurringTransactions();
  const deleteTransactionMutation = useDeleteRecurringTransaction();
  const pauseTransactionMutation = usePauseRecurringTransaction();
  const resumeTransactionMutation = useResumeRecurringTransaction();
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);

  const handleDelete = (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete "${description}"?`)) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handlePause = (id: string) => {
    pauseTransactionMutation.mutate(id);
  };

  const handleResume = (id: string) => {
    resumeTransactionMutation.mutate(id);
  };

  const isActionLoading = 
    deleteTransactionMutation.isPending || 
    pauseTransactionMutation.isPending || 
    resumeTransactionMutation.isPending;

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load recurring transactions. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Recurring Transactions</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Manage your recurring bills and income
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Repeat className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No recurring transactions yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Set up automatic recurring bills or income to never miss a payment. Use the + button below to get started.
          </p>
        </div>
      )}

      {/* Transactions Grid */}
      {!isLoading && transactions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {transactions.map((transaction) => (
            <RecurringTransactionCard
              key={transaction._id}
              transaction={transaction}
              onEdit={setEditingTransaction}
              onDelete={handleDelete}
              onPause={handlePause}
              onResume={handleResume}
              isLoading={isActionLoading}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button with Sheet */}
      <RecurringTransactionSheet
        mode="create"
        trigger={<FloatingActionButton ariaLabel="Add recurring transaction" />}
      />

      {/* Edit Transaction Sheet */}
      <RecurringTransactionSheet
        mode="edit"
        initialData={editingTransaction || undefined}
        trigger={<div />}
        open={!!editingTransaction}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
      />
    </div>
  );
}
