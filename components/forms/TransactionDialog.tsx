'use client';

import { useState, ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TransactionForm } from './TransactionForm';
import type { TransactionResponse } from '@/types';

interface TransactionDialogProps {
  trigger: ReactNode;
  mode: 'create' | 'edit';
  initialData?: TransactionResponse;
  onSuccess?: (data: TransactionResponse) => void;
}

export function TransactionDialog({
  trigger,
  mode,
  initialData,
  onSuccess,
}: TransactionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (data: TransactionResponse) => {
    setOpen(false);
    onSuccess?.(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <div className="px-6 py-6 space-y-6">
          <SheetHeader className="space-y-2">
            <SheetTitle className="text-2xl font-semibold">
              {mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
            </SheetTitle>
            <SheetDescription className="text-base text-muted-foreground">
              {mode === 'create'
                ? 'Record a new income, expense, or transfer'
                : 'Update transaction details'}
            </SheetDescription>
          </SheetHeader>
          <TransactionForm
            mode={mode}
            initialData={initialData}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
