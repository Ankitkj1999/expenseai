import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as recurringTransactionService from '@/lib/services/recurringTransactionService';

/**
 * GET /api/recurring-transactions
 * List all recurring transactions for the authenticated user
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  
  const filters: {
    type?: string;
    isActive?: boolean;
    accountId?: string;
    categoryId?: string;
  } = {};
  
  const type = searchParams.get('type');
  const isActive = searchParams.get('isActive');
  const accountId = searchParams.get('accountId');
  const categoryId = searchParams.get('categoryId');
  
  if (type) filters.type = type;
  if (isActive !== null) filters.isActive = isActive === 'true';
  if (accountId) filters.accountId = accountId;
  if (categoryId) filters.categoryId = categoryId;
  
  const recurringTransactions = await recurringTransactionService.getRecurringTransactions(
    request.userId,
    filters
  );
  
  return ApiResponse.success({
    data: recurringTransactions,
    count: recurringTransactions.length,
  });
});

/**
 * POST /api/recurring-transactions
 * Create a new recurring transaction
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const body = await request.json();
  
  // Validate required fields
  if (!body.type || !body.amount || !body.description || !body.accountId || !body.categoryId || !body.frequency) {
    return ApiResponse.badRequest('Missing required fields');
  }
  
  if (!['expense', 'income'].includes(body.type)) {
    return ApiResponse.badRequest('Type must be expense or income');
  }
  
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(body.frequency)) {
    return ApiResponse.badRequest('Invalid frequency');
  }
  
  if (body.amount <= 0) {
    return ApiResponse.badRequest('Amount must be greater than 0');
  }
  
  if (body.interval && body.interval < 1) {
    return ApiResponse.badRequest('Interval must be at least 1');
  }
  
  const recurringTransaction = await recurringTransactionService.createRecurringTransaction(
    request.userId,
    {
      type: body.type,
      amount: body.amount,
      description: body.description,
      accountId: body.accountId,
      categoryId: body.categoryId,
      frequency: body.frequency,
      interval: body.interval || 1,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      metadata: body.metadata || {},
    }
  );
  
  return ApiResponse.created(recurringTransaction, 'Recurring transaction created successfully');
});
