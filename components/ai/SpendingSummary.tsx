'use client';

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
    <div className="rounded-lg border bg-card p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
        <h3 className="font-semibold text-lg">Monthly Summary</h3>
      </div>

      {/* Income/Expense Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Income</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {currency}{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Expenses</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {currency}{totalExpense.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Net Balance */}
      <div className={`p-4 rounded-lg border ${
        netBalance >= 0
          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
          : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
      }`}>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Net Balance</p>
        <p className={`text-3xl font-bold ${
          netBalance >= 0
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-orange-700 dark:text-orange-300'
        }`}>
          {netBalance >= 0 ? '' : '-'}{currency}{Math.abs(netBalance).toLocaleString()}
        </p>
      </div>

      {/* Period and Transaction Count */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
        </span>
        <span>{transactionCount} transactions</span>
      </div>
    </div>
  );
}
