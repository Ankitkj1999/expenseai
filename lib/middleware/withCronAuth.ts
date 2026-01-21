import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';

/**
 * Middleware to authenticate cron job requests
 *
 * Supports two authentication methods:
 * 1. Vercel's built-in x-vercel-cron-secret header (production)
 * 2. Custom Authorization Bearer token (local testing)
 */
export function withCronAuth(
  handler: (request: NextRequest) => Promise<NextResponse | Response>
) {
  return async (request: NextRequest) => {
    try {
      // Connect to database
      await connectDB();

      const cronSecret = process.env.CRON_SECRET;

      // Verify cron secret exists
      if (!cronSecret) {
        console.error('CRON_SECRET environment variable is not set');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      // Method 1: Check for Vercel's built-in cron secret header (production)
      const vercelCronSecret = request.headers.get('x-vercel-cron-secret');
      if (vercelCronSecret) {
        if (vercelCronSecret === cronSecret) {
          console.log('Cron job authenticated via Vercel header', {
            path: request.nextUrl.pathname,
            timestamp: new Date().toISOString(),
          });
          return await handler(request);
        } else {
          console.warn('Invalid Vercel cron secret', {
            path: request.nextUrl.pathname,
            timestamp: new Date().toISOString(),
          });
          return NextResponse.json(
            { error: 'Unauthorized - Invalid Vercel cron secret' },
            { status: 401 }
          );
        }
      }

      // Method 2: Check for Authorization Bearer token (local testing)
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader === `Bearer ${cronSecret}`) {
        console.log('Cron job authenticated via Authorization header', {
          path: request.nextUrl.pathname,
          timestamp: new Date().toISOString(),
        });
        return await handler(request);
      }

      // No valid authentication found
      console.warn('Unauthorized cron job attempt', {
        hasAuthHeader: !!authHeader,
        hasVercelHeader: !!vercelCronSecret,
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authentication' },
        { status: 401 }
      );
    } catch (error) {
      console.error('Error in cron auth middleware:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
