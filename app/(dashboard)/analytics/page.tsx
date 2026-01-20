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

type Period = "today" | "week" | "month" | "year";

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState<Period>("month");

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
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

      {/* Income vs Expense Trend Chart - Full Width */}
      <div className="px-4 lg:px-6">
        <SpendingTrendChart
          defaultPeriod={period === "today" ? "week" : period === "week" ? "week" : period === "month" ? "month" : "year"}
        />
      </div>

      {/* Category Breakdown and Comparison - Side by Side */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <CategoryBreakdownChart period={period} />
          <ComparisonChart period={period} />
        </div>
      </div>
    </div>
  );
}
