"use client";

import * as React from "react";
import {
  SpendingTrendChart,
  CategoryBreakdownChart,
  ComparisonChart,
  SummaryCards,
} from "@/components/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Period = "today" | "week" | "month" | "year";

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState<Period>("month");

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case "today":
        return "Today";
      case "week":
        return "Last 7 Days";
      case "month":
        return "Last 30 Days";
      case "year":
        return "Last Year";
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col gap-4 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive insights into your financial data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period:</span>
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 lg:px-6">
        <SummaryCards period={period} />
      </div>

      {/* Spending Trend Chart - Full Width */}
      <div className="px-4 lg:px-6">
        <SpendingTrendChart
          defaultPeriod={period === "today" ? "week" : period === "week" ? "week" : period === "month" ? "month" : "year"}
        />
      </div>

      {/* Category Breakdown and Comparison - Side by Side */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <CategoryBreakdownChart period={period} />
          <ComparisonChart period={period} />
        </div>
      </div>

      {/* Additional Insights Section */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Insights</CardTitle>
            <CardDescription>
              Key observations for {getPeriodLabel(period).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Track Your Spending</p>
                  <p className="text-sm text-muted-foreground">
                    Review your category breakdown to identify areas where you can reduce expenses.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Monitor Trends</p>
                  <p className="text-sm text-muted-foreground">
                    Use the spending trends chart to understand your income and expense patterns over time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Compare Periods</p>
                  <p className="text-sm text-muted-foreground">
                    Check the period comparison to see how your current spending compares to previous periods.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
