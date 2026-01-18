import { NextResponse } from 'next/server';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import budgetService from '@/lib/services/budgetService';

/**
 * GET /api/budgets/[id]/status
 * Get budget usage status with spending information
 */
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  const status = await budgetService.getBudgetStatus(id, request.userId);

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
});
