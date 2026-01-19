"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useAnalyticsComparison } from "@/lib/hooks/useAnalytics";

const chartConfig = {
  current: {
    label: "Current Period",
    color: "hsl(var(--chart-1))",
  },
  previous: {
    label: "Previous Period",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Period = "today" | "week" | "month" | "year";

interface ComparisonChartProps {
  period?: Period;
}

const ChangeIndicator = ({ value, percentage }: { value: number; percentage: number }) => {
  const isPositive = value > 0;

  if (value === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        No change
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      {isPositive ? (
        <ArrowUpIcon className="h-4 w-4" />
      ) : (
        <ArrowDownIcon className="h-4 w-4" />
      )}
      <span className="font-medium">
        {Math.abs(percentage).toFixed(1)}%
      </span>
      <span className="text-muted-foreground">
        (${Math.abs(value).toFixed(2)})
      </span>
    </div>
  );
};

const getPeriodLabel = (p: Period) => {
  switch (p) {
    case "today":
      return "Today vs Yesterday";
    case "week":
      return "This Week vs Last Week";
    case "month":
      return "This Month vs Last Month";
    case "year":
      return "This Year vs Last Year";
  }
};

export function ComparisonChart({ period = "month" }: ComparisonChartProps) {
  const { data: comparison, isLoading, error } = useAnalyticsComparison({
    currentPeriod: period,
  });

  const chartData = React.useMemo(() => {
    if (!comparison) return [];

    return [
      {
        metric: "Income",
        current: comparison.current.totalIncome,
        previous: comparison.previous.totalIncome,
      },
      {
        metric: "Expense",
        current: comparison.current.totalExpense,
        previous: comparison.previous.totalExpense,
      },
      {
        metric: "Net",
        current: comparison.current.netBalance,
        previous: comparison.previous.netBalance,
      },
    ];
  }, [comparison]);

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Period Comparison</CardTitle>
          <CardDescription>Unable to load comparison data</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Period Comparison</CardTitle>
        <CardDescription>{getPeriodLabel(period)}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : !comparison ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No comparison data available
          </div>
        ) : (
          <div className="space-y-6">
            <ChartContainer
              config={chartConfig}
              className="h-[250px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="metric"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      formatter={(value, name) => (
                        <>
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                            style={
                              {
                                "--color-bg": `var(--color-${name})`,
                              } as React.CSSProperties
                            }
                          />
                          {chartConfig[name as keyof typeof chartConfig]?.label || name}
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            ${Number(value).toFixed(2)}
                          </div>
                        </>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="previous"
                  fill="var(--color-previous)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="current"
                  fill="var(--color-current)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>

            {/* Change Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Income Change</p>
                <ChangeIndicator
                  value={comparison.change.income.amount}
                  percentage={comparison.change.income.percentage}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Expense Change</p>
                <ChangeIndicator
                  value={comparison.change.expense.amount}
                  percentage={comparison.change.expense.percentage}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Net Change</p>
                <ChangeIndicator
                  value={comparison.change.net.amount}
                  percentage={comparison.change.net.percentage}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
