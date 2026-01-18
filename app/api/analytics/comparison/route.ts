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
  
  const comparison = await analyticsService.getComparison(request.userId, {
    currentPeriod,
    previousPeriod,
  });
  
  return ApiResponse.success(comparison);
});
