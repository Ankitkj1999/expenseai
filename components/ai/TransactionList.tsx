'use client';

import { AIComponentCard } from './AIComponentCard';

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
  return (
    <AIComponentCard
      title="Recent Transactions"
      subtitle={`${count} found`}
      isEmpty={transactions.length === 0}
      emptyMessage="No transactions found for the selected period."
    >
      <div className="divide-y max-h-[320px] overflow-y-auto">
        {transactions.map((transaction) => {
          const isExpense = transaction.type === 'expense';
          const isIncome = transaction.type === 'income';
          
          return (
            <div key={transaction.id} className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center shrink-0 border
                  ${isExpense ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400' : 
                    isIncome ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-950/20 dark:border-green-900/40 dark:text-green-400' : 
                    'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400'}
                `}>
                  {isExpense ? <ArrowUpRight className="h-4 w-4" /> : 
                   isIncome ? <ArrowDownLeft className="h-4 w-4" /> : 
                   <ArrowRightLeft className="h-4 w-4" />}
                </div>
                
                <div className="min-w-0 flex flex-col gap-0.5">
                  <p className="font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors">
                    {transaction.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                    <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" />
                    <span className="font-medium">{transaction.category?.name || 'Uncategorized'}</span>
                  </p>
                </div>
              </div>
              
              <div className={`font-semibold text-sm whitespace-nowrap tabular-nums ${
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
    </AIComponentCard>
  );
}
