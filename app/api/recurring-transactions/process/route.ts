import { NextRequest, NextResponse } from 'next/server';
import { withCronAuth } from '@/lib/middleware/withCronAuth';
import * as recurringTransactionService from '@/lib/services/recurringTransactionService';

/**
 * GET /api/recurring-transactions/process
 * Process all due recurring transactions (cron job endpoint)
 * 
 * This endpoint is called by Vercel Cron on an hourly schedule.
 * It creates actual transactions from recurring templates that are due.
 * 
 * Authentication: Requires CRON_SECRET in Authorization header or x-vercel-cron-secret header
 * Schedule: Every hour (0 * * * *)
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
      endpoint: '/api/recurring-transactions/process',
      message: 'Cron endpoint is configured and ready'
    });
  }
  
  // Authenticated mode: Process cron job
  return withCronAuth(async (req: NextRequest) => {
    const startTime = Date.now();
    
    console.log('Starting recurring transactions processing', {
      timestamp: new Date().toISOString(),
    });

    try {
      const results = await recurringTransactionService.processDueRecurringTransactions();
      
      const duration = Date.now() - startTime;
      
      console.log('Recurring transactions processing completed', {
        processed: results.processed,
        failed: results.failed,
        skipped: results.skipped,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      // Log errors if any
      if (results.errors.length > 0) {
        console.error('Errors during recurring transaction processing:', results.errors);
      }

      return NextResponse.json({
        success: true,
        data: {
          processed: results.processed,
          failed: results.failed,
          skipped: results.skipped,
          errors: results.errors,
          duration,
        },
        message: `Processed ${results.processed} recurring transactions, ${results.failed} failed, ${results.skipped} skipped`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error('Fatal error in recurring transactions processing:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process recurring transactions',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  })(request);
};
