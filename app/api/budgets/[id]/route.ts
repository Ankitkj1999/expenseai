import { NextResponse } from 'next/server';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import budgetService from '@/lib/services/budgetService';

/**
 * GET /api/budgets/[id]
 * Get a single budget by ID
 */
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  const budget = await budgetService.getBudgetById(id, request.userId);

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
});

/**
 * PUT /api/budgets/[id]
 * Update a budget
 */
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  const body = await request.json();

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
    id,
    request.userId,
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
});

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
 */
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  const deleted = await budgetService.deleteBudget(id, request.userId);

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
});
