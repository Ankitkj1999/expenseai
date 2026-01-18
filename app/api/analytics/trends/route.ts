import { NextResponse } from 'next/server';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import analyticsService from '@/lib/services/analyticsService';

/**
 * GET /api/analytics/trends
 * Get spending trends over time
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') as 'week' | 'month' | 'year' || 'month';
  const groupBy = searchParams.get('groupBy') as 'day' | 'week' | 'month' || 'day';

  // Validate period
  if (!['week', 'month', 'year'].includes(period)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid period. Must be: week, month, or year',
      },
      { status: 400 }
    );
  }

  // Validate groupBy
  if (!['day', 'week', 'month'].includes(groupBy)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid groupBy. Must be: day, week, or month',
      },
      { status: 400 }
    );
  }

  const trends = await analyticsService.getTrends(request.userId, {
    period,
    groupBy,
  });

  return NextResponse.json({
    success: true,
    data: trends,
    count: trends.length,
  });
});
