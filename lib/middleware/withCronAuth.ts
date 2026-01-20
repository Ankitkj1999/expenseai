import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';

/**
 * Middleware to authenticate cron job requests
 * Vercel Cron jobs should include the CRON_SECRET in the Authorization header
 */
export function withCronAuth(
  handler: (request: NextRequest) => Promise<NextResponse | Response>
) {
  return async (request: NextRequest) => {
    try {
      // Connect to database
      await connectDB();

      // Check for cron secret in Authorization header
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;

      // Verify cron secret exists
      if (!cronSecret) {
        console.error('CRON_SECRET environment variable is not set');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      // Verify authorization header
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        console.warn('Unauthorized cron job attempt', {
          hasAuthHeader: !!authHeader,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json(
          { error: 'Unauthorized - Invalid cron secret' },
          { status: 401 }
        );
      }

      // Log successful cron job execution
      console.log('Cron job authenticated successfully', {
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      });

      // Execute the handler
      return await handler(request);
    } catch (error) {
      console.error('Error in cron auth middleware:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
