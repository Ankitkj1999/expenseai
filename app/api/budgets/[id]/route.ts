import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import budgetService from '@/lib/services/budgetService';
import connectDB from '@/lib/db/mongodb';

/**
 * GET /api/budgets/[id]
 * Get a single budget by ID
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

    const budget = await budgetService.getBudgetById(params.id, authResult.userId);

    if (!budget) {
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
      data: budget,
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch budget',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/budgets/[id]
 * Update a budget
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

    // Validation for dates if provided
    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);

      if (endDate <= startDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'End date must be after start date',
          },
          { status: 400 }
        );
      }
    }

    // Validation for amount if provided
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Amount must be greater than 0',
        },
        { status: 400 }
      );
    }

    // Validation for period if provided
    if (body.period && !['daily', 'weekly', 'monthly', 'yearly'].includes(body.period)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid period. Must be: daily, weekly, monthly, or yearly',
        },
        { status: 400 }
      );
    }

    const budget = await budgetService.updateBudget(
      params.id,
      authResult.userId,
      body
    );

    if (!budget) {
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
      data: budget,
      message: 'Budget updated successfully',
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update budget',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const deleted = await budgetService.deleteBudget(params.id, authResult.userId);

    if (!deleted) {
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
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete budget',
      },
      { status: 500 }
    );
  }
}
