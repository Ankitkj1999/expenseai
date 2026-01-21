import { z } from 'zod';
import mongoose from 'mongoose';
import analyticsService from './analyticsService';
import * as transactionService from './transactionService';
import budgetService from './budgetService';

/**
 * Tool Schemas - Define parameters for each AI tool
 */

// Get Transactions Tool
export const getTransactionsSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().default(50),
});

// Create Transaction Tool
export const createTransactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive(),
  description: z.string(),
  accountId: z.string(),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z
    .object({
      location: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

// Get Spending Summary Tool
export const getSpendingSummarySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year', 'custom']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Get Category Breakdown Tool
export const getCategoryBreakdownSchema = z.object({
  type: z.enum(['expense', 'income']).default('expense'),
  period: z.enum(['today', 'week', 'month', 'year', 'custom']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Get Budget Status Tool
export const getBudgetStatusSchema = z.object({
  budgetId: z.string().optional(),
});

// Get Accounts Tool
export const getAccountsSchema = z.object({});

// Get Categories Tool
export const getCategoriesSchema = z.object({
  type: z.enum(['expense', 'income']).optional(),
});

/**
 * Tool Definitions - Functions that AI can call
 */

export const tools = {
  /**
   * Get transactions with filters
   */
  getTransactions: {
    description:
      'Get user transactions with optional filters. Use this to show transaction history, search for specific expenses/income, or analyze spending patterns.',
    parameters: getTransactionsSchema,
    execute: async (params: z.infer<typeof getTransactionsSchema>, userId: string) => {
      console.log('[AI Tool] getTransactions called with params:', JSON.stringify(params, null, 2));
      console.log('[AI Tool] userId:', userId);
      
      const filters: Record<string, unknown> = {};

      if (params.type) filters.type = params.type;
      if (params.categoryId) filters.categoryId = params.categoryId;
      if (params.accountId) filters.accountId = params.accountId;
      if (params.startDate) filters.startDate = new Date(params.startDate);
      if (params.endDate) filters.endDate = new Date(params.endDate);

      console.log('[AI Tool] Filters applied:', JSON.stringify(filters, null, 2));

      const transactions = await transactionService.getTransactions(
        userId,
        filters,
        params.limit,
        0
      );

      console.log('[AI Tool] getTransactions result - count:', transactions.total);

      return {
        success: true,
        transactions: transactions.transactions,
        count: transactions.total,
      };
    },
  },

  /**
   * Create a new transaction
   */
  createTransaction: {
    description:
      'Create a new expense, income, or transfer transaction. Use this when the user wants to log spending, record income, or transfer money between accounts.',
    parameters: createTransactionSchema,
    execute: async (params: z.infer<typeof createTransactionSchema>, userId: string) => {
      console.log('[AI Tool] createTransaction called with params:', JSON.stringify(params, null, 2));
      console.log('[AI Tool] userId:', userId);
      
      const transaction = await transactionService.createTransaction(userId, {
        type: params.type,
        amount: params.amount,
        description: params.description,
        accountId: params.accountId as unknown as mongoose.Types.ObjectId,
        toAccountId: params.toAccountId as unknown as mongoose.Types.ObjectId,
        categoryId: params.categoryId as unknown as mongoose.Types.ObjectId,
        date: params.date ? new Date(params.date) : new Date(),
        tags: params.tags,
        aiGenerated: true,
        metadata: params.metadata,
      });

      console.log('[AI Tool] createTransaction result - ID:', transaction._id);

      return {
        success: true,
        transaction: {
          id: transaction._id.toString(),
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
        },
        message: `${params.type === 'expense' ? 'Expense' : params.type === 'income' ? 'Income' : 'Transfer'} of ${params.amount} logged successfully`,
      };
    },
  },

  /**
   * Get spending summary
   */
  getSpendingSummary: {
    description:
      'Get a summary of income, expenses, and net balance for a specified period. Use this to answer questions about total spending, income, or financial overview.',
    parameters: getSpendingSummarySchema,
    execute: async (params: z.infer<typeof getSpendingSummarySchema>, userId: string) => {
      console.log('[AI Tool] getSpendingSummary called with params:', JSON.stringify(params, null, 2));
      console.log('[AI Tool] userId:', userId);
      
      const summary = await analyticsService.getSummary(userId, {
        period: params.period,
        startDate: params.startDate ? new Date(params.startDate) : undefined,
        endDate: params.endDate ? new Date(params.endDate) : undefined,
      });

      console.log('[AI Tool] getSpendingSummary result:', JSON.stringify(summary, null, 2));

      return {
        success: true,
        summary,
      };
    },
  },

  /**
   * Get category breakdown
   */
  getCategoryBreakdown: {
    description:
      'Get spending or income breakdown by category with percentages. Use this to show where money is being spent or earned, perfect for pie charts or category analysis.',
    parameters: getCategoryBreakdownSchema,
    execute: async (params: z.infer<typeof getCategoryBreakdownSchema>, userId: string) => {
      console.log('[AI Tool] getCategoryBreakdown called with params:', JSON.stringify(params, null, 2));
      console.log('[AI Tool] userId:', userId);
      
      const breakdown = await analyticsService.getCategoryBreakdown(userId, {
        type: params.type,
        period: params.period,
        startDate: params.startDate ? new Date(params.startDate) : undefined,
        endDate: params.endDate ? new Date(params.endDate) : undefined,
      });

      console.log('[AI Tool] getCategoryBreakdown result - count:', breakdown.length);

      return {
        success: true,
        breakdown,
        count: breakdown.length,
      };
    },
  },

  /**
   * Get budget status
   */
  getBudgetStatus: {
    description:
      'Get status of all active budgets showing spending vs limits, remaining budget, percentage used, and alerts. IMPORTANT: Do NOT pass a budgetId parameter unless the user specifically mentions a budget ID - call without parameters to get all budgets. Returns an array of budget statuses with spending information.',
    parameters: getBudgetStatusSchema,
    execute: async (params: z.infer<typeof getBudgetStatusSchema>, userId: string) => {
      console.log('[AI Tool] getBudgetStatus called with params:', JSON.stringify(params, null, 2));
      console.log('[AI Tool] userId:', userId);
      
      if (params.budgetId) {
        // Get specific budget status
        console.log('[AI Tool] Fetching specific budget:', params.budgetId);
        const status = await budgetService.getBudgetStatus(params.budgetId, userId);
        console.log('[AI Tool] getBudgetStatus result for specific budget:', status);
        
        if (!status) {
          return {
            success: false,
            error: 'Budget not found with the provided ID',
            message: 'The specified budget does not exist or you do not have access to it.',
          };
        }
        
        // Serialize to plain object
        const serializedStatus = {
          budget: {
            id: status.budget._id.toString(),
            name: status.budget.name,
            amount: status.budget.amount,
            period: status.budget.period,
            startDate: status.budget.startDate.toISOString(),
            endDate: status.budget.endDate.toISOString(),
            alertThreshold: status.budget.alertThreshold,
            categoryId: status.budget.categoryId ? status.budget.categoryId.toString() : null,
          },
          spent: status.spent,
          remaining: status.remaining,
          percentage: status.percentage,
          isOverBudget: status.isOverBudget,
          shouldAlert: status.shouldAlert,
        };
        
        return {
          success: true,
          status: serializedStatus,
          message: `Budget "${status.budget.name}" found`,
        };
      } else {
        // Get all active budgets status
        console.log('[AI Tool] Fetching all active budgets for user');
        const statuses = await budgetService.getAllBudgetStatuses(userId);
        console.log('[AI Tool] getBudgetStatus result - count:', statuses.length);
        
        // Serialize budget statuses to plain objects (avoid DataCloneError)
        const serializedStatuses = statuses.map(s => ({
          budget: {
            id: s.budget._id.toString(),
            name: s.budget.name,
            amount: s.budget.amount,
            period: s.budget.period,
            startDate: s.budget.startDate.toISOString(),
            endDate: s.budget.endDate.toISOString(),
            alertThreshold: s.budget.alertThreshold,
            categoryId: s.budget.categoryId ? s.budget.categoryId.toString() : null,
            categoryName: s.budget.categoryId && typeof s.budget.categoryId === 'object' && 'name' in s.budget.categoryId ? (s.budget.categoryId as { name: string }).name : null,
          },
          spent: s.spent,
          remaining: s.remaining,
          percentage: s.percentage,
          isOverBudget: s.isOverBudget,
          shouldAlert: s.shouldAlert,
        }));
        
        console.log('[AI Tool] Budget details:', JSON.stringify(serializedStatuses.map(s => ({
          name: s.budget.name,
          amount: s.budget.amount,
          spent: s.spent,
          remaining: s.remaining,
          percentage: s.percentage
        })), null, 2));
        
        if (serializedStatuses.length === 0) {
          return {
            success: true,
            budgets: [],
            count: 0,
            message: 'No active budgets found. User needs to create budgets first.',
          };
        }
        
        return {
          success: true,
          budgets: serializedStatuses,
          count: serializedStatuses.length,
          message: `Found ${serializedStatuses.length} active budget(s)`,
        };
      }
    },
  },

  /**
   * Get user accounts
   */
  getAccounts: {
    description:
      'Get all user accounts with their IDs, names, types, and balances. Use this before creating transactions to get valid account IDs.',
    parameters: getAccountsSchema,
    execute: async (params: z.infer<typeof getAccountsSchema>, userId: string) => {
      console.log('[AI Tool] getAccounts called');
      console.log('[AI Tool] userId:', userId);
      
      const Account = (await import('@/lib/db/models/Account')).default;
      const accounts = await Account.find({ userId, isActive: true });
      
      console.log('[AI Tool] getAccounts result - count:', accounts.length);
      
      return {
        success: true,
        accounts: accounts.map(acc => ({
          id: acc._id.toString(),
          name: acc.name,
          type: acc.type,
          balance: acc.balance,
          currency: acc.currency,
        })),
        count: accounts.length,
      };
    },
  },

  /**
   * Get categories
   */
  getCategories: {
    description:
      'Get all categories (system + custom) with their IDs, names, types, icons, and colors. Use this before creating transactions to get valid category IDs.',
    parameters: getCategoriesSchema,
    execute: async (params: z.infer<typeof getCategoriesSchema>, userId: string) => {
      console.log('[AI Tool] getCategories called with params:', JSON.stringify(params, null, 2));
      console.log('[AI Tool] userId:', userId);
      
      const Category = (await import('@/lib/db/models/Category')).default;
      const query: Record<string, unknown> = {
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { isSystem: true }
        ],
      };
      
      if (params.type) {
        query.type = params.type;
      }
      
      const categories = await Category.find(query);
      
      console.log('[AI Tool] getCategories result - count:', categories.length);
      
      return {
        success: true,
        categories: categories.map(cat => ({
          id: cat._id.toString(),
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
        })),
        count: categories.length,
      };
    },
  },
};

/**
 * AI Service Configuration
 * 
 * This service provides tool definitions and handlers for AI integration.
 * Tools allow the AI to query data and perform actions on behalf of the user.
 * 
 * Usage with Vercel AI SDK:
 * 
 * import { streamText } from 'ai';
 * import { bedrock } from '@ai-sdk/amazon-bedrock';
 * import { tools } from '@/lib/services/aiService';
 * 
 * const result = await streamText({
 *   model: bedrock('amazon.nova-pro-v1:0'),
 *   messages: conversationHistory,
 *   tools: {
 *     getTransactions: {
 *       description: tools.getTransactions.description,
 *       parameters: tools.getTransactions.parameters,
 *       execute: async (params) => tools.getTransactions.execute(params, userId),
 *     },
 *     // ... other tools
 *   },
 * });
 */

export default {
  tools,
  schemas: {
    getTransactionsSchema,
    createTransactionSchema,
    getSpendingSummarySchema,
    getCategoryBreakdownSchema,
    getBudgetStatusSchema,
    getAccountsSchema,
    getCategoriesSchema,
  },
};
