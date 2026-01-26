import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, validateQueryParams, ValidationSchemas } from '@/lib/utils/validation';
import Transaction from '@/lib/db/models/Transaction';
import { createTransaction } from '@/lib/services/transactionService';
import mongoose from 'mongoose';

// GET /api/transactions - List transactions with filters
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Validate query parameters
  const validation = validateQueryParams(request, ValidationSchemas.transaction.query);
  if (!validation.success) return validation.response;

  const { type, accountId, categoryId, startDate, endDate, limit, skip } = validation.data;

  // Build match filter for aggregation
  const matchFilter: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(request.userId)
  };

  if (type) matchFilter.type = type;
  if (accountId) matchFilter.accountId = new mongoose.Types.ObjectId(accountId);
  if (categoryId) matchFilter.categoryId = new mongoose.Types.ObjectId(categoryId);
  if (startDate || endDate) {
    matchFilter.date = {};
    if (startDate) (matchFilter.date as Record<string, unknown>).$gte = new Date(startDate);
    if (endDate) (matchFilter.date as Record<string, unknown>).$lte = new Date(endDate);
  }

  // Use aggregation with $facet to get both data and count in a single query
  const [result] = await Transaction.aggregate([
    { $match: matchFilter },
    {
      $facet: {
        data: [
          { $sort: { date: -1, createdAt: -1 } },
          { $skip: skip || 0 },
          { $limit: limit || 50 },
          {
            $lookup: {
              from: 'accounts',
              localField: 'accountId',
              foreignField: '_id',
              as: 'accountId',
            },
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'toAccountId',
              foreignField: '_id',
              as: 'toAccountId',
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'categoryId',
            },
          },
          {
            $unwind: {
              path: '$accountId',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $unwind: {
              path: '$toAccountId',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: '$categoryId',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              userId: 1,
              type: 1,
              amount: 1,
              description: 1,
              tags: 1,
              date: 1,
              attachments: 1,
              aiGenerated: 1,
              metadata: 1,
              createdAt: 1,
              updatedAt: 1,
              'accountId._id': 1,
              'accountId.name': 1,
              'accountId.type': 1,
              'accountId.icon': 1,
              'accountId.color': 1,
              'toAccountId._id': 1,
              'toAccountId.name': 1,
              'toAccountId.type': 1,
              'toAccountId.icon': 1,
              'toAccountId.color': 1,
              'categoryId._id': 1,
              'categoryId.name': 1,
              'categoryId.icon': 1,
              'categoryId.color': 1,
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const transactions = result.data || [];
  const total = result.total[0]?.count || 0;

  return ApiResponse.paginated(transactions, total, limit || 50, skip || 0);
});

// POST /api/transactions - Create a new transaction
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const body = await request.json();

  // Validate request body
  const validation = validateRequest(ValidationSchemas.transaction.create, body);
  if (!validation.success) return validation.response;

  const data = validation.data;

  try {
    // Create transaction with balance updates
    const transaction = await createTransaction({
      ...data,
      userId: request.userId,
      date: data.date ? new Date(data.date) : new Date(),
      attachments: data.attachments?.map((url: string) => ({ url, type: 'unknown' })),
    });

    // Populate all references in a single call using array syntax
    await transaction.populate([
      { path: 'accountId', select: 'name type icon color' },
      { path: 'toAccountId', select: 'name type icon color' },
      { path: 'categoryId', select: 'name icon color' }
    ]);

    return ApiResponse.created(transaction, 'Transaction created successfully');
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return ApiResponse.notFound(error.message.includes('Destination') ? 'Destination account' : 'Account');
      }
      return ApiResponse.badRequest(error.message);
    }
    return ApiResponse.serverError();
  }
});
