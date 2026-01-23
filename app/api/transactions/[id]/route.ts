import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, ValidationSchemas } from '@/lib/utils/validation';
import Transaction from '@/lib/db/models/Transaction';
import { updateTransaction, deleteTransaction } from '@/lib/services/transactionService';

// GET /api/transactions/[id] - Get a specific transaction
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  // Find transaction with all populates in a single call
  const transaction = await Transaction.findOne({
    _id: id,
    userId: request.userId,
  }).populate([
    { path: 'accountId', select: 'name type icon color' },
    { path: 'toAccountId', select: 'name type icon color' },
    { path: 'categoryId', select: 'name icon color' }
  ]);
  
  if (!transaction) return ApiResponse.notFound('Transaction');
  
  return ApiResponse.success({ transaction });
});

// PUT /api/transactions/[id] - Update a transaction
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequest(ValidationSchemas.transaction.update, body);
  if (!validation.success) return validation.response;
  
  // Build updates object
  const updates: Record<string, unknown> = {};
  const data = validation.data;
  
  if (data.type !== undefined) updates.type = data.type;
  if (data.amount !== undefined) updates.amount = data.amount;
  if (data.description !== undefined) updates.description = data.description;
  if (data.accountId !== undefined) updates.accountId = data.accountId;
  if (data.toAccountId !== undefined) updates.toAccountId = data.toAccountId;
  if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.date !== undefined) updates.date = new Date(data.date);
  if (data.attachments !== undefined) updates.attachments = data.attachments;
  if (data.aiGenerated !== undefined) updates.aiGenerated = data.aiGenerated;
  if (data.metadata !== undefined) updates.metadata = data.metadata;
  
  try {
    // Update transaction with balance adjustments
    const transaction = await updateTransaction(request.userId, id, updates);
    
    // Populate all references in a single call using array syntax
    await transaction.populate([
      { path: 'accountId', select: 'name type icon color' },
      { path: 'toAccountId', select: 'name type icon color' },
      { path: 'categoryId', select: 'name icon color' }
    ]);
    
    return ApiResponse.successWithMessage({ transaction }, 'Transaction updated successfully');
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return ApiResponse.notFound('Transaction');
      }
      return ApiResponse.badRequest(error.message);
    }
    return ApiResponse.serverError();
  }
});

// DELETE /api/transactions/[id] - Delete a transaction
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  try {
    // Delete transaction with balance reversion
    await deleteTransaction(request.userId, id);
    
    return ApiResponse.successWithMessage({}, 'Transaction deleted successfully');
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return ApiResponse.notFound('Transaction');
      }
      return ApiResponse.badRequest(error.message);
    }
    return ApiResponse.serverError();
  }
});
