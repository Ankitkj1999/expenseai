import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as insightService from '@/lib/services/insightService';

/**
 * GET /api/insights
 * Get current cached insights for the authenticated user
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const insights = await insightService.getInsights(request.userId);
  
  return ApiResponse.success({
    data: insights,
    count: insights.length,
  });
});

/**
 * POST /api/insights
 * Manually trigger insight generation (rate-limited)
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // TODO: Add rate limiting (e.g., once per hour per user)
  
  const insight = await insightService.generateWeeklyInsights(request.userId);
  
  return ApiResponse.created(insight, 'Insights generated successfully');
});
