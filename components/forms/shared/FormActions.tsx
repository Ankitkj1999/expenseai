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
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-6 border-t">
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {cancelLabel}
        </Button>
      )}
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
