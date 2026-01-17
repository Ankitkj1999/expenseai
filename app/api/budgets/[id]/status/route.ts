import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import budgetService from '@/lib/services/budgetService';
import connectDB from '@/lib/db/mongodb';

/**
 * GET /api/budgets/[id]/status
 * Get budget usage status with spending information
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const status = await budgetService.getBudgetStatus(params.id, authResult.userId);

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Budget not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error fetching budget status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch budget status',
      },
      { status: 500 }
    );
  }
}
