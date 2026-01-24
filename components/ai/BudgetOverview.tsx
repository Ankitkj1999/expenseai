'use client';

import { AIComponentCard } from './AIComponentCard';

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
  return (
    <AIComponentCard
      title="Budget Status"
      subtitle={`${count} active`}
      isEmpty={budgets.length === 0}
      emptyMessage="No active budgets found. You can set up a budget to track your spending."
    >
      <div className="p-4 space-y-6 max-h-[320px] overflow-y-auto">
        {budgets.map((item, index) => (
          <div key={index} className="space-y-2.5">
            <div className="flex justify-between items-end gap-4">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate" title={item.budget.name}>
                    {item.budget.name}
                  </span>
                  {item.isOverBudget && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      <AlertTriangle className="h-3 w-3" />
                      Over
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                   <span className={item.isOverBudget ? "text-destructive font-medium" : "text-foreground font-medium"}>
                     {currency}{item.spent.toLocaleString()}
                   </span>
                   <span className="text-muted-foreground/60">/</span>
                   <span>{currency}{item.budget.amount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className={`text-right text-xs font-semibold ${
                item.isOverBudget ? 'text-destructive' : 
                item.shouldAlert ? 'text-orange-600 dark:text-orange-400' : 
                'text-primary'
              }`}>
                {item.percentage.toFixed(0)}%
              </div>
            </div>
            
            <div className="relative">
              <Progress 
                value={Math.min(item.percentage, 100)} 
                className={`h-2.5 bg-secondary/50 ${item.isOverBudget ? 'bg-red-100 dark:bg-red-950/40' : ''}`}
                indicatorClassName={
                  item.isOverBudget ? 'bg-destructive' : 
                  item.shouldAlert ? 'bg-orange-500' : 
                  'bg-primary'
                }
              />
            </div>
            
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              {item.isOverBudget ? (
                <span className="text-destructive font-medium">
                  exceeded by {currency}{Math.abs(item.remaining).toLocaleString()}
                </span>
              ) : (
                 <span>
                   {currency}{item.remaining.toLocaleString()} left
                 </span>
              )}
               <span className="opacity-75">
                 Reset: {new Date(item.budget.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
               </span>
            </div>
            
            {/* Divider if not last */}
            {index < budgets.length - 1 && (
              <div className="pt-2 border-b border-dashed border-muted/60" />
            )}
          </div>
        ))}
      </div>
    </AIComponentCard>
  );
}
