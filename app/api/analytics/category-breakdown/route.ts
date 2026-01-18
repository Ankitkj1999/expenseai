import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import analyticsService from '@/lib/services/analyticsService';
import connectDB from '@/lib/db/mongodb';

/**
 * GET /api/analytics/category-breakdown
 * Get category-wise breakdown of expenses or income
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
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

    const breakdown = await analyticsService.getCategoryBreakdown(authResult.userId, {
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
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category breakdown',
      },
      { status: 500 }
    );
  }
}
