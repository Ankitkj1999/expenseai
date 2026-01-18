import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import analyticsService from '@/lib/services/analyticsService';
import connectDB from '@/lib/db/mongodb';

/**
 * GET /api/analytics/comparison
 * Compare spending between two periods
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
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

    const comparison = await analyticsService.getComparison(authResult.userId, {
      currentPeriod,
      previousPeriod,
    });

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch comparison',
      },
      { status: 500 }
    );
  }
}
