'use client';

import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  description: string;
  date: string;
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
  account?: {
    name: string;
  };
  toAccount?: {
    name: string;
  };
}

interface TransactionListProps {
  transactions: Transaction[];
  count: number;
  currency: string;
}

export function TransactionList({ transactions, count, currency }: TransactionListProps) {
  if (!transactions.length) {
    return (
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <h3 className="font-semibold">Recent Transactions</h3>
          <span className="text-xs text-muted-foreground">0 found</span>
        </div>
        <div className="p-6 text-center text-muted-foreground">
          No transactions found for the selected period.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold">Recent Transactions</h3>
        <span className="text-xs text-muted-foreground">{count} found</span>
      </div>
      <div className="divide-y max-h-[300px] overflow-y-auto">
        {transactions.map((transaction) => {
          const isExpense = transaction.type === 'expense';
          const isIncome = transaction.type === 'income';
          
          return (
            <div key={transaction.id} className="p-3 hover:bg-muted/50 transition-colors flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${isExpense ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 
                    isIncome ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}
                `}>
                  {isExpense ? <ArrowUpRight className="h-4 w-4" /> : 
                   isIncome ? <ArrowDownLeft className="h-4 w-4" /> : 
                   <ArrowRightLeft className="h-4 w-4" />}
                </div>
                
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {format(new Date(transaction.date), 'MMM d, yyyy')} • 
                    {transaction.category?.name || 'Uncategorized'}
                  </p>
                </div>
              </div>
              
              <div className={`font-semibold text-sm whitespace-nowrap ${
                isExpense ? 'text-red-600 dark:text-red-400' : 
                isIncome ? 'text-green-600 dark:text-green-400' : 
                'text-blue-600 dark:text-blue-400'
              }`}>
                {isExpense ? '-' : '+'}{currency}{transaction.amount.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
