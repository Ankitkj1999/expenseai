import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import analyticsService from '@/lib/services/analyticsService';
import connectDB from '@/lib/db/mongodb';

/**
 * GET /api/analytics/trends
 * Get spending trends over time
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
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

    const trends = await analyticsService.getTrends(authResult.userId, {
      period,
      groupBy,
    });

    return NextResponse.json({
      success: true,
      data: trends,
      count: trends.length,
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trends',
      },
      { status: 500 }
    );
  }
}
