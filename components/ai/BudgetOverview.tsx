'use client';

import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Budget {
  budget: {
    id: string;
    name: string;
    amount: number;
    period: string;
    startDate: string;
    endDate: string;
  };
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  shouldAlert: boolean;
}

interface BudgetOverviewProps {
  budgets: Budget[];
  count: number;
  currency: string;
}

export function BudgetOverview({ budgets, count, currency }: BudgetOverviewProps) {
  if (!budgets.length) {
    return (
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <h3 className="font-semibold">Budget Status</h3>
          <span className="text-xs text-muted-foreground">0 found</span>
        </div>
        <div className="p-6 text-center text-muted-foreground">
          No active budgets found. You can set up a budget to track your spending.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold">Budget Status</h3>
        <span className="text-xs text-muted-foreground">{count} found</span>
      </div>
      <div className="p-4 space-y-5 max-h-[300px] overflow-y-auto">
        {budgets.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate" title={item.budget.name}>{item.budget.name}</span>
                {item.isOverBudget && (
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}
              </div>
              <span className="text-muted-foreground shrink-0 whitespace-nowrap">
                {currency}{item.spent.toLocaleString()} / {currency}{item.budget.amount.toLocaleString()}
              </span>
            </div>
            
            <Progress 
              value={Math.min(item.percentage, 100)} 
              className={`h-2 ${item.isOverBudget ? 'bg-red-100 dark:bg-red-950/40' : ''}`}
              indicatorClassName={
                item.isOverBudget ? 'bg-destructive' : 
                item.shouldAlert ? 'bg-orange-500' : 
                'bg-primary'
              }
            />
            
            <div className="flex justify-between items-center text-xs">
              <span className={`${
                item.isOverBudget ? 'text-destructive font-medium' : 
                item.shouldAlert ? 'text-orange-600 font-medium' : 
                'text-muted-foreground'
              }`}>
                {item.percentage.toFixed(0)}% used
              </span>
              <span className="text-muted-foreground">
                {item.isOverBudget 
                  ? `${currency}${Math.abs(item.remaining).toLocaleString()} over` 
                  : `${currency}${item.remaining.toLocaleString()} left`
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
