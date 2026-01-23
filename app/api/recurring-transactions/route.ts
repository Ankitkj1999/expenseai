import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, CommonSchemas } from '@/lib/utils/validation';
import * as recurringTransactionService from '@/lib/services/recurringTransactionService';
import mongoose from 'mongoose';
import { z } from 'zod';

// Validation schemas
const recurringTransactionCreateSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.number().positive('Amount must be positive').max(1000000000, 'Amount too large'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  accountId: CommonSchemas.objectId,
  categoryId: CommonSchemas.objectId,
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().min(1, 'Interval must be at least 1').max(365, 'Interval too large').default(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
}).refine(
  (data) => !data.endDate || !data.startDate || new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);

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
  
  // Validate type if provided
  if (type && !['expense', 'income'].includes(type)) {
    return ApiResponse.badRequest('Invalid type. Must be expense or income');
  }
  if (type) filters.type = type;
  
  // Validate isActive if provided
  if (isActive !== null && isActive !== undefined) {
    if (!['true', 'false'].includes(isActive)) {
      return ApiResponse.badRequest('Invalid isActive value. Must be true or false');
    }
    filters.isActive = isActive === 'true';
  }
  
  // Validate ObjectIds if provided
  if (accountId) {
    if (!/^[0-9a-fA-F]{24}$/.test(accountId)) {
      return ApiResponse.badRequest('Invalid accountId format');
    }
    filters.accountId = accountId;
  }
  if (categoryId) {
    if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
      return ApiResponse.badRequest('Invalid categoryId format');
    }
    filters.categoryId = categoryId;
  }
  
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
  
  // Validate request body
  const validation = validateRequest(recurringTransactionCreateSchema, body);
  if (!validation.success) {
    return validation.response;
  }
  
  const data = validation.data;
  
  const recurringTransaction = await recurringTransactionService.createRecurringTransaction(
    request.userId,
    {
      type: data.type,
      amount: data.amount,
      description: data.description,
      accountId: new mongoose.Types.ObjectId(data.accountId),
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
      frequency: data.frequency,
      interval: data.interval,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      metadata: data.metadata,
    }
  );
  
  return ApiResponse.created(recurringTransaction, 'Recurring transaction created successfully');
});
