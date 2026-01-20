import { NextRequest, NextResponse } from 'next/server';
import { withCronAuth } from '@/lib/middleware/withCronAuth';
import * as insightService from '@/lib/services/insightService';

/**
 * POST /api/insights/process
 * Process AI insights for all users (cron job endpoint)
 *
 * This endpoint is called by Vercel Cron on a weekly schedule.
 * It generates AI-powered spending insights, alerts, and advice for all users.
 *
 * Authentication: Requires CRON_SECRET in Authorization header
 * Schedule: Every Sunday at 8 PM UTC (0 20 * * 0)
 */
export const POST = withCronAuth(async (request: NextRequest) => {
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
});
