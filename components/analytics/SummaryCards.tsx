"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, WalletIcon, PiggyBankIcon } from "lucide-react";
import { useAnalyticsSummary } from "@/lib/hooks/useAnalytics";

type Period = "today" | "week" | "month" | "year";

interface SummaryCardsProps {
  period?: Period;
}

export function SummaryCards({ period = "month" }: SummaryCardsProps) {
  const { data: summary, isLoading, error } = useAnalyticsSummary({ period });

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Unable to load data
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
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
    return null;
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
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${summary.totalIncome.toFixed(2)}
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
          <WalletIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${summary.totalExpense.toFixed(2)}
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
          <PiggyBankIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${savings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {savings >= 0 ? (
              <div className="flex items-center gap-1">
                <ArrowUpIcon className="h-5 w-5" />
                ${savings.toFixed(2)}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <ArrowDownIcon className="h-5 w-5" />
                ${Math.abs(savings).toFixed(2)}
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
