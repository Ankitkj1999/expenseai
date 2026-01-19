'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionDialog } from '@/components/forms/TransactionDialog';

export function QuickAddButton() {
  return (
    <TransactionDialog
      mode="create"
      trigger={
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Transaction</span>
        </Button>
      }
    />
  );
}
