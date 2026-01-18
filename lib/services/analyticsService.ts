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
   */
  async getSummary(userId: string, params: SummaryParams = {}): Promise<SummaryResult> {
    const { period = 'month', startDate, endDate } = params;
    const dateRange = this.getDateRange(period, startDate, endDate);

    const transactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: transactions.length,
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
   */
  async getCategoryBreakdown(
    userId: string,
    params: {
      type: 'expense' | 'income';
      period?: 'today' | 'week' | 'month' | 'year' | 'custom';
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<CategoryBreakdownItem[]> {
    const { type, period = 'month', startDate, endDate } = params;
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
    }>;
  }> {
    const budgets = await Budget.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).populate('categoryId', 'name icon color');

    const budgetStatuses = await Promise.all(
      budgets.map(async (budget) => {
        const query: Record<string, unknown> = {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate,
          },
        };

        if (budget.categoryId) {
          query.categoryId = budget.categoryId;
        }

        const transactions = await Transaction.find(query);
        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;

        return {
          budgetId: budget._id.toString(),
          name: budget.name,
          spent,
          limit: budget.amount,
          remaining,
          percentage: Math.round(percentage * 100) / 100,
          isOverBudget: spent > budget.amount,
          shouldAlert: percentage >= budget.alertThreshold,
        };
      })
    );

    return { budgets: budgetStatuses };
  }
}

export default new AnalyticsService();
