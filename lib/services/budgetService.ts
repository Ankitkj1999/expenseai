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
   * Uses aggregation for efficient calculation
   */
  async getBudgetStatus(budgetId: string, userId: string): Promise<BudgetStatus | null> {
    const budget = await this.getBudgetById(budgetId, userId);
    if (!budget) return null;

    // Calculate spent amount using aggregation
    const matchQuery: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
      type: 'expense',
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate,
      },
    };

    // If budget is for a specific category, filter by category
    if (budget.categoryId) {
      matchQuery.categoryId = budget.categoryId;
    }

    const result = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          spent: { $sum: '$amount' }
        }
      }
    ]);

    const spent = result[0]?.spent || 0;
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
   * Uses single aggregation query to avoid N+1 problem
   */
  async getAllBudgetStatuses(userId: string): Promise<BudgetStatus[]> {
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
    ]);

    // Fetch actual budget documents and merge with spending data
    const budgetIds = budgetStatuses.map(b => b._id);
    const budgets = await Budget.find({ _id: { $in: budgetIds } })
      .populate('categoryId', 'name icon color');

    // Create a map for quick lookup
    const spendingMap = new Map(
      budgetStatuses.map(b => [b._id.toString(), b.spent])
    );

    // Transform to BudgetStatus format
    return budgets.map(budget => {
      const spent = spendingMap.get(budget._id.toString()) || 0;
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
    });
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
