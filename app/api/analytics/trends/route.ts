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
  
  // Default to 'month' if period is not provided
  const trendPeriod = period || 'month';
  
  const trends = await analyticsService.getTrends(request.userId, {
    period: trendPeriod as 'week' | 'month' | 'year',
    groupBy: groupBy as 'day' | 'week' | 'month' | undefined,
  });
  
  return ApiResponse.success({ data: trends, count: trends.length });
});
