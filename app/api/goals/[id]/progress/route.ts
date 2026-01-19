import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as goalService from '@/lib/services/goalService';

/**
 * GET /api/goals/[id]/progress
 * Get goal progress with projections
 */
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const progressData = await goalService.getGoalProgress(request.userId, id);
  
  return ApiResponse.success(progressData);
});
