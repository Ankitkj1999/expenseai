import { NextResponse } from 'next/server';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import analyticsService from '@/lib/services/analyticsService';

/**
 * GET /api/analytics/summary
 * Get expense/income summary for a period
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') as 'today' | 'week' | 'month' | 'year' | 'custom' || 'month';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Validate custom period
  if (period === 'custom' && (!startDate || !endDate)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Custom period requires startDate and endDate parameters',
      },
      { status: 400 }
    );
  }

  const summary = await analyticsService.getSummary(request.userId, {
    period,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  return NextResponse.json({
    success: true,
    data: summary,
  });
});
