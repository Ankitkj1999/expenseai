import Goal, { IGoal } from '@/lib/db/models/Goal';
import Account from '@/lib/db/models/Account';
import Transaction from '@/lib/db/models/Transaction';
import connectDB from '@/lib/db/mongodb';

/**
 * Get all goals for a user
 */
export async function getGoals(
  userId: string,
  filters: {
    type?: string;
    status?: string;
    priority?: string;
  } = {}
): Promise<IGoal[]> {
  await connectDB();

  const query: Record<string, unknown> = { userId };

  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;

  const goals = await Goal.find(query)
    .sort({ priority: 1, deadline: 1, createdAt: -1 })
    .populate('linkedAccountId', 'name type icon color balance')
    .populate('linkedCategoryId', 'name icon color');

  return goals;
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(
  userId: string,
  goalId: string
): Promise<IGoal | null> {
  await connectDB();

  const goal = await Goal.findOne({
    _id: goalId,
    userId,
  })
    .populate('linkedAccountId', 'name type icon color balance')
    .populate('linkedCategoryId', 'name icon color');

  return goal;
}

/**
 * Create a new goal
 */
export async function createGoal(
  userId: string,
  data: Partial<IGoal>
): Promise<IGoal> {
  await connectDB();

  const goal = await Goal.create({
    ...data,
    userId,
  });

  return goal;
}

/**
 * Update a goal
 */
export async function updateGoal(
  userId: string,
  goalId: string,
  updates: Partial<IGoal>
): Promise<IGoal | null> {
  await connectDB();

  const goal = await Goal.findOneAndUpdate(
    { _id: goalId, userId },
    updates,
    { new: true }
  )
    .populate('linkedAccountId', 'name type icon color balance')
    .populate('linkedCategoryId', 'name icon color');

  return goal;
}

/**
 * Delete a goal
 */
export async function deleteGoal(
  userId: string,
  goalId: string
): Promise<void> {
  await connectDB();

  const result = await Goal.findOneAndDelete({
    _id: goalId,
    userId,
  });

  if (!result) {
    throw new Error('Goal not found');
  }
}

/**
 * Add a contribution to a goal
 */
export async function addContribution(
  userId: string,
  goalId: string,
  amount: number,
  note?: string
): Promise<IGoal | null> {
  await connectDB();

  const goal = await Goal.findOne({ _id: goalId, userId });

  if (!goal) {
    throw new Error('Goal not found');
  }

  // Update current amount
  const newAmount = goal.currentAmount + amount;

  // Add milestone
  const milestone = {
    amount: newAmount,
    date: new Date(),
    note: note || `Contributed ${amount}`,
  };

  const updatedGoal = await Goal.findOneAndUpdate(
    { _id: goalId, userId },
    {
      currentAmount: newAmount,
      $push: { milestones: milestone },
    },
    { new: true }
  )
    .populate('linkedAccountId', 'name type icon color balance')
    .populate('linkedCategoryId', 'name icon color');

  return updatedGoal;
}

/**
 * Mark a goal as completed
 */
export async function completeGoal(
  userId: string,
  goalId: string
): Promise<IGoal | null> {
  await connectDB();

  const goal = await Goal.findOneAndUpdate(
    { _id: goalId, userId },
    {
      status: 'completed',
      currentAmount: function(this: IGoal) {
        // Set current amount to target if not already there
        return this.currentAmount >= this.targetAmount
          ? this.currentAmount
          : this.targetAmount;
      },
    },
    { new: true }
  )
    .populate('linkedAccountId', 'name type icon color balance')
    .populate('linkedCategoryId', 'name icon color');

  return goal;
}

/**
 * Get goal progress with projections
 */
export async function getGoalProgress(
  userId: string,
  goalId: string
): Promise<{
  goal: IGoal;
  progress: number;
  remainingAmount: number;
  projectedCompletionDate?: Date;
  averageMonthlyContribution?: number;
  monthsToCompletion?: number;
}> {
  await connectDB();

  const goal = await Goal.findOne({ _id: goalId, userId })
    .populate('linkedAccountId', 'name type icon color balance')
    .populate('linkedCategoryId', 'name icon color');

  if (!goal) {
    throw new Error('Goal not found');
  }

  const progress = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

  const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);

  // Calculate projections based on milestones
  let projectedCompletionDate: Date | undefined;
  let averageMonthlyContribution: number | undefined;
  let monthsToCompletion: number | undefined;

  if (goal.milestones && goal.milestones.length > 1) {
    // Calculate average monthly contribution from milestones
    const sortedMilestones = goal.milestones.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    const firstMilestone = sortedMilestones[0];
    const lastMilestone = sortedMilestones[sortedMilestones.length - 1];

    const monthsDiff =
      (lastMilestone.date.getTime() - firstMilestone.date.getTime()) /
      (1000 * 60 * 60 * 24 * 30);

    if (monthsDiff > 0) {
      const totalContributed = lastMilestone.amount - firstMilestone.amount;
      averageMonthlyContribution = totalContributed / monthsDiff;

      if (averageMonthlyContribution > 0 && remainingAmount > 0) {
        monthsToCompletion = remainingAmount / averageMonthlyContribution;
        projectedCompletionDate = new Date();
        projectedCompletionDate.setMonth(
          projectedCompletionDate.getMonth() + Math.ceil(monthsToCompletion)
        );
      }
    }
  }

  return {
    goal,
    progress,
    remainingAmount,
    projectedCompletionDate,
    averageMonthlyContribution,
    monthsToCompletion,
  };
}

/**
 * Auto-track goal progress from linked account or category
 * This can be called periodically or after transactions are created
 */
export async function updateGoalFromLinkedData(
  userId: string,
  goalId: string
): Promise<IGoal | null> {
  await connectDB();

  const goal = await Goal.findOne({ _id: goalId, userId });

  if (!goal) {
    throw new Error('Goal not found');
  }

  let newAmount = goal.currentAmount;

  // If linked to account, use account balance
  if (goal.linkedAccountId) {
    const account = await Account.findOne({
      _id: goal.linkedAccountId,
      userId,
    });

    if (account) {
      newAmount = account.balance;
    }
  }

  // If linked to category, sum transactions in that category
  if (goal.linkedCategoryId) {
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: goal.userId,
          categoryId: goal.linkedCategoryId,
          type: goal.type === 'debt_payoff' ? 'expense' : 'income',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    if (result.length > 0) {
      newAmount = result[0].total;
    }
  }

  // Update goal if amount changed
  if (newAmount !== goal.currentAmount) {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      { currentAmount: newAmount },
      { new: true }
    )
      .populate('linkedAccountId', 'name type icon color balance')
      .populate('linkedCategoryId', 'name icon color');

    return updatedGoal;
  }

  return goal;
}
