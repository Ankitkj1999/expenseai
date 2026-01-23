import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as recurringTransactionService from '@/lib/services/recurringTransactionService';

/**
 * GET /api/recurring-transactions/[id]
 * Get a specific recurring transaction
 */
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const recurringTransaction = await recurringTransactionService.getRecurringTransactionById(
    request.userId,
    id
  );
  
  if (!recurringTransaction) {
    return ApiResponse.notFound('Recurring transaction');
  }
  
  return ApiResponse.success(recurringTransaction);
});

/**
 * PUT /api/recurring-transactions/[id]
 * Update a recurring transaction
 */
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  const body = await request.json();
  
  // Validate type if provided
  if (body.type && !['expense', 'income'].includes(body.type)) {
    return ApiResponse.badRequest('Type must be expense or income');
  }
  
  // Validate frequency if provided
  if (body.frequency && !['daily', 'weekly', 'monthly', 'yearly'].includes(body.frequency)) {
    return ApiResponse.badRequest('Invalid frequency');
  }
  
  // Validate amount if provided
  if (body.amount !== undefined && body.amount <= 0) {
    return ApiResponse.badRequest('Amount must be greater than 0');
  }
  
  // Validate interval if provided
  if (body.interval !== undefined && body.interval < 1) {
    return ApiResponse.badRequest('Interval must be at least 1');
  }
  
  const updates: Record<string, unknown> = {};
  
  if (body.type) updates.type = body.type;
  if (body.amount) updates.amount = body.amount;
  if (body.description) updates.description = body.description;
  if (body.accountId) updates.accountId = body.accountId;
  if (body.categoryId) updates.categoryId = body.categoryId;
  if (body.frequency) updates.frequency = body.frequency;
  if (body.interval) updates.interval = body.interval;
  if (body.startDate) updates.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) updates.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.metadata) updates.metadata = body.metadata;
  if (body.isActive !== undefined) updates.isActive = body.isActive;
  
  const recurringTransaction = await recurringTransactionService.updateRecurringTransaction(
    request.userId,
    id,
    updates
  );
  
  if (!recurringTransaction) {
    return ApiResponse.notFound('Recurring transaction');
  }
  
  return ApiResponse.successWithMessage(recurringTransaction, 'Recurring transaction updated successfully');
});

/**
 * DELETE /api/recurring-transactions/[id]
 * Delete a recurring transaction
 */
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  try {
    await recurringTransactionService.deleteRecurringTransaction(request.userId, id);
    
    return ApiResponse.successWithMessage({}, 'Recurring transaction deleted successfully');
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return ApiResponse.notFound('Recurring transaction');
      }
      return ApiResponse.badRequest(error.message);
    }
    return ApiResponse.serverError();
  }
});
