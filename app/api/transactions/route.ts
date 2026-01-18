import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, validateQueryParams, ValidationSchemas } from '@/lib/utils/validation';
import Transaction from '@/lib/db/models/Transaction';
import { createTransaction } from '@/lib/services/transactionService';

// GET /api/transactions - List transactions with filters
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Validate query parameters
  const validation = validateQueryParams(request, ValidationSchemas.transaction.query);
  if (!validation.success) return validation.response;
  
  const { type, accountId, categoryId, startDate, endDate, limit, skip } = validation.data;
  
  // Build filter
  interface TransactionFilter {
    userId: string;
    type?: string;
    accountId?: string;
    categoryId?: string;
    date?: {
      $gte?: Date;
      $lte?: Date;
    };
  }
  
  const filter: TransactionFilter = { userId: request.userId };
  
  if (type) filter.type = type;
  if (accountId) filter.accountId = accountId;
  if (categoryId) filter.categoryId = categoryId;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  // Get transactions
  const transactions = await Transaction.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('accountId', 'name type icon color')
    .populate('toAccountId', 'name type icon color')
    .populate('categoryId', 'name icon color');
  
  // Get total count
  const total = await Transaction.countDocuments(filter);
  
  return ApiResponse.paginated(transactions, total, limit, skip);
});

// POST /api/transactions - Create a new transaction
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequest(ValidationSchemas.transaction.create, body);
  if (!validation.success) return validation.response;
  
  const data = validation.data;
  
  // Create transaction with balance updates
  const transaction = await createTransaction(request.userId, data as unknown as Parameters<typeof createTransaction>[1]);
  
  // Populate references
  await transaction.populate('accountId', 'name type icon color');
  if (data.toAccountId) {
    await transaction.populate('toAccountId', 'name type icon color');
  }
  if (data.categoryId) {
    await transaction.populate('categoryId', 'name icon color');
  }
  
  return ApiResponse.created(transaction, 'Transaction created successfully');
});
