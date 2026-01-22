/**
 * Shared enum constants for validation consistency
 * Used across both Mongoose models and Zod schemas
 */

export const ACCOUNT_TYPES = ['cash', 'bank', 'credit', 'wallet', 'savings'] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

export const TRANSACTION_TYPES = ['expense', 'income', 'transfer'] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];

export const CATEGORY_TYPES = ['expense', 'income'] as const;
export type CategoryType = typeof CATEGORY_TYPES[number];

export const BUDGET_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type BudgetPeriod = typeof BUDGET_PERIODS[number];

export const THEME_OPTIONS = ['light', 'dark'] as const;
export type Theme = typeof THEME_OPTIONS[number];

export const INSIGHT_TYPES = ['alert', 'advice', 'achievement'] as const;
export type InsightType = typeof INSIGHT_TYPES[number];

export const INSIGHT_PRIORITIES = ['high', 'medium', 'low'] as const;
export type InsightPriority = typeof INSIGHT_PRIORITIES[number];

export const INSIGHT_FREQUENCIES = ['weekly', 'monthly', 'realtime'] as const;
export type InsightFrequency = typeof INSIGHT_FREQUENCIES[number];

export const MESSAGE_ROLES = ['user', 'assistant'] as const;
export type MessageRole = typeof MESSAGE_ROLES[number];
