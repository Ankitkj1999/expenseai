'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Wallet, DollarSign, PiggyBank } from 'lucide-react';
import { useCurrency } from '@/lib/hooks/useFormatting';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { useAnalyticsSummary, useAnalyticsComparison } from '@/lib/hooks/useAnalytics';

interface SummaryCardProps {
  title: string;
  amount: number;
  change?: {
    value: number;
    period: string;
  };
  icon: React.ElementType;
  type: 'balance' | 'income' | 'expense' | 'savings';
}

function SummaryCard({ title, amount, change, icon: Icon, type }: SummaryCardProps) {
  const { formatCurrency } = useCurrency();
  const isPositive = change && change.value > 0;
  const colorClass = {
    balance: 'text-primary',
    income: 'text-chart-3',
    expense: 'text-destructive',
    savings: 'text-chart-2',
  }[type];

  const bgClass = {
    balance: 'bg-primary/10',
    income: 'bg-chart-3/10',
    expense: 'bg-destructive/10',
    savings: 'bg-chart-2/10',
  }[type];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">
            {formatCurrency(amount)}
          </h3>
          {change && (
            <div className="flex items-center mt-2 text-sm">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-chart-3 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive mr-1" />
              )}
              <span className={isPositive ? 'text-chart-3' : 'text-destructive'}>
                {isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-muted-foreground ml-1">{change.period}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${bgClass}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
      </div>
    </Card>
  );
}

export function SectionCards() {
  // Fetch data from APIs
  const { data: accountsData, isLoading: isLoadingAccounts } = useAccounts();
  const { data: summary, isLoading: isLoadingSummary } = useAnalyticsSummary({ period: 'month' });
  const { data: comparison, isLoading: isLoadingComparison } = useAnalyticsComparison({
    currentPeriod: 'month'
  });

  const isLoading = isLoadingAccounts || isLoadingSummary || isLoadingComparison;

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Extract data with fallbacks
  const summaryData = {
    balance: accountsData?.totalBalance ?? 0,
    income: summary?.totalIncome ?? 0,
    expense: summary?.totalExpense ?? 0,
    savings: summary?.netBalance ?? 0,
  };

  const changes = {
    balance: comparison?.change.net.percentage ?? 0,
    income: comparison?.change.income.percentage ?? 0,
    expense: comparison?.change.expense.percentage ?? 0,
    savings: comparison?.change.net.percentage ?? 0,
  };

  return (
    <div className="grid gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total Balance"
        amount={summaryData.balance}
        change={{ value: changes.balance, period: 'from last month' }}
        icon={Wallet}
        type="balance"
      />
      <SummaryCard
        title="Income"
        amount={summaryData.income}
        change={{ value: changes.income, period: 'from last month' }}
        icon={DollarSign}
        type="income"
      />
      <SummaryCard
        title="Expense"
        amount={summaryData.expense}
        change={{ value: changes.expense, period: 'from last month' }}
        icon={TrendingDown}
        type="expense"
      />
      <SummaryCard
        title="Savings"
        amount={summaryData.savings}
        change={{ value: changes.savings, period: 'from last month' }}
        icon={PiggyBank}
        type="savings"
      />
    </div>
  );
}
