'use client';

import { Plus } from 'lucide-react';
import { TransactionDialog } from '@/components/forms/TransactionDialog';
import { FloatingActionButton } from '@/components/ui/floating-action-button';

export function QuickAddButton() {
  return (
    <TransactionDialog
      mode="create"
      trigger={
        <FloatingActionButton ariaLabel="Add transaction">
          <Plus className="h-6 w-6" />
        </FloatingActionButton>
      }
    />
  );
}
