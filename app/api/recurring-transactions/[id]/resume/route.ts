import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as recurringTransactionService from '@/lib/services/recurringTransactionService';

/**
 * POST /api/recurring-transactions/[id]/resume
 * Resume a paused recurring transaction
 */
export const POST = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const recurringTransaction = await recurringTransactionService.resumeRecurringTransaction(
    request.userId,
    id
  );
  
  if (!recurringTransaction) {
    return ApiResponse.notFound('Recurring transaction');
  }
  
  return ApiResponse.successWithMessage(recurringTransaction, 'Recurring transaction resumed successfully');
});
