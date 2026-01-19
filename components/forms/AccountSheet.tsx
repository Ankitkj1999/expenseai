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
import { AccountForm } from './AccountForm';
import type { Account } from '@/lib/api/accounts';

interface AccountSheetProps {
  mode: 'create' | 'edit';
  trigger: ReactNode;
  initialData?: Account;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AccountSheet({
  mode,
  trigger,
  initialData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AccountSheetProps) {
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
            {mode === 'create' ? 'Create New Account' : 'Edit Account'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Add a new account to track your finances. Fill in the details below.'
              : 'Update your account information. Changes will be saved immediately.'}
          </SheetDescription>
        </SheetHeader>
        <div className="pb-6">
          <AccountForm
            mode={mode}
            initialData={initialData}
            onSuccess={handleSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
