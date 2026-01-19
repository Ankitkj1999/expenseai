"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
import { useAnalyticsTrends } from "@/lib/hooks/useAnalytics";

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Period = "week" | "month" | "year";
type GroupBy = "day" | "week" | "month";

interface SpendingTrendChartProps {
  defaultPeriod?: Period;
}

export function SpendingTrendChart({ defaultPeriod = "month" }: SpendingTrendChartProps) {
  const isMobile = useIsMobile();
  const [period, setPeriod] = React.useState<Period>(defaultPeriod);
  const [groupBy, setGroupBy] = React.useState<GroupBy>("day");

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

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case "week":
        return "Last 7 days";
      case "month":
        return "Last 30 days";
      case "year":
        return "Last 12 months";
    }
  };

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>Unable to load trend data</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Income vs Expense over time
          </span>
          <span className="@[540px]/card:hidden">Income vs Expense</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(value) => value && setPeriod(value as Period)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="year">Last 12 months</ToggleGroupItem>
            <ToggleGroupItem value="month">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="week">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a period"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="year" className="rounded-lg">
                Last 12 months
              </SelectItem>
              <SelectItem value="month" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="week" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : !trends || trends.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No data available for the selected period
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-expense)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-expense)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDate}
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
              <Area
                dataKey="income"
                type="natural"
                fill="url(#fillIncome)"
                stroke="var(--color-income)"
                strokeWidth={2}
              />
              <Area
                dataKey="expense"
                type="natural"
                fill="url(#fillExpense)"
                stroke="var(--color-expense)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
