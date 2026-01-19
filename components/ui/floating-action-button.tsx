'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface FloatingActionButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function FloatingActionButton({
  onClick,
  children,
  className,
  ariaLabel = 'Add new item',
}: FloatingActionButtonProps) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      className={cn(
        'fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50',
        'sm:bottom-6 sm:right-6',
        'md:h-16 md:w-16',
        'hover:scale-105 active:scale-95',
        className
      )}
      aria-label={ariaLabel}
    >
      {children || <Plus className="h-6 w-6" />}
      <span className="sr-only">{ariaLabel}</span>
    </Button>
  );
}
