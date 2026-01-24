'use client';

import { AIComponentCard } from './AIComponentCard';

interface SpendingSummaryProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  period: { start: string; end: string };
  currency: string;
}

export function SpendingSummary({
  totalIncome,
  totalExpense,
  netBalance,
  transactionCount,
  period,
  currency
}: SpendingSummaryProps) {
  return (
    <AIComponentCard 
      title="Monthly Summary" 
      subtitle={`${transactionCount} transactions`}
    >
      <div className="p-4 space-y-4">
        {/* Income/Expense Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Income</p>
            </div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tracking-tight">
              {currency}{totalIncome.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-rose-50/50 dark:bg-rose-950/10 p-3 rounded-xl border border-rose-100/50 dark:border-rose-900/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">Expenses</p>
            </div>
            <p className="text-lg font-bold text-rose-700 dark:text-rose-300 tracking-tight">
              {currency}{totalExpense.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Net Balance */}
        <div className={`p-4 rounded-xl border transition-colors ${
          netBalance >= 0
            ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/50'
            : 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-100/50 dark:border-orange-900/50'
        }`}>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Net Balance</p>
              <p className={`text-2xl font-bold tracking-tight ${
                netBalance >= 0
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                {netBalance >= 0 ? '' : '-'}{currency}{Math.abs(netBalance).toLocaleString()}
              </p>
            </div>
            <div className={`text-xs px-2 py-1 rounded-md font-medium ${
               netBalance >= 0
               ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
               : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
            }`}>
              {netBalance >= 0 ? 'On Track' : 'Overspending'}
            </div>
          </div>
        </div>

        {/* Period Footer */}
        <div className="flex items-center justify-center pt-2 border-t border-dashed">
          <p className="text-[10px] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {new Date(period.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
            {' - '} 
            {new Date(period.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </AIComponentCard>
  );
}
