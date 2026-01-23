import mongoose from 'mongoose';
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
 * Balance insights to ensure we have at least one alert and one suggestion
 * This ensures the UI can display a balanced view of insights
 * 
 * Strategy:
 * - Return exactly 1 alert + 1 suggestion when both are available
 * - If only one category exists, return up to 2 from that category
 * - Always prioritize by: high > medium > low within each category
 */
function balanceInsightCategories(insights: IInsight[]): IInsight[] {
  if (insights.length === 0) {
    return [];
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  // Separate insights by category and sort by priority
  const alerts = insights
    .filter(i => i.category === 'alert')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const suggestions = insights
    .filter(i => i.category === 'advice' || i.category === 'achievement')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const balancedInsights: IInsight[] = [];

  // STRICT BALANCING: Return exactly 1 alert + 1 suggestion when both exist
  if (alerts.length > 0 && suggestions.length > 0) {
    // Perfect case: we have both categories
    balancedInsights.push(alerts[0]);      // Highest priority alert
    balancedInsights.push(suggestions[0]); // Highest priority suggestion
  } else if (alerts.length > 0) {
    // Only alerts available - return up to 2
    balancedInsights.push(...alerts.slice(0, 2));
  } else if (suggestions.length > 0) {
    // Only suggestions available - return up to 2
    balancedInsights.push(...suggestions.slice(0, 2));
  }

  return balancedInsights;
}

/**
 * Generate weekly insights for a user
 */
export async function generateWeeklyInsights(userId: string): Promise<IAIInsight> {
  await connectDB();

  const insights: IInsight[] = [];
  // Use UTC dates to match database dates
  const now = new Date();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Convert userId string to ObjectId for aggregate queries
  const userObjectId = new mongoose.Types.ObjectId(userId);

  console.log('[AI Insights] ========== GENERATING INSIGHTS ==========');
  console.log('[AI Insights] User ID:', userId);
  console.log('[AI Insights] User ObjectId:', userObjectId);
  console.log('[AI Insights] Current week:', weekAgo.toISOString(), 'to', now.toISOString());
  console.log('[AI Insights] Previous week:', twoWeeksAgo.toISOString(), 'to', weekAgo.toISOString());

  // Count total transactions for debugging
  const totalTransactions = await Transaction.countDocuments({ userId: userObjectId });
  console.log('[AI Insights] Total transactions for user:', totalTransactions);

  // Debug: Get all transactions to see their dates
  const allTransactions = await Transaction.find({ userId: userObjectId }).select('date type amount').limit(5);
  console.log('[AI Insights] Sample transaction dates:', allTransactions.map(t => ({
    date: t.date,
    type: t.type,
    amount: t.amount
  })));

  // Get current week spending
  const currentWeekResult = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: 'expense',
        date: { $gte: weekAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Get previous week spending
  const previousWeekResult = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: 'expense',
        date: { $gte: twoWeeksAgo, $lt: weekAgo },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const currentWeekSpending = currentWeekResult[0]?.total || 0;
  const previousWeekSpending = previousWeekResult[0]?.total || 0;
  const currentWeekCount = currentWeekResult[0]?.count || 0;
  const previousWeekCount = previousWeekResult[0]?.count || 0;

  console.log('[AI Insights] Current week: $', currentWeekSpending, '(', currentWeekCount, 'transactions)');
  console.log('[AI Insights] Previous week: $', previousWeekSpending, '(', previousWeekCount, 'transactions)');

  // Spending trend alert
  if (currentWeekSpending > 0 && previousWeekSpending > 0) {
    // Compare with previous week
    const percentageChange =
      ((currentWeekSpending - previousWeekSpending) / previousWeekSpending) * 100;

    if (Math.abs(percentageChange) > 10) {
      insights.push({
        category: percentageChange > 0 ? 'alert' : 'achievement',
        title:
          percentageChange > 0
            ? `Spending up ${Math.round(percentageChange)}% from last week`
            : `Great job! Spending down ${Math.abs(Math.round(percentageChange))}%`,
        description:
          percentageChange > 0
            ? `Consider reviewing your expenses to stay on track`
            : `Keep up the good financial habits`,
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
  const budgets = await Budget.find({ userId: userObjectId, isActive: true });
  console.log('[AI Insights] Found budgets:', budgets.length);
  
  for (const budget of budgets) {
    const spent = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
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

    console.log(`[AI Insights] Budget "${budget.name}": ${spentAmount}/${budget.amount} (${Math.round(percentage)}%)`);

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

  // Add category-based insights if we have current week spending
  if (currentWeekSpending > 0 && currentWeekCount > 0) {
    // Get top 2 spending categories for the week
    const topCategoriesResult = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: weekAgo, $lte: now },
          categoryId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: 2,
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
    ]);

    if (topCategoriesResult.length > 0 && topCategoriesResult[0].category.length > 0) {
      const topCategory = topCategoriesResult[0];
      const categoryName = topCategory.category[0].name;
      const categoryAmount = topCategory.total;
      const categoryPercentage = (categoryAmount / currentWeekSpending) * 100;

      if (categoryPercentage > 40) {
        // High concentration in one category - alert
        insights.push({
          category: 'alert',
          title: `${Math.round(categoryPercentage)}% of spending on ${categoryName}`,
          description: `Consider diversifying expenses or setting a budget`,
          priority: categoryPercentage > 60 ? 'high' : 'medium',
          metadata: {
            amount: categoryAmount,
            percentage: Math.round(categoryPercentage),
            categoryId: topCategory._id,
          },
          isRead: false,
          createdAt: now,
        });
      } else if (categoryPercentage > 25) {
        // Moderate concentration - advice
        insights.push({
          category: 'advice',
          title: `${categoryName} is your largest expense category`,
          description: `Track this closely to optimize your budget`,
          priority: 'medium',
          metadata: {
            amount: categoryAmount,
            percentage: Math.round(categoryPercentage),
            categoryId: topCategory._id,
          },
          isRead: false,
          createdAt: now,
        });
      }

      // Add second category insight if available
      if (topCategoriesResult.length > 1 && topCategoriesResult[1].category.length > 0 && insights.length < 2) {
        const secondCategory = topCategoriesResult[1];
        const secondCategoryName = secondCategory.category[0].name;
        const secondCategoryAmount = secondCategory.total;
        const secondCategoryPercentage = (secondCategoryAmount / currentWeekSpending) * 100;

        if (secondCategoryPercentage > 15) {
          insights.push({
            category: 'advice',
            title: `${secondCategoryName} is your second largest expense`,
            description: `Consider if this aligns with your financial goals`,
            priority: 'low',
            metadata: {
              amount: secondCategoryAmount,
              percentage: Math.round(secondCategoryPercentage),
              categoryId: secondCategory._id,
            },
            isRead: false,
            createdAt: now,
          });
        }
      }
    }
  }

  // If we still don't have 2 insights, add a general advice
  if (insights.length < 2 && currentWeekCount > 0) {
    const avgTransactionAmount = currentWeekSpending / currentWeekCount;
    insights.push({
      category: 'advice',
      title: `You made ${currentWeekCount} transactions this week`,
      description: `Average of $${avgTransactionAmount.toFixed(2)} per transaction`,
      priority: 'low',
      metadata: {
        amount: avgTransactionAmount,
        comparisonPeriod: 'week',
      },
      isRead: false,
      createdAt: now,
    });
  }

  console.log('[AI Insights] Generated insights count:', insights.length);
  console.log('[AI Insights] Generated insights by category:', {
    alerts: insights.filter(i => i.category === 'alert').length,
    advice: insights.filter(i => i.category === 'advice').length,
    achievement: insights.filter(i => i.category === 'achievement').length,
  });
  
  // Log each generated insight for debugging
  insights.forEach((insight, idx) => {
    console.log(`[AI Insights] Generated #${idx + 1}: [${insight.category.toUpperCase()}] ${insight.title} (${insight.priority})`);
  });

  // Balance insights to ensure we have at least one alert and one suggestion
  const balancedInsights = balanceInsightCategories(insights);
  console.log('[AI Insights] Balanced insights count:', balancedInsights.length);
  console.log('[AI Insights] Balanced insights by category:', {
    alerts: balancedInsights.filter(i => i.category === 'alert').length,
    suggestions: balancedInsights.filter(i => i.category === 'advice' || i.category === 'achievement').length,
  });
  
  // Log each balanced insight for debugging
  balancedInsights.forEach((insight, idx) => {
    console.log(`[AI Insights] Balanced #${idx + 1}: [${insight.category.toUpperCase()}] ${insight.title} (${insight.priority})`);
  });

  // Create insight document
  // Calculate expiration date (7 days for weekly insights)
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 7);

  const aiInsight = await AIInsight.create({
    userId,
    type: 'weekly',
    insights: balancedInsights,
    generatedAt: now,
    expiresAt,
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
