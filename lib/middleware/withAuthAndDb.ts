import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from './auth';
import connectDB from '@/lib/db/mongodb';
import { validateRequestSize, SIZE_LIMITS } from './withSizeLimit';
import { IUser } from '@/lib/db/models/User';

/**
 * Extended NextRequest with authenticated user ID and full user object
 */
export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  user: IUser;
}

/**
 * Handler function type for authenticated routes
 */
export type AuthenticatedHandler<T = unknown> = (
  request: AuthenticatedRequest,
  context?: T
) => Promise<Response>;

/**
 * Handler function type for routes that only need DB
 */
export type DbHandler<T = unknown> = (
  request: NextRequest,
  context?: T
) => Promise<Response>;

/**
 * Middleware that combines authentication and database connection
 * Eliminates repetitive auth + DB code in every route handler
 * 
 * @example
 * export const GET = withAuthAndDb(async (request) => {
 *   // request.userId is available here
 *   const data = await Model.find({ userId: request.userId });
 *   return NextResponse.json({ data });
 * });
 */
export function withAuthAndDb<T = unknown>(
  handler: AuthenticatedHandler<T>
) {
  return async (request: NextRequest, context?: T): Promise<Response> => {
    try {
      // Validate request size first (before reading body)
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        try {
          await validateRequestSize(request, SIZE_LIMITS.default);
        } catch (error) {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Request too large' },
            { status: 413 }
          );
        }
      }

      // Authenticate user
      const auth = await authenticate(request);
      
      if (!auth.authenticated || !auth.userId || !auth.user) {
        return NextResponse.json(
          { error: auth.error || 'Unauthorized' },
          { status: 401 }
        );
      }

      // Connect to database
      await connectDB();

      // Attach userId and user object to request for handler
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.userId = auth.userId;
      authenticatedRequest.user = auth.user;

      // Call the actual handler
      return handler(authenticatedRequest, context);
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware for routes that only need DB connection (e.g., login, register)
 * Does not perform authentication
 * 
 * @example
 * export const POST = withDb(async (request) => {
 *   const body = await request.json();
 *   // DB is connected, no auth required
 *   return NextResponse.json({ success: true });
 * });
 */
export function withDb<T = unknown>(
  handler: DbHandler<T>
) {
  return async (request: NextRequest, context?: T): Promise<Response> => {
    try {
      // Validate request size for auth routes (smaller limit)
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        try {
          await validateRequestSize(request, SIZE_LIMITS.auth);
        } catch (error) {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Request too large' },
            { status: 413 }
          );
        }
      }

      // Connect to database
      await connectDB();
      
      // Call the actual handler
      return handler(request, context);
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
