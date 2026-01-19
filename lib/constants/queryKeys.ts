// Query keys for TanStack Query
// Centralized to ensure consistency across the app

export const queryKeys = {
  // Transactions
  transactions: (filters?: Record<string, any>) => 
    filters ? ['transactions', filters] as const : ['transactions'] as const,
  transaction: (id: string) => ['transaction', id] as const,

  // Accounts
  accounts: ['accounts'] as const,
  account: (id: string) => ['account', id] as const,

  // Categories
  categories: ['categories'] as const,
  category: (id: string) => ['category', id] as const,

  // Budgets
  budgets: ['budgets'] as const,
  budget: (id: string) => ['budget', id] as const,
  budgetStatus: (id: string) => ['budget', id, 'status'] as const,

  // Goals
  goals: ['goals'] as const,
  goal: (id: string) => ['goal', id] as const,
  goalProgress: (id: string) => ['goal', id, 'progress'] as const,

  // Recurring Transactions
  recurring: ['recurring'] as const,
  recurringItem: (id: string) => ['recurring', id] as const,

  // Insights
  insights: ['insights'] as const,
  insight: (id: string) => ['insight', id] as const,

  // Analytics
  analytics: {
    summary: (period?: string) => 
      period ? ['analytics', 'summary', period] as const : ['analytics', 'summary'] as const,
    trends: (period?: string, groupBy?: string) => 
      ['analytics', 'trends', period, groupBy] as const,
    categoryBreakdown: (type?: string) => 
      ['analytics', 'category-breakdown', type] as const,
    comparison: (currentPeriod?: string) => 
      ['analytics', 'comparison', currentPeriod] as const,
  },
}
