import { api } from './client';

/**
 * Analytics data types
 */
export interface SummaryResult {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  period: {
    start: string;
    end: string;
  };
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

/**
 * API request/response types
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

export interface SummaryParams {
  period?: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface TrendsParams {
  period?: 'week' | 'month' | 'year';
  groupBy?: 'day' | 'week' | 'month';
}

export interface CategoryBreakdownParams {
  type?: 'expense' | 'income';
  period?: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface ComparisonParams {
  currentPeriod?: 'today' | 'week' | 'month' | 'year';
  previousPeriod?: 'today' | 'week' | 'month' | 'year';
}

/**
 * Analytics API functions
 */
export const analyticsApi = {
  /**
   * Get expense/income summary for a period
   */
  getSummary: async (params?: SummaryParams): Promise<SummaryResult> => {
    const response = await api.get<ApiResponse<SummaryResult>>('analytics/summary', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get spending trends over time
   */
  getTrends: async (params?: TrendsParams): Promise<TrendData[]> => {
    const response = await api.get<ApiResponse<TrendData[]>>('analytics/trends', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get category-wise breakdown of expenses or income
   */
  getCategoryBreakdown: async (
    params?: CategoryBreakdownParams
  ): Promise<CategoryBreakdownItem[]> => {
    const response = await api.get<{ success: boolean; data: { data: CategoryBreakdownItem[]; count: number } }>(
      'analytics/category-breakdown',
      { params }
    );
    // The API returns { success: true, data: { data: [...], count: X } }
    return response.data.data.data;
  },

  /**
   * Compare spending between two periods
   */
  getComparison: async (params?: ComparisonParams): Promise<ComparisonResult> => {
    const response = await api.get<{ success: boolean; data: ComparisonResult }>('analytics/comparison', {
      params,
    });
    return response.data.data;
  },
};
