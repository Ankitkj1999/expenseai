'use client';

import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { AIInsights, RecentTransactionsTable } from '@/components/dashboard';
import { useTransactions } from '@/lib/hooks/useTransactions';

export default function DashboardPage() {
  const { data: transactions = [], isLoading } = useTransactions();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Summary Cards */}
      <SectionCards />

      {/* Chart and AI Insights Row */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {/* Spending Trend Chart */}
          <div className="w-full">
            <ChartAreaInteractive />
          </div>

          {/* AI Insights */}
          <div className="w-full">
            <AIInsights />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="px-4 lg:px-6">
        <RecentTransactionsTable 
          transactions={transactions} 
          isLoading={isLoading}
          limit={10}
        />
      </div>
    </div>
  );
}
