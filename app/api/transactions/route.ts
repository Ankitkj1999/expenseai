import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Transaction from '@/lib/db/models/Transaction';
import { authenticate } from '@/lib/middleware/auth';
import { createTransaction } from '@/lib/services/transactionService';

// GET /api/transactions - List transactions with filters
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Connect to database
    await connectDB();

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

    const filter: TransactionFilter = { userId: auth.userId };

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

    return NextResponse.json({
      transactions,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
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
      tags = [],
      date,
      attachments = [],
      aiGenerated = false,
      metadata = {},
    } = body;

    // Validate required fields
    if (!type || !amount || !description || !accountId) {
      return NextResponse.json(
        { error: 'Type, amount, description, and accountId are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['expense', 'income', 'transfer'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be expense, income, or transfer' },
        { status: 400 }
      );
    }

    // Validate transfer requirements
    if (type === 'transfer' && !toAccountId) {
      return NextResponse.json(
        { error: 'toAccountId is required for transfers' },
        { status: 400 }
      );
    }

    // Validate category requirement
    if (type !== 'transfer' && !categoryId) {
      return NextResponse.json(
        { error: 'categoryId is required for expense and income transactions' },
        { status: 400 }
      );
    }

    // Create transaction with balance updates
    const transaction = await createTransaction(auth.userId, {
      type,
      amount,
      description,
      accountId,
      toAccountId,
      categoryId,
      tags,
      date: date ? new Date(date) : new Date(),
      attachments,
      aiGenerated,
      metadata,
    });

    // Populate references
    await transaction.populate('accountId', 'name type icon color');
    if (toAccountId) {
      await transaction.populate('toAccountId', 'name type icon color');
    }
    if (categoryId) {
      await transaction.populate('categoryId', 'name icon color');
    }

    return NextResponse.json(
      {
        message: 'Transaction created successfully',
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
