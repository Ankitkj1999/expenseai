import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as goalService from '@/lib/services/goalService';

/**
 * POST /api/goals/[id]/contribute
 * Add a contribution to a goal
 */
export const POST = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  const body = await request.json();
  
  if (!body.amount || body.amount <= 0) {
    return ApiResponse.badRequest('Amount must be greater than 0');
  }
  
  const goal = await goalService.addContribution(
    request.userId,
    id,
    body.amount,
    body.note
  );
  
  if (!goal) {
    return ApiResponse.notFound('Goal');
  }
  
  return ApiResponse.successWithMessage(goal, 'Contribution added successfully');
});
