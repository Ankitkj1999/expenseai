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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransactionDialog({
  trigger,
  mode,
  initialData,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: TransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleSuccess = (data: TransactionResponse) => {
    setOpen(false);
    onSuccess?.(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto px-6">
        <SheetHeader className="space-y-2 pb-6 pt-6">
          <SheetTitle className="text-2xl">
            {mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Record a new income, expense, or transfer'
              : 'Update transaction details'}
          </SheetDescription>
        </SheetHeader>
        <div className="pb-6">
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
