import AIInsight, { IAIInsight, IInsight } from '@/lib/db/models/AIInsight';
import Transaction from '@/lib/db/models/Transaction';
import Budget from '@/lib/db/models/Budget';
import connectDB from '@/lib/db/mongodb';

/**
 * Get current insights for a user
 */
export async function getInsights(userId: string): Promise<IAIInsight[]> {
  await connectDB();

  const insights = await AIInsight.find({
    userId,
    isStale: false,
    expiresAt: { $gt: new Date() },
  })
    .sort({ generatedAt: -1 })
    .limit(10);

  return insights;
}

/**
 * Generate weekly insights for a user
 */
export async function generateWeeklyInsights(userId: string): Promise<IAIInsight> {
  await connectDB();

  const insights: IInsight[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Get current week spending
  const currentWeekResult = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        date: { $gte: weekAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  // Get previous week spending
  const previousWeekResult = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        date: { $gte: twoWeeksAgo, $lt: weekAgo },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const currentWeekSpending = currentWeekResult[0]?.total || 0;
  const previousWeekSpending = previousWeekResult[0]?.total || 0;

  // Spending trend alert
  if (previousWeekSpending > 0) {
    const percentageChange =
      ((currentWeekSpending - previousWeekSpending) / previousWeekSpending) * 100;

    if (Math.abs(percentageChange) > 10) {
      insights.push({
        category: percentageChange > 0 ? 'alert' : 'achievement',
        title:
          percentageChange > 0
            ? `Spending increased by ${Math.round(percentageChange)}%`
            : `Spending decreased by ${Math.abs(Math.round(percentageChange))}%`,
        description: 'last week',
        priority: Math.abs(percentageChange) > 25 ? 'high' : 'medium',
        metadata: {
          percentage: Math.round(percentageChange),
          amount: currentWeekSpending,
          comparisonPeriod: 'week',
        },
        isRead: false,
        createdAt: now,
      });
    }
  }

  // Budget alerts
  const budgets = await Budget.find({ userId, isActive: true });
  for (const budget of budgets) {
    const spent = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: budget.startDate, $lte: budget.endDate },
          ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spentAmount = spent[0]?.total || 0;
    const percentage = (spentAmount / budget.amount) * 100;

    if (percentage >= budget.alertThreshold) {
      insights.push({
        category: 'alert',
        title: `${budget.name} budget at ${Math.round(percentage)}%`,
        description: `You've spent ${spentAmount} of ${budget.amount}`,
        priority: percentage >= 100 ? 'high' : 'medium',
        metadata: {
          percentage: Math.round(percentage),
          amount: spentAmount,
          categoryId: budget.categoryId,
        },
        isRead: false,
        createdAt: now,
      });
    }
  }

  // Create insight document
  const aiInsight = await AIInsight.create({
    userId,
    type: 'weekly',
    insights,
    generatedAt: now,
  });

  return aiInsight;
}

/**
 * Mark insight as read
 */
export async function markInsightAsRead(
  userId: string,
  insightId: string,
  insightIndex: number
): Promise<IAIInsight | null> {
  await connectDB();

  const insight = await AIInsight.findOneAndUpdate(
    {
      _id: insightId,
      userId,
    },
    {
      $set: {
        [`insights.${insightIndex}.isRead`]: true,
      },
    },
    { new: true }
  );

  return insight;
}

/**
 * Delete an insight
 */
export async function deleteInsight(
  userId: string,
  insightId: string
): Promise<void> {
  await connectDB();

  await AIInsight.findOneAndDelete({
    _id: insightId,
    userId,
  });
}

/**
 * Process insights for all users (cron job)
 */
export async function processAllUserInsights(): Promise<{
  processed: number;
  failed: number;
}> {
  await connectDB();

  const users = await Transaction.distinct('userId');
  let processed = 0;
  let failed = 0;

  for (const userId of users) {
    try {
      await generateWeeklyInsights(userId.toString());
      processed++;
    } catch (error) {
      failed++;
      console.error(`Failed to generate insights for user ${userId}:`, error);
    }
  }

  return { processed, failed };
}
