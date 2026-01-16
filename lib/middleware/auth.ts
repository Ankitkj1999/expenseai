import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import connectDB from '@/lib/db/mongodb';
import User, { IUser } from '@/lib/db/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser;
  userId?: string;
}

/**
 * Middleware to authenticate requests using JWT token
 * Extracts token from HTTP-only cookie
 */
export async function authenticate(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: IUser;
  userId?: string;
  error?: string;
}> {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return {
        authenticated: false,
        error: 'No token provided',
      };
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        authenticated: false,
        error: 'Invalid or expired token',
      };
    }

    // Connect to database and get user
    await connectDB();
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return {
        authenticated: false,
        error: 'User not found',
      };
    }

    return {
      authenticated: true,
      user,
      userId: decoded.userId,
    };
  } catch (error) {
    return {
      authenticated: false,
      error: 'Authentication failed',
    };
  }
}
