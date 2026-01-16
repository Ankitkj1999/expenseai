import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticate(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return user data (password is already excluded by middleware)
    return NextResponse.json(
      {
        user: {
          id: authResult.user._id,
          email: authResult.user.email,
          createdAt: authResult.user.createdAt,
          updatedAt: authResult.user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
