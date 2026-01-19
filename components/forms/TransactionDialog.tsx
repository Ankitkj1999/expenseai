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
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Record a new income, expense, or transfer'
              : 'Update transaction details'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
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
