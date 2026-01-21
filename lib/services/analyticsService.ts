import Transaction from '@/lib/db/models/Transaction';
import Budget from '@/lib/db/models/Budget';
import mongoose from 'mongoose';

export interface SummaryParams {
  period?: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface SummaryResult {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface TrendsParams {
  period: 'week' | 'month' | 'year';
  groupBy?: 'day' | 'week' | 'month';
}

export interface TrendData {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  icon?: string;
  color?: string;
}

export interface ComparisonResult {
  current: SummaryResult;
  previous: SummaryResult;
  change: {
    income: { amount: number; percentage: number };
    expense: { amount: number; percentage: number };
    net: { amount: number; percentage: number };
  };
}

class AnalyticsService {
  /**
   * Get date range for a period
   */
  private getDateRange(period: string, startDate?: Date, endDate?: Date): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('Custom period requires startDate and endDate');
        }
        start = startDate;
        end = endDate;
        break;
      default:
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
    }

    return { start, end };
  }

  /**
   * Get expense/income summary
   * Uses aggregation pipeline for efficient calculation
   */
  async getSummary(userId: string, params: SummaryParams = {}): Promise<SummaryResult> {
    const { period = 'month', startDate, endDate } = params;
    const dateRange = this.getDateRange(period, startDate, endDate);

    // Use aggregation to calculate totals efficiently on database side
    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform aggregation results
    let totalIncome = 0;
    let totalExpense = 0;
    let transactionCount = 0;

    summary.forEach((item) => {
      transactionCount += item.count;
      if (item._id === 'income') {
        totalIncome = item.total;
      } else if (item._id === 'expense') {
        totalExpense = item.total;
      }
    });

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount,
      period: dateRange,
    };
  }

  /**
   * Get spending trends over time
   */
  async getTrends(userId: string, params: TrendsParams): Promise<TrendData[]> {
    const { period, groupBy = 'day' } = params;
    const dateRange = this.getDateRange(period);

    // Determine grouping format
    let dateFormat: string;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%V';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Transform to TrendData format
    const trendMap = new Map<string, TrendData>();

    trends.forEach((item) => {
      const date = item._id.date;
      if (!trendMap.has(date)) {
        trendMap.set(date, {
          date,
          income: 0,
          expense: 0,
          net: 0,
        });
      }

      const trend = trendMap.get(date)!;
      if (item._id.type === 'income') {
        trend.income = item.total;
      } else if (item._id.type === 'expense') {
        trend.expense = item.total;
      }
      trend.net = trend.income - trend.expense;
    });

    return Array.from(trendMap.values());
  }

  /**
   * Get category-wise breakdown
   * Limited to top 50 categories to prevent unbounded results
   */
  async getCategoryBreakdown(
    userId: string,
    params: {
      type: 'expense' | 'income';
      period?: 'today' | 'week' | 'month' | 'year' | 'custom';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<CategoryBreakdownItem[]> {
    const { type, period = 'month', startDate, endDate, limit = 50 } = params;
    const dateRange = this.getDateRange(period, startDate, endDate);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type,
          date: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { amount: -1 },
      },
      {
        $limit: limit, // Add pagination limit
      },
    ]);

    // Calculate total for percentages
    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

    return breakdown.map((item) => ({
      categoryId: item._id?.toString() || 'uncategorized',
      categoryName: item.category?.name || 'Uncategorized',
      amount: item.amount,
      percentage: total > 0 ? (item.amount / total) * 100 : 0,
      transactionCount: item.count,
      icon: item.category?.icon,
      color: item.category?.color,
    }));
  }

  /**
   * Compare two periods
   */
  async getComparison(
    userId: string,
    params: {
      currentPeriod: 'today' | 'week' | 'month' | 'year';
      previousPeriod?: 'today' | 'week' | 'month' | 'year';
    }
  ): Promise<ComparisonResult> {
    const { currentPeriod, previousPeriod = currentPeriod } = params;

    // Get current period data
    const current = await this.getSummary(userId, { period: currentPeriod });

    // Calculate previous period dates
    const currentRange = this.getDateRange(currentPeriod);
    const duration = currentRange.end.getTime() - currentRange.start.getTime();
    const previousEnd = new Date(currentRange.start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    const previous = await this.getSummary(userId, {
      period: 'custom',
      startDate: previousStart,
      endDate: previousEnd,
    });

    // Calculate changes
    const calculateChange = (current: number, previous: number) => {
      const amount = current - previous;
      const percentage = previous !== 0 ? (amount / previous) * 100 : 0;
      return { amount, percentage };
    };

    return {
      current,
      previous,
      change: {
        income: calculateChange(current.totalIncome, previous.totalIncome),
        expense: calculateChange(current.totalExpense, previous.totalExpense),
        net: calculateChange(current.netBalance, previous.netBalance),
      },
    };
  }

  /**
   * Get budget status for all active budgets
   * Uses aggregation to avoid N+1 query problem
   */
  async getBudgetOverview(userId: string): Promise<{
    budgets: Array<{
      budgetId: string;
      name: string;
      spent: number;
      limit: number;
      remaining: number;
      percentage: number;
      isOverBudget: boolean;
      shouldAlert: boolean;
      categoryName?: string;
      categoryIcon?: string;
      categoryColor?: string;
    }>;
  }> {
    const now = new Date();
    
    // Use aggregation pipeline to join budgets with their spending in a single query
    const budgetStatuses = await Budget.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'transactions',
          let: {
            budgetCategoryId: '$categoryId',
            budgetStartDate: '$startDate',
            budgetEndDate: '$endDate',
            budgetUserId: '$userId'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$budgetUserId'] },
                    { $eq: ['$type', 'expense'] },
                    { $gte: ['$date', '$$budgetStartDate'] },
                    { $lte: ['$date', '$$budgetEndDate'] },
                    {
                      $cond: {
                        if: { $ne: ['$$budgetCategoryId', null] },
                        then: { $eq: ['$categoryId', '$$budgetCategoryId'] },
                        else: true
                      }
                    }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' }
              }
            }
          ],
          as: 'spending',
        },
      },
      {
        $addFields: {
          spent: {
            $ifNull: [{ $arrayElemAt: ['$spending.total', 0] }, 0]
          },
        },
      },
      {
        $project: {
          budgetId: { $toString: '$_id' },
          name: 1,
          spent: 1,
          limit: '$amount',
          remaining: { $subtract: ['$amount', '$spent'] },
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$spent', '$amount'] }, 100] },
              2
            ]
          },
          isOverBudget: { $gt: ['$spent', '$amount'] },
          shouldAlert: {
            $gte: [
              { $multiply: [{ $divide: ['$spent', '$amount'] }, 100] },
              '$alertThreshold'
            ]
          },
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          categoryColor: '$category.color',
        },
      },
    ]);

    return {
      budgets: budgetStatuses.map(budget => ({
        budgetId: budget.budgetId,
        name: budget.name,
        spent: budget.spent,
        limit: budget.limit,
        remaining: budget.remaining,
        percentage: budget.percentage,
        isOverBudget: budget.isOverBudget,
        shouldAlert: budget.shouldAlert,
        categoryName: budget.categoryName,
        categoryIcon: budget.categoryIcon,
        categoryColor: budget.categoryColor,
      }))
    };
  }
}

export default new AnalyticsService();
