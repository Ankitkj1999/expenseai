import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Transaction from '@/lib/db/models/Transaction';
import { authenticate } from '@/lib/middleware/auth';
import { updateTransaction, deleteTransaction } from '@/lib/services/transactionService';

// GET /api/transactions/[id] - Get a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find transaction
    const transaction = await Transaction.findOne({
      _id: params.id,
      userId: auth.userId,
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
  } catch (error) {
    console.error('Get transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

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
    const transaction = await updateTransaction(auth.userId, params.id, updates);

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
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete transaction with balance reversion
    await deleteTransaction(auth.userId, params.id);

    return NextResponse.json({
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
