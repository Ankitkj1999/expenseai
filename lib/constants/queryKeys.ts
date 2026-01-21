// Query keys for TanStack Query
// Centralized to ensure consistency across the app

import type { TransactionType, CategoryType } from '@/types';

/**
 * Type-safe filters for transaction queries
 */
export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Type-safe period values for analytics
 */
export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

/**
 * Type-safe group by values for analytics
 */
export type AnalyticsGroupBy = 'day' | 'week' | 'month' | 'category';

export const queryKeys = {
  // Transactions
  transactions: (filters?: TransactionFilters) =>
    filters ? ['transactions', filters] as const : ['transactions'] as const,
  transaction: (id: string) => ['transaction', id] as const,

  // Accounts
  accounts: ['accounts'] as const,
  account: (id: string) => ['account', id] as const,

  // Categories
  categories: (type?: CategoryType) =>
    type ? ['categories', type] as const : ['categories'] as const,
  category: (id: string) => ['category', id] as const,

  // Budgets
  budgets: ['budgets'] as const,
  budget: (id: string) => ['budget', id] as const,
  budgetStatus: (id: string) => ['budget', id, 'status'] as const,

  // Recurring Transactions
  recurring: ['recurring'] as const,
  recurringItem: (id: string) => ['recurring', id] as const,

  // Insights
  insights: ['insights'] as const,
  insight: (id: string) => ['insight', id] as const,

  // Analytics
  analytics: {
    summary: (period?: AnalyticsPeriod) =>
      period ? ['analytics', 'summary', period] as const : ['analytics', 'summary'] as const,
    trends: (period?: AnalyticsPeriod, groupBy?: AnalyticsGroupBy) =>
      ['analytics', 'trends', period, groupBy] as const,
    categoryBreakdown: (type?: CategoryType) =>
      ['analytics', 'category-breakdown', type] as const,
    comparison: (currentPeriod?: AnalyticsPeriod) =>
      ['analytics', 'comparison', currentPeriod] as const,
  },
}
