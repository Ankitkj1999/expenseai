import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateQueryParams, ValidationSchemas } from '@/lib/utils/validation';
import analyticsService from '@/lib/services/analyticsService';

/**
 * GET /api/analytics/category-breakdown
 * Get category-wise breakdown of expenses or income
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Validate query parameters
  const validation = validateQueryParams(request, ValidationSchemas.analytics.categoryBreakdown);
  if (!validation.success) return validation.response;
  
  const { type, period, startDate, endDate } = validation.data;
  
  // Default to 'expense' if type is not provided
  const transactionType = type || 'expense';
  
  const breakdown = await analyticsService.getCategoryBreakdown(request.userId, {
    type: transactionType as 'expense' | 'income',
    period,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });
  
  return ApiResponse.success({ data: breakdown, count: breakdown.length });
});
