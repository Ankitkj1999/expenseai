import { NextRequest, NextResponse } from 'next/server';
import { withCronAuth } from '@/lib/middleware/withCronAuth';
import * as recurringTransactionService from '@/lib/services/recurringTransactionService';

/**
 * POST /api/recurring-transactions/process
 * Process all due recurring transactions (cron job endpoint)
 *
 * This endpoint is called by Vercel Cron on an hourly schedule.
 * It creates actual transactions from recurring templates that are due.
 *
 * Authentication: Requires CRON_SECRET in Authorization header
 * Schedule: Every hour (0 * * * *)
 */
export const POST = withCronAuth(async (request: NextRequest) => {
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
});
