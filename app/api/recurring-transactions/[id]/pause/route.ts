import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as recurringTransactionService from '@/lib/services/recurringTransactionService';

/**
 * POST /api/recurring-transactions/[id]/pause
 * Pause a recurring transaction
 */
export const POST = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const recurringTransaction = await recurringTransactionService.pauseRecurringTransaction(
    request.userId,
    id
  );
  
  if (!recurringTransaction) {
    return ApiResponse.notFound('Recurring transaction');
  }
  
  return ApiResponse.successWithMessage(recurringTransaction, 'Recurring transaction paused successfully');
});
