'use client';

import { useState } from 'react';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionDialog } from '@/components/forms/TransactionDialog';
import { QuickAddButton } from '@/components/transactions/QuickAddButton';
import { useTransactions, useDeleteTransaction } from '@/lib/hooks/useTransactions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { TransactionResponse } from '@/types';

export default function TransactionsPage() {
  const { data: transactions = [], isLoading, error } = useTransactions();
  const deleteTransactionMutation = useDeleteTransaction();
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleEdit = (transaction: TransactionResponse) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditingTransaction(null);
    setIsEditDialogOpen(false);
  };

  const handleEditCancel = () => {
    setEditingTransaction(null);
    setIsEditDialogOpen(false);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Manage your income, expenses, and transfers
        </p>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Quick Add Button (FAB) */}
      <QuickAddButton />

      {/* Edit Dialog */}
      {editingTransaction && (
        <TransactionDialog
          mode="edit"
          initialData={editingTransaction}
          onSuccess={handleEditSuccess}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleEditCancel();
            }
          }}
          trigger={<div />}
        />
      )}
    </div>
  );
}
