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
import { BudgetForm } from './BudgetForm';
import type { Budget } from '@/lib/api/budgets';

interface BudgetSheetProps {
  mode: 'create' | 'edit';
  trigger: ReactNode;
  initialData?: Budget;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BudgetSheet({
  mode,
  trigger,
  initialData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BudgetSheetProps) {
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
            {mode === 'create' ? 'Create New Budget' : 'Edit Budget'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Set spending limits to track and control your expenses.'
              : 'Update your budget settings and limits.'}
          </SheetDescription>
        </SheetHeader>
        <div className="pb-6">
          <BudgetForm
            mode={mode}
            initialData={initialData}
            onSuccess={handleSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
