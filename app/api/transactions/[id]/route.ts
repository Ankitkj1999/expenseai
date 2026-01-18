import { NextResponse } from 'next/server';
import Transaction from '@/lib/db/models/Transaction';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { updateTransaction, deleteTransaction } from '@/lib/services/transactionService';

// GET /api/transactions/[id] - Get a specific transaction
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  // Find transaction
  const transaction = await Transaction.findOne({
    _id: id,
    userId: request.userId,
  })
    .populate('accountId', 'name type icon color')
    .populate('toAccountId', 'name type icon color')
    .populate('categoryId', 'name icon color');

  if (!transaction) {
    return NextResponse.json(
      { error: 'Transaction not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ transaction });
});

// PUT /api/transactions/[id] - Update a transaction
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  // Parse request body
  const body = await request.json();
  const {
    type,
    amount,
    description,
    accountId,
    toAccountId,
    categoryId,
    tags,
    date,
    attachments,
    aiGenerated,
    metadata,
  } = body;

  // Validate type if provided
  if (type && !['expense', 'income', 'transfer'].includes(type)) {
    return NextResponse.json(
      { error: 'Type must be expense, income, or transfer' },
      { status: 400 }
    );
  }

  // Build updates object
  const updates: Record<string, unknown> = {};
  if (type !== undefined) updates.type = type;
  if (amount !== undefined) updates.amount = amount;
  if (description !== undefined) updates.description = description;
  if (accountId !== undefined) updates.accountId = accountId;
  if (toAccountId !== undefined) updates.toAccountId = toAccountId;
  if (categoryId !== undefined) updates.categoryId = categoryId;
  if (tags !== undefined) updates.tags = tags;
  if (date !== undefined) updates.date = new Date(date);
  if (attachments !== undefined) updates.attachments = attachments;
  if (aiGenerated !== undefined) updates.aiGenerated = aiGenerated;
  if (metadata !== undefined) updates.metadata = metadata;

  // Update transaction with balance adjustments
  const transaction = await updateTransaction(request.userId, id, updates);

  // Populate references
  await transaction.populate('accountId', 'name type icon color');
  if (transaction.toAccountId) {
    await transaction.populate('toAccountId', 'name type icon color');
  }
  if (transaction.categoryId) {
    await transaction.populate('categoryId', 'name icon color');
  }

  return NextResponse.json({
    message: 'Transaction updated successfully',
    transaction,
  });
});

// DELETE /api/transactions/[id] - Delete a transaction
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  // Delete transaction with balance reversion
  await deleteTransaction(request.userId, id);

  return NextResponse.json({
    message: 'Transaction deleted successfully',
  });
});
