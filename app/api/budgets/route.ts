import { NextResponse } from 'next/server';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import budgetService from '@/lib/services/budgetService';

/**
 * GET /api/budgets
 * List all budgets for the authenticated user
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get('isActive');
  const categoryId = searchParams.get('categoryId');
  const period = searchParams.get('period');

  const filters: {
    isActive?: boolean;
    categoryId?: string;
    period?: string;
  } = {};

  if (isActive !== null) {
    filters.isActive = isActive === 'true';
  }

  if (categoryId) {
    filters.categoryId = categoryId;
  }

  if (period) {
    filters.period = period;
  }

  const budgets = await budgetService.getBudgets(request.userId, filters);

  return NextResponse.json({
    success: true,
    data: budgets,
    count: budgets.length,
  });
});

/**
 * POST /api/budgets
 * Create a new budget
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const body = await request.json();

  // Validation
  if (!body.name || !body.amount || !body.period || !body.startDate || !body.endDate) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required fields: name, amount, period, startDate, endDate',
      },
      { status: 400 }
    );
  }

  if (body.amount <= 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Amount must be greater than 0',
      },
      { status: 400 }
    );
  }

  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(body.period)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid period. Must be: daily, weekly, monthly, or yearly',
      },
      { status: 400 }
    );
  }

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

  const budget = await budgetService.createBudget({
    userId: request.userId,
    name: body.name,
    categoryId: body.categoryId,
    amount: body.amount,
    period: body.period,
    startDate,
    endDate,
    alertThreshold: body.alertThreshold,
  });

  return NextResponse.json(
    {
      success: true,
      data: budget,
      message: 'Budget created successfully',
    },
    { status: 201 }
  );
});
