import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import budgetService from '@/lib/services/budgetService';

/**
 * GET /api/budgets/[id]/status
 * Get budget usage status with spending information
 */
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const status = await budgetService.getBudgetStatus(id, request.userId);
  if (!status) return ApiResponse.notFound('Budget');
  
  return ApiResponse.success(status);
});
