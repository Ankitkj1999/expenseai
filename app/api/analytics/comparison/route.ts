import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateQueryParams, ValidationSchemas } from '@/lib/utils/validation';
import analyticsService from '@/lib/services/analyticsService';

/**
 * GET /api/analytics/comparison
 * Compare spending between two periods
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Validate query parameters
  const validation = validateQueryParams(request, ValidationSchemas.analytics.comparison);
  if (!validation.success) return validation.response;
  
  const { currentPeriod, previousPeriod } = validation.data;
  
  // Default to 'month' if currentPeriod is not provided
  const current = currentPeriod || 'month';
  
  const comparison = await analyticsService.getComparison(request.userId, {
    currentPeriod: current as 'today' | 'week' | 'month' | 'year',
    previousPeriod: previousPeriod as 'today' | 'week' | 'month' | 'year' | undefined,
  });
  
  return ApiResponse.success(comparison);
});
