import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as insightService from '@/lib/services/insightService';

/**
 * POST /api/insights/process
 * Process insights for all users (cron job endpoint)
 * This endpoint should be called by a cron job or scheduler
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Optional: Add authentication check for cron job
  // You might want to use a secret token or API key for this endpoint
  
  const results = await insightService.processAllUserInsights();
  
  return ApiResponse.success({
    processed: results.processed,
    failed: results.failed,
    message: `Generated insights for ${results.processed} users, ${results.failed} failed`,
  });
});
