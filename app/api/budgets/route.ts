import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import budgetService from '@/lib/services/budgetService';
import connectDB from '@/lib/db/mongodb';

/**
 * GET /api/budgets
 * List all budgets for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
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

    const budgets = await budgetService.getBudgets(authResult.userId, filters);

    return NextResponse.json({
      success: true,
      data: budgets,
      count: budgets.length,
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch budgets',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budgets
 * Create a new budget
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

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
      userId: authResult.userId,
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
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create budget',
      },
      { status: 500 }
    );
  }
}
