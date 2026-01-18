import { NextResponse } from 'next/server';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import analyticsService from '@/lib/services/analyticsService';

/**
 * GET /api/analytics/category-breakdown
 * Get category-wise breakdown of expenses or income
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'expense' | 'income' || 'expense';
  const period = searchParams.get('period') as 'today' | 'week' | 'month' | 'year' | 'custom' || 'month';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Validate type
  if (!['expense', 'income'].includes(type)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid type. Must be: expense or income',
      },
      { status: 400 }
    );
  }

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

  const breakdown = await analyticsService.getCategoryBreakdown(request.userId, {
    type,
    period,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  return NextResponse.json({
    success: true,
    data: breakdown,
    count: breakdown.length,
  });
});
