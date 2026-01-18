import { NextResponse } from 'next/server';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import analyticsService from '@/lib/services/analyticsService';

/**
 * GET /api/analytics/comparison
 * Compare spending between two periods
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const currentPeriod = searchParams.get('currentPeriod') as 'today' | 'week' | 'month' | 'year' || 'month';
  const previousPeriod = searchParams.get('previousPeriod') as 'today' | 'week' | 'month' | 'year';

  // Validate periods
  const validPeriods = ['today', 'week', 'month', 'year'];
  if (!validPeriods.includes(currentPeriod)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid currentPeriod. Must be: today, week, month, or year',
      },
      { status: 400 }
    );
  }

  if (previousPeriod && !validPeriods.includes(previousPeriod)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid previousPeriod. Must be: today, week, month, or year',
      },
      { status: 400 }
    );
  }

  const comparison = await analyticsService.getComparison(request.userId, {
    currentPeriod,
    previousPeriod,
  });

  return NextResponse.json({
    success: true,
    data: comparison,
  });
});
