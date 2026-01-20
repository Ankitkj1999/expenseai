"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import { useAnalyticsTrends } from "@/lib/hooks/useAnalytics"
import { useCurrency } from "@/lib/hooks/useFormatting"

export const description = "A simplified spending overview chart for the dashboard"

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(142 76% 36%)", // Green
  },
  expense: {
    label: "Expense",
    color: "hsl(0 84% 60%)", // Red
  },
} satisfies ChartConfig

type TimeRange = "7d" | "30d" | "90d"

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const { formatCurrency } = useCurrency()
  const [timeRange, setTimeRange] = React.useState<TimeRange>("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Map time range to API parameters
  const getApiParams = (range: TimeRange) => {
    switch (range) {
      case "7d":
        return { period: "week" as const, groupBy: "day" as const }
      case "30d":
        return { period: "month" as const, groupBy: isMobile ? "week" as const : "day" as const }
      case "90d":
        return { period: "year" as const, groupBy: "month" as const }
      default:
        return { period: "month" as const, groupBy: "day" as const }
    }
  }

  const apiParams = getApiParams(timeRange)
  const { data: trends, isLoading, error } = useAnalyticsTrends(apiParams)

  const formatDate = (dateStr: string) => {
    // Handle different date formats
    if (dateStr.includes("W")) {
      // Week format: 2024-W12
      const [, week] = dateStr.split("-W")
      return `W${week}`
    } else if (dateStr.length === 7) {
      // Month format: 2024-01
      const date = new Date(dateStr + "-01")
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: timeRange === "90d" ? "2-digit" : undefined,
      })
    } else {
      // Day format: 2024-01-15
      const date = new Date(dateStr)
      if (timeRange === "7d") {
        // For 7 days, show day of week
        return date.toLocaleDateString("en-US", {
          weekday: "short",
        })
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  // Calculate summary stats
  const stats = React.useMemo(() => {
    if (!trends || !Array.isArray(trends) || trends.length === 0) return null

    const totalIncome = trends.reduce((sum, item) => sum + (item.income || 0), 0)
    const totalExpense = trends.reduce((sum, item) => sum + (item.expense || 0), 0)
    const netSavings = totalIncome - totalExpense
    const avgIncome = totalIncome / trends.length
    const avgExpense = totalExpense / trends.length

    return {
      totalIncome,
      totalExpense,
      netSavings,
      avgIncome,
      avgExpense,
      isPositive: netSavings >= 0,
    }
  }, [trends])

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>Track your income and expenses</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Unable to load spending data"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>
                {timeRange === "7d" && "Last 7 days"}
                {timeRange === "30d" && "Last 30 days"}
                {timeRange === "90d" && "Last 3 months"}
              </CardDescription>
            </div>
            <CardAction>
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={(value) => value && setTimeRange(value as TimeRange)}
                variant="outline"
                className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
              >
                <ToggleGroupItem value="90d">3 months</ToggleGroupItem>
                <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
                <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
              </ToggleGroup>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger
                  className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                  size="sm"
                  aria-label="Select time range"
                >
                  <SelectValue placeholder="30 days" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">
                    3 months
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    30 days
                  </SelectItem>
                  <SelectItem value="7d" className="rounded-lg">
                    7 days
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </div>
          
          {/* Summary Stats */}
          {stats && !isLoading && (
            <div className="flex items-center gap-4 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(stats.avgIncome)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400" />
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(stats.avgExpense)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {stats.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                )}
                <span className="text-muted-foreground">Net:</span>
                <span className={`font-medium ${stats.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatCurrency(Math.abs(stats.netSavings))}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : !trends || !Array.isArray(trends) || trends.length === 0 ? (
          <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-center">
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
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart 
              data={trends}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
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
                tickFormatter={(value) => `${formatCurrency(value).replace(/\.00$/, '')}`}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatDate}
                    indicator="line"
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
                          {formatCurrency(Number(value))}
                        </div>
                      </>
                    )}
                  />
                }
              />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
