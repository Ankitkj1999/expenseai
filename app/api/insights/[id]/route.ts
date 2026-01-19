import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as insightService from '@/lib/services/insightService';

/**
 * DELETE /api/insights/[id]
 * Delete/dismiss a specific insight
 */
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  await insightService.deleteInsight(request.userId, id);
  
  return ApiResponse.successWithMessage({}, 'Insight deleted successfully');
});
