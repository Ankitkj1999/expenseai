import { NextResponse } from 'next/server';
import Account from '@/lib/db/models/Account';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';

// GET /api/accounts - List all accounts for the authenticated user
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Get all accounts for the user
  const accounts = await Account.find({ 
    userId: request.userId,
    isActive: true 
  }).sort({ createdAt: -1 });

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return NextResponse.json({
    accounts,
    totalBalance,
    count: accounts.length,
  });
});

// POST /api/accounts - Create a new account
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Parse request body
  const body = await request.json();
  const { name, type, balance = 0, currency = 'INR', icon, color } = body;

  // Validate required fields
  if (!name || !type) {
    return NextResponse.json(
      { error: 'Name and type are required' },
      { status: 400 }
    );
  }

  // Validate type
  const validTypes = ['cash', 'bank', 'credit', 'wallet'];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: 'Invalid account type' },
      { status: 400 }
    );
  }

  // Create account
  const account = await Account.create({
    userId: request.userId,
    name,
    type,
    balance,
    currency,
    icon: icon || 'wallet',
    color: color || '#3B82F6',
  });

  return NextResponse.json(
    {
      message: 'Account created successfully',
      account,
    },
    { status: 201 }
  );
});
