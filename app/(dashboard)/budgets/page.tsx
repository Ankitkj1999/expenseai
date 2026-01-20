'use client';

import { useState } from 'react';
import { useBudgets, useDeleteBudget } from '@/lib/hooks/useBudgets';
import { BudgetCard } from '@/components/budgets';
import { BudgetSheet } from '@/components/forms';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Target } from 'lucide-react';
import type { Budget } from '@/lib/api/budgets';

export default function BudgetsPage() {
  const { data: budgets = [], isLoading, error } = useBudgets();
  const deleteBudgetMutation = useDeleteBudget();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteBudgetMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load budgets. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Budgets</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Set spending limits and track your progress
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && budgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Target className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No budgets yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create your first budget to start tracking and controlling your spending. Use the + button below to get started.
          </p>
        </div>
      )}

      {/* Budgets Grid */}
      {!isLoading && budgets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={setEditingBudget}
              onDelete={handleDelete}
              isDeleting={deleteBudgetMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button with Sheet */}
      <BudgetSheet
        mode="create"
        trigger={<FloatingActionButton ariaLabel="Add new budget" />}
      />

      {/* Edit Budget Sheet */}
      <BudgetSheet
        mode="edit"
        initialData={editingBudget || undefined}
        trigger={<div />}
        open={!!editingBudget}
        onOpenChange={(open) => {
          if (!open) setEditingBudget(null);
        }}
      />
    </div>
  );
}
