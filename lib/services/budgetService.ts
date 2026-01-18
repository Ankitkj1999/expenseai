import Budget, { IBudget } from '@/lib/db/models/Budget';
import Transaction from '@/lib/db/models/Transaction';
import mongoose from 'mongoose';

export interface CreateBudgetInput {
  userId: string;
  name: string;
  categoryId?: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  alertThreshold?: number;
}

export interface UpdateBudgetInput {
  name?: string;
  categoryId?: string;
  amount?: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  alertThreshold?: number;
  isActive?: boolean;
}

export interface BudgetStatus {
  budget: IBudget;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  shouldAlert: boolean;
}

class BudgetService {
  /**
   * Create a new budget
   */
  async createBudget(input: CreateBudgetInput): Promise<IBudget> {
    const budget = await Budget.create({
      userId: new mongoose.Types.ObjectId(input.userId),
      name: input.name,
      categoryId: input.categoryId
        ? new mongoose.Types.ObjectId(input.categoryId)
        : undefined,
      amount: input.amount,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
      alertThreshold: input.alertThreshold ?? 80,
      isActive: true,
    });

    return budget;
  }

  /**
   * Get all budgets for a user
   */
  async getBudgets(
    userId: string,
    filters?: {
      isActive?: boolean;
      categoryId?: string;
      period?: string;
    }
  ): Promise<IBudget[]> {
    interface BudgetQuery {
      userId: mongoose.Types.ObjectId;
      isActive?: boolean;
      categoryId?: mongoose.Types.ObjectId;
      period?: string;
    }

    const query: BudgetQuery = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(filters.categoryId);
    }

    if (filters?.period) {
      query.period = filters.period;
    }

    const budgets = await Budget.find(query)
      .populate('categoryId', 'name icon color')
      .sort({ createdAt: -1 });

    return budgets;
  }

  /**
   * Get a single budget by ID
   */
  async getBudgetById(budgetId: string, userId: string): Promise<IBudget | null> {
    const budget = await Budget.findOne({
      _id: new mongoose.Types.ObjectId(budgetId),
      userId: new mongoose.Types.ObjectId(userId),
    }).populate('categoryId', 'name icon color');

    return budget;
  }

  /**
   * Update a budget
   */
  async updateBudget(
    budgetId: string,
    userId: string,
    updates: UpdateBudgetInput
  ): Promise<IBudget | null> {
    interface BudgetUpdateData {
      name?: string;
      categoryId?: mongoose.Types.ObjectId | string;
      amount?: number;
      period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
      startDate?: Date;
      endDate?: Date;
      alertThreshold?: number;
      isActive?: boolean;
    }

    const updateData: BudgetUpdateData = { ...updates };

    if (updates.categoryId) {
      updateData.categoryId = new mongoose.Types.ObjectId(updates.categoryId);
    }

    const budget = await Budget.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(budgetId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name icon color');

    return budget;
  }

  /**
   * Delete a budget
   */
  async deleteBudget(budgetId: string, userId: string): Promise<boolean> {
    const result = await Budget.deleteOne({
      _id: new mongoose.Types.ObjectId(budgetId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    return result.deletedCount > 0;
  }

  /**
   * Get budget status with spending information
   */
  async getBudgetStatus(budgetId: string, userId: string): Promise<BudgetStatus | null> {
    const budget = await this.getBudgetById(budgetId, userId);
    if (!budget) return null;

    // Calculate spent amount within budget period
    interface TransactionQuery {
      userId: mongoose.Types.ObjectId;
      type: string;
      date: {
        $gte: Date;
        $lte: Date;
      };
      categoryId?: mongoose.Types.ObjectId;
    }

    const query: TransactionQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      type: 'expense',
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate,
      },
    };

    // If budget is for a specific category, filter by category
    if (budget.categoryId) {
      query.categoryId = budget.categoryId;
    }

    const transactions = await Transaction.find(query);
    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;
    const isOverBudget = spent > budget.amount;
    const shouldAlert = percentage >= budget.alertThreshold;

    return {
      budget,
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      isOverBudget,
      shouldAlert,
    };
  }

  /**
   * Get all active budgets with their status
   */
  async getAllBudgetStatuses(userId: string): Promise<BudgetStatus[]> {
    const budgets = await this.getBudgets(userId, { isActive: true });
    
    const statuses = await Promise.all(
      budgets.map(async (budget) => {
        const status = await this.getBudgetStatus(budget._id.toString(), userId);
        return status;
      })
    );

    return statuses.filter((s): s is BudgetStatus => s !== null);
  }

  /**
   * Check if any budgets need alerts
   */
  async checkBudgetAlerts(userId: string): Promise<BudgetStatus[]> {
    const statuses = await this.getAllBudgetStatuses(userId);
    return statuses.filter((s) => s.shouldAlert);
  }
}

export default new BudgetService();
