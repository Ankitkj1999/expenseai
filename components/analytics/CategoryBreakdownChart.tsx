"use client";

import * as React from "react";
import { Pie, PieChart, Cell, Legend, ResponsiveContainer } from "recharts";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlertCircle, PieChartIcon } from "lucide-react";
import { useCategoryBreakdown } from "@/lib/hooks/useAnalytics";

// Default colors for categories
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type TransactionType = "expense" | "income";

interface CategoryBreakdownChartProps {
  defaultType?: TransactionType;
  period?: "today" | "week" | "month" | "year";
}

export function CategoryBreakdownChart({
  defaultType = "expense",
  period = "month",
}: CategoryBreakdownChartProps) {
  const [type, setType] = React.useState<TransactionType>(defaultType);

  const { data: breakdown, isLoading, error } = useCategoryBreakdown({ type, period });

  // Create chart config dynamically from breakdown data
  const chartConfig = React.useMemo(() => {
    if (!breakdown || !Array.isArray(breakdown)) return {} as ChartConfig;

    const config: ChartConfig = {};
    breakdown.forEach((item, index) => {
      config[item.categoryId] = {
        label: item.categoryName,
        color: item.color || COLORS[index % COLORS.length],
      };
    });
    return config;
  }, [breakdown]);

  // Transform data for the chart
  const chartData = React.useMemo(() => {
    if (!breakdown || !Array.isArray(breakdown)) return [];
    return breakdown.map((item) => ({
      name: item.categoryName,
      value: item.amount,
      percentage: item.percentage,
      count: item.transactionCount,
      categoryId: item.categoryId,
    }));
  }, [breakdown]);

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                {type === "expense" ? "Expenses" : "Income"} by category
              </CardDescription>
            </div>
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(value) => value && setType(value as TransactionType)}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="expense">Expenses</ToggleGroupItem>
              <ToggleGroupItem value="income">Income</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Unable to load category data"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              {type === "expense" ? "Expenses" : "Income"} by category
            </CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={(value) => value && setType(value as TransactionType)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="expense">Expenses</ToggleGroupItem>
            <ToggleGroupItem value="income">Income</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : !chartData || chartData.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <PieChartIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No {type} data</p>
              <p className="text-xs text-muted-foreground">
                Add {type === "expense" ? "expenses" : "income"} to see category breakdown
              </p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name, item) => (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                          style={
                            {
                              "--color-bg": chartConfig[item.payload.categoryId]?.color,
                            } as React.CSSProperties
                          }
                        />
                        {name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                          ${Number(value).toFixed(2)}
                          <span className="font-normal text-muted-foreground">
                            ({item.payload.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.payload.count} transaction{item.payload.count !== 1 ? "s" : ""}
                        </div>
                      </>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={({ percentage }) => `${percentage.toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartConfig[entry.categoryId]?.color || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                content={({ payload }) => (
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {payload?.map((entry, index) => (
                      <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
