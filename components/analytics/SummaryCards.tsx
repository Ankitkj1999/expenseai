"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  WalletIcon,
  PiggyBankIcon,
  AlertCircle
} from "lucide-react";
import { useAnalyticsSummary } from "@/lib/hooks/useAnalytics";
import { useCurrency } from "@/lib/hooks/useFormatting";

type Period = "today" | "week" | "month" | "year";

interface SummaryCardsProps {
  period?: Period;
}

export function SummaryCards({ period = "month" }: SummaryCardsProps) {
  const { formatCurrency, isLoading: preferencesLoading } = useCurrency();
  const { data: summary, isLoading: dataLoading, error } = useAnalyticsSummary({ period });

  // Show loading state if either preferences or data are loading
  const isLoading = preferencesLoading || dataLoading;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : "Unable to load summary data"}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Total Income", icon: TrendingUpIcon },
          { title: "Total Expenses", icon: WalletIcon },
          { title: "Net Savings", icon: PiggyBankIcon },
        ].map((item, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                No data available
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const savings = summary.netBalance;
  const savingsRate = summary.totalIncome > 0
    ? (savings / summary.totalIncome) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Income Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <div className="rounded-full bg-green-500/10 p-2">
            <TrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.transactionCount} transaction{summary.transactionCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Total Expense Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <div className="rounded-full bg-red-500/10 p-2">
            <WalletIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(summary.totalExpense)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.totalIncome > 0
              ? `${((summary.totalExpense / summary.totalIncome) * 100).toFixed(1)}% of income`
              : "No income recorded"}
          </p>
        </CardContent>
      </Card>

      {/* Net Savings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
          <div className={`rounded-full p-2 ${savings >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
            <PiggyBankIcon className={`h-4 w-4 ${savings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${savings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {savings >= 0 ? (
              <div className="flex items-center gap-1">
                <ArrowUpIcon className="h-5 w-5" />
                {formatCurrency(savings)}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <ArrowDownIcon className="h-5 w-5" />
                {formatCurrency(Math.abs(savings))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {savingsRate >= 0
              ? `${savingsRate.toFixed(1)}% savings rate`
              : `${Math.abs(savingsRate).toFixed(1)}% deficit`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
