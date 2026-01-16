import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Account from '@/lib/db/models/Account';
import { authenticate } from '@/lib/middleware/auth';

// PUT /api/accounts/[id] - Update an account
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
    const { name, type, balance, currency, icon, color, isActive } = body;

    // Validate type if provided
    if (type) {
      const validTypes = ['cash', 'bank', 'credit', 'wallet'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Invalid account type' },
          { status: 400 }
        );
      }
    }

    // Connect to database
    await connectDB();

    // Find and update account
    const account = await Account.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      {
        ...(name && { name }),
        ...(type && { type }),
        ...(balance !== undefined && { balance }),
        ...(currency && { currency }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true }
    );

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Account updated successfully',
      account,
    });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Delete an account (soft delete)
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

    // Connect to database
    await connectDB();

    // Soft delete by setting isActive to false
    const account = await Account.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      { isActive: false },
      { new: true }
    );

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/accounts/[id] - Get a specific account
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

    // Find account
    const account = await Account.findOne({
      _id: params.id,
      userId: auth.userId,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Get account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
