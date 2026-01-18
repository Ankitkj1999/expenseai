import { NextResponse } from 'next/server';
import Account from '@/lib/db/models/Account';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';

// GET /api/accounts/[id] - Get a specific account
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  // Find account
  const account = await Account.findOne({
    _id: id,
    userId: request.userId,
  });

  if (!account) {
    return NextResponse.json(
      { error: 'Account not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ account });
});

// PUT /api/accounts/[id] - Update an account
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

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

  // Find and update account
  const account = await Account.findOneAndUpdate(
    { _id: id, userId: request.userId },
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
});

// DELETE /api/accounts/[id] - Delete an account (soft delete)
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  // Soft delete by setting isActive to false
  const account = await Account.findOneAndUpdate(
    { _id: id, userId: request.userId },
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
});
