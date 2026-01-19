import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as recurringTransactionService from '@/lib/services/recurringTransactionService';

/**
 * POST /api/recurring-transactions/process
 * Process all due recurring transactions (cron job endpoint)
 * This endpoint should be called by a cron job or scheduler
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Optional: Add authentication check for cron job
  // You might want to use a secret token or API key for this endpoint
  
  const results = await recurringTransactionService.processDueRecurringTransactions();
  
  return ApiResponse.success({
    processed: results.processed,
    failed: results.failed,
    errors: results.errors,
    message: `Processed ${results.processed} recurring transactions, ${results.failed} failed`,
  });
});
