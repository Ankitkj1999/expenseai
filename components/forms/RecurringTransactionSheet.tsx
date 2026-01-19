'use client';

import { useState, type ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { RecurringTransactionForm } from './RecurringTransactionForm';
import type { RecurringTransaction } from '@/lib/api/recurring';

interface RecurringTransactionSheetProps {
  mode: 'create' | 'edit';
  trigger: ReactNode;
  initialData?: RecurringTransaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RecurringTransactionSheet({
  mode,
  trigger,
  initialData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: RecurringTransactionSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-6">
        <SheetHeader className="space-y-2 pb-6 pt-6">
          <SheetTitle className="text-2xl">
            {mode === 'create' ? 'Create Recurring Transaction' : 'Edit Recurring Transaction'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Set up automatic recurring bills or income.'
              : 'Update your recurring transaction settings.'}
          </SheetDescription>
        </SheetHeader>
        <div className="pb-6">
          <RecurringTransactionForm
            mode={mode}
            initialData={initialData}
            onSuccess={handleSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
