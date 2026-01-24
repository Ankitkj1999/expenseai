'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface AIComponentCardProps {
  title: string;
  subtitle?: string | number | ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function AIComponentCard({
  title,
  subtitle,
  children,
  className,
  action,
  isEmpty = false,
  emptyMessage = 'No data available'
}: AIComponentCardProps) {
  return (
    <div className={cn("w-full rounded-xl border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {subtitle && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {subtitle}
            </span>
          )}
          {action}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[160px]">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <span className="text-xl opacity-50">?</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              {emptyMessage}
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
