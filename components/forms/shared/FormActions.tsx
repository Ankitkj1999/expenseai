'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export function FormActions({
  isSubmitting,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
