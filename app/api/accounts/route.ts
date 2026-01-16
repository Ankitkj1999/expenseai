import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Account from '@/lib/db/models/Account';
import { authenticate } from '@/lib/middleware/auth';

// GET /api/accounts - List all accounts for the authenticated user
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

    // Connect to database
    await connectDB();

    // Get all accounts for the user
    const accounts = await Account.find({ 
      userId: auth.userId,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return NextResponse.json({
      accounts,
      totalBalance,
      count: accounts.length,
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Create a new account
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

    // Connect to database
    await connectDB();

    // Create account
    const account = await Account.create({
      userId: auth.userId,
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
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
