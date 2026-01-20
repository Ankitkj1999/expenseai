"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useAnalyticsTrends } from "@/lib/hooks/useAnalytics";

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(142 76% 36%)", // Green for income
  },
  expense: {
    label: "Expense",
    color: "hsl(0 84% 60%)", // Red for expense
  },
  net: {
    label: "Net Savings",
    color: "hsl(217 91% 60%)", // Blue for net
  },
} satisfies ChartConfig;

type Period = "week" | "month" | "year";
type GroupBy = "day" | "week" | "month";
type DataView = "all" | "income" | "expense" | "net";

interface SpendingTrendChartProps {
  defaultPeriod?: Period;
}

export function SpendingTrendChart({ defaultPeriod = "month" }: SpendingTrendChartProps) {
  const isMobile = useIsMobile();
  const [period, setPeriod] = React.useState<Period>(defaultPeriod);
  const [groupBy, setGroupBy] = React.useState<GroupBy>("day");
  const [dataView, setDataView] = React.useState<DataView>("all");

  // Adjust groupBy based on period
  React.useEffect(() => {
    if (period === "week") {
      setGroupBy("day");
    } else if (period === "month") {
      setGroupBy(isMobile ? "week" : "day");
    } else if (period === "year") {
      setGroupBy("month");
    }
  }, [period, isMobile]);

  const { data: trends, isLoading, error } = useAnalyticsTrends({ period, groupBy });

  const formatDate = (dateStr: string) => {
    // Handle different date formats
    if (dateStr.includes("W")) {
      // Week format: 2024-W12
      const [year, week] = dateStr.split("-W");
      return `Week ${week}`;
    } else if (dateStr.length === 7) {
      // Month format: 2024-01
      const date = new Date(dateStr + "-01");
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } else {
      // Day format: 2024-01-15
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Calculate totals and trends
  const stats = React.useMemo(() => {
    if (!trends || !Array.isArray(trends) || trends.length === 0) return null;

    const totalIncome = trends.reduce((sum, item) => sum + (item.income || 0), 0);
    const totalExpense = trends.reduce((sum, item) => sum + (item.expense || 0), 0);
    const netSavings = totalIncome - totalExpense;

    // Calculate trend (comparing first half vs second half)
    const midpoint = Math.floor(trends.length / 2);
    const firstHalf = trends.slice(0, midpoint);
    const secondHalf = trends.slice(midpoint);

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, item) => sum + (item.expense || 0), 0) / firstHalf.length
      : 0;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, item) => sum + (item.expense || 0), 0) / secondHalf.length
      : 0;
    const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      trendPercentage,
      isIncreasing: trendPercentage > 0,
    };
  }, [trends]);

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Income vs Expense Over Time</CardTitle>
          <CardDescription>Track your financial trends</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Unable to load trend data"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-start @[540px]/card:justify-between">
          <div className="space-y-1">
            <CardTitle>Income vs Expense Over Time</CardTitle>
            <CardDescription>
              Track your financial trends and patterns
            </CardDescription>
            {stats && !isLoading && (
              <div className="flex items-center gap-4 pt-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Net:</span>
                  <span className={`font-semibold ${stats.netSavings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    ${Math.abs(stats.netSavings).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {stats.isIncreasing ? (
                    <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  <span className="text-muted-foreground">
                    {Math.abs(stats.trendPercentage).toFixed(1)}% {stats.isIncreasing ? "increase" : "decrease"}
                  </span>
                </div>
              </div>
            )}
          </div>
          <CardAction>
            <ToggleGroup
              type="single"
              value={dataView}
              onValueChange={(value) => value && setDataView(value as DataView)}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="income">Income</ToggleGroupItem>
              <ToggleGroupItem value="expense">Expenses</ToggleGroupItem>
              <ToggleGroupItem value="net">Net Savings</ToggleGroupItem>
            </ToggleGroup>
            <Select value={dataView} onValueChange={(value) => setDataView(value as DataView)}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select data view"
              >
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  All
                </SelectItem>
                <SelectItem value="income" className="rounded-lg">
                  Income
                </SelectItem>
                <SelectItem value="expense" className="rounded-lg">
                  Expenses
                </SelectItem>
                <SelectItem value="net" className="rounded-lg">
                  Net Savings
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : !trends || !Array.isArray(trends) || trends.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs text-muted-foreground">
                Start adding transactions to see your spending trends
              </p>
            </div>
          </div>
        ) : trends.length === 1 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2">
              <div className="rounded-full bg-muted p-3 mx-auto w-fit">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Single data point</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Add more transactions over time to see trends. Currently showing aggregated data for {formatDate(trends[0].date)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ${trends[0].income.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">Expense</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  ${trends[0].expense.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">Net</p>
                <p className={`text-lg font-semibold ${trends[0].net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  ${trends[0].net.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart
              data={trends}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-expense)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-expense)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id="fillNet" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-net)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-net)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDate}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatDate}
                    indicator="dot"
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
              {/* Render areas based on selected view */}
              {(dataView === "all" || dataView === "expense") && (
                <Area
                  dataKey="expense"
                  type="natural"
                  fill="url(#fillExpense)"
                  stroke="var(--color-expense)"
                  strokeWidth={2}
                />
              )}
              {(dataView === "all" || dataView === "income") && (
                <Area
                  dataKey="income"
                  type="natural"
                  fill="url(#fillIncome)"
                  stroke="var(--color-income)"
                  strokeWidth={2}
                />
              )}
              {dataView === "net" && (
                <Area
                  dataKey="net"
                  type="natural"
                  fill="url(#fillNet)"
                  stroke="var(--color-net)"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
