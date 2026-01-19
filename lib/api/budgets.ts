import { api } from './client';

export interface Budget {
  _id: string;
  userId: string;
  name: string;
  categoryId?: {
    _id: string;
    name: string;
    type: string;
    icon: string;
    color: string;
  } | string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  name: string;
  categoryId?: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  alertThreshold?: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  categoryId?: string;
  amount?: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
  alertThreshold?: number;
  isActive?: boolean;
}

interface BudgetsResponse {
  success: boolean;
  data: {
    data: Budget[];
    count: number;
  };
}

interface BudgetResponse {
  success: boolean;
  data: Budget;
}

/**
 * Budgets API functions
 */
export const budgetsApi = {
  /**
   * Get all budgets
   */
  list: async (): Promise<Budget[]> => {
    const response = await api.get<BudgetsResponse>('budgets');
    return response.data.data.data;
  },

  /**
   * Create a new budget
   */
  create: async (data: CreateBudgetRequest): Promise<Budget> => {
    const response = await api.post<BudgetResponse>('budgets', data);
    return response.data.data;
  },

  /**
   * Update a budget
   */
  update: async (id: string, data: UpdateBudgetRequest): Promise<Budget> => {
    const response = await api.put<BudgetResponse>(`budgets/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a budget
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`budgets/${id}`);
  },
};
