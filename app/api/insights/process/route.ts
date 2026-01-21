import { NextRequest, NextResponse } from 'next/server';
import { withCronAuth } from '@/lib/middleware/withCronAuth';
import * as insightService from '@/lib/services/insightService';

/**
 * GET /api/insights/process
 * Process AI insights for all users (cron job endpoint)
 * 
 * This endpoint is called by Vercel Cron on a weekly schedule.
 * It generates AI-powered spending insights, alerts, and advice for all users.
 * 
 * Authentication: Requires CRON_SECRET in Authorization header or x-vercel-cron-secret header
 * Schedule: Every Sunday at 8 PM UTC (0 20 * * 0)
 * 
 * Health Check Mode: Returns 200 OK without auth for Vercel validation
 */
export const GET = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  const vercelCronSecret = request.headers.get('x-vercel-cron-secret');
  
  // Health check mode: If no auth headers, return ready status
  // This allows Vercel to validate the endpoint exists during deployment
  if (!authHeader && !vercelCronSecret) {
    return NextResponse.json({ 
      status: 'ready',
      endpoint: '/api/insights/process',
      message: 'Cron endpoint is configured and ready'
    });
  }
  
  // Authenticated mode: Process cron job
  return withCronAuth(async (req: NextRequest) => {
    const startTime = Date.now();
    
    console.log('Starting AI insights processing for all users', {
      timestamp: new Date().toISOString(),
    });

    try {
      const results = await insightService.processAllUserInsights();
      
      const duration = Date.now() - startTime;
      
      console.log('AI insights processing completed', {
        processed: results.processed,
        failed: results.failed,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      // Log errors if any
      if (results.failed > 0) {
        console.error('Some users failed during insight processing', {
          failedCount: results.failed,
          processedCount: results.processed,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          processed: results.processed,
          failed: results.failed,
          duration,
        },
        message: `Generated insights for ${results.processed} users, ${results.failed} failed`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error('Fatal error in AI insights processing:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process AI insights',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  })(request);
};
