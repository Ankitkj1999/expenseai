import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import analyticsService from '@/lib/services/analyticsService';
import connectDB from '@/lib/db/mongodb';

/**
 * GET /api/analytics/summary
 * Get expense/income summary for a period
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
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

    const summary = await analyticsService.getSummary(authResult.userId, {
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch summary',
      },
      { status: 500 }
    );
  }
}
