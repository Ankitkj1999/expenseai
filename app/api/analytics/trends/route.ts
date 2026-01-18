import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateQueryParams, ValidationSchemas } from '@/lib/utils/validation';
import analyticsService from '@/lib/services/analyticsService';

/**
 * GET /api/analytics/trends
 * Get spending trends over time
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Validate query parameters
  const validation = validateQueryParams(request, ValidationSchemas.analytics.trends);
  if (!validation.success) return validation.response;
  
  const { period, groupBy } = validation.data;
  
  const trends = await analyticsService.getTrends(request.userId, {
    period,
    groupBy,
  });
  
  return ApiResponse.success({ data: trends, count: trends.length });
});
