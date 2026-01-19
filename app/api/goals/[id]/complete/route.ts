import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as goalService from '@/lib/services/goalService';

/**
 * POST /api/goals/[id]/complete
 * Mark a goal as completed
 */
export const POST = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const goal = await goalService.completeGoal(request.userId, id);
  
  if (!goal) {
    return ApiResponse.notFound('Goal');
  }
  
  return ApiResponse.successWithMessage(goal, 'Goal marked as completed');
});
