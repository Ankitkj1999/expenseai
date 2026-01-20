import RecurringTransaction, { IRecurringTransaction } from '@/lib/db/models/RecurringTransaction';
import { createTransaction } from '@/lib/services/transactionService';
import connectDB from '@/lib/db/mongodb';

/**
 * Calculate next occurrence date based on frequency and interval
 */
export function calculateNextOccurrence(
  currentDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number,
  metadata?: { dayOfMonth?: number; dayOfWeek?: number }
): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;

    case 'weekly':
      next.setDate(next.getDate() + (interval * 7));
      // If dayOfWeek is specified, adjust to that day
      if (metadata?.dayOfWeek !== undefined) {
        const currentDay = next.getDay();
        const targetDay = metadata.dayOfWeek;
        const daysToAdd = (targetDay - currentDay + 7) % 7;
        if (daysToAdd > 0) {
          next.setDate(next.getDate() + daysToAdd);
        }
      }
      break;

    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      // If dayOfMonth is specified, set to that day
      if (metadata?.dayOfMonth) {
        // Handle months with fewer days (e.g., Feb 30 -> Feb 28)
        const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(metadata.dayOfMonth, lastDayOfMonth);
        next.setDate(targetDay);
      }
      break;

    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }

  return next;
}

/**
 * Get all recurring transactions for a user
 */
export async function getRecurringTransactions(
  userId: string,
  filters: {
    type?: string;
    isActive?: boolean;
    accountId?: string;
    categoryId?: string;
  } = {}
): Promise<IRecurringTransaction[]> {
  await connectDB();

  const query: Record<string, unknown> = { userId };

  if (filters.type) query.type = filters.type;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.accountId) query.accountId = filters.accountId;
  if (filters.categoryId) query.categoryId = filters.categoryId;

  const recurringTransactions = await RecurringTransaction.find(query)
    .sort({ nextOccurrence: 1, createdAt: -1 })
    .populate('accountId', 'name type icon color')
    .populate('categoryId', 'name icon color');

  return recurringTransactions;
}

/**
 * Get a single recurring transaction by ID
 */
export async function getRecurringTransactionById(
  userId: string,
  recurringTransactionId: string
): Promise<IRecurringTransaction | null> {
  await connectDB();

  const recurringTransaction = await RecurringTransaction.findOne({
    _id: recurringTransactionId,
    userId,
  })
    .populate('accountId', 'name type icon color')
    .populate('categoryId', 'name icon color');

  return recurringTransaction;
}

/**
 * Create a recurring transaction
 */
export async function createRecurringTransaction(
  userId: string,
  data: Partial<IRecurringTransaction>
): Promise<IRecurringTransaction> {
  await connectDB();

  // Calculate initial nextOccurrence if not provided
  if (!data.nextOccurrence) {
    data.nextOccurrence = calculateNextOccurrence(
      data.startDate || new Date(),
      data.frequency!,
      data.interval || 1,
      data.metadata
    );
  }

  const recurringTransaction = await RecurringTransaction.create({
    ...data,
    userId,
  });

  return recurringTransaction;
}

/**
 * Update a recurring transaction
 */
export async function updateRecurringTransaction(
  userId: string,
  recurringTransactionId: string,
  updates: Partial<IRecurringTransaction>
): Promise<IRecurringTransaction | null> {
  await connectDB();

  // If frequency, interval, or metadata changed, recalculate nextOccurrence
  if (updates.frequency || updates.interval || updates.metadata) {
    const existing = await RecurringTransaction.findOne({
      _id: recurringTransactionId,
      userId,
    });

    if (existing) {
      const frequency = updates.frequency || existing.frequency;
      const interval = updates.interval || existing.interval;
      const metadata = updates.metadata || existing.metadata;

      updates.nextOccurrence = calculateNextOccurrence(
        existing.nextOccurrence,
        frequency,
        interval,
        metadata
      );
    }
  }

  const recurringTransaction = await RecurringTransaction.findOneAndUpdate(
    { _id: recurringTransactionId, userId },
    updates,
    { new: true }
  )
    .populate('accountId', 'name type icon color')
    .populate('categoryId', 'name icon color');

  return recurringTransaction;
}

/**
 * Delete a recurring transaction
 */
export async function deleteRecurringTransaction(
  userId: string,
  recurringTransactionId: string
): Promise<void> {
  await connectDB();

  const result = await RecurringTransaction.findOneAndDelete({
    _id: recurringTransactionId,
    userId,
  });

  if (!result) {
    throw new Error('Recurring transaction not found');
  }
}

/**
 * Pause a recurring transaction
 */
export async function pauseRecurringTransaction(
  userId: string,
  recurringTransactionId: string
): Promise<IRecurringTransaction | null> {
  await connectDB();

  const recurringTransaction = await RecurringTransaction.findOneAndUpdate(
    { _id: recurringTransactionId, userId },
    { isActive: false },
    { new: true }
  )
    .populate('accountId', 'name type icon color')
    .populate('categoryId', 'name icon color');

  return recurringTransaction;
}

/**
 * Resume a recurring transaction
 */
export async function resumeRecurringTransaction(
  userId: string,
  recurringTransactionId: string
): Promise<IRecurringTransaction | null> {
  await connectDB();

  const recurringTransaction = await RecurringTransaction.findOneAndUpdate(
    { _id: recurringTransactionId, userId },
    { isActive: true },
    { new: true }
  )
    .populate('accountId', 'name type icon color')
    .populate('categoryId', 'name icon color');

  return recurringTransaction;
}

/**
 * Process due recurring transactions (called by cron job)
 * Creates actual transactions from recurring templates
 *
 * Includes idempotency protection to prevent duplicate processing
 * if the cron job runs multiple times within the same hour.
 */
export async function processDueRecurringTransactions(): Promise<{
  processed: number;
  failed: number;
  skipped: number;
  errors: Array<{ id: string; error: string }>;
}> {
  await connectDB();

  const now = new Date();
  const results = {
    processed: 0,
    failed: 0,
    skipped: 0,
    errors: [] as Array<{ id: string; error: string }>,
  };

  // Find all active recurring transactions that are due
  const dueTransactions = await RecurringTransaction.find({
    isActive: true,
    nextOccurrence: { $lte: now },
    $or: [
      { endDate: null }, // No end date (infinite)
      { endDate: { $gte: now } }, // End date in future
    ],
  });

  console.log(`Found ${dueTransactions.length} due recurring transactions to process`);

  for (const recurring of dueTransactions) {
    try {
      // Idempotency check: Skip if already processed in the last hour
      // This prevents duplicate transactions if cron runs multiple times
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (recurring.lastGeneratedDate && recurring.lastGeneratedDate > oneHourAgo) {
        console.log(`Skipping recurring transaction ${recurring._id} - already processed recently`);
        results.skipped++;
        continue;
      }

      // Calculate next occurrence BEFORE creating transaction
      // This ensures we don't lose the calculation if transaction creation fails
      const nextOccurrence = calculateNextOccurrence(
        recurring.nextOccurrence,
        recurring.frequency,
        recurring.interval,
        recurring.metadata
      );

      // Create actual transaction
      const transaction = await createTransaction(recurring.userId.toString(), {
        type: recurring.type,
        amount: recurring.amount,
        description: recurring.description,
        accountId: recurring.accountId,
        categoryId: recurring.categoryId,
        date: recurring.nextOccurrence,
        tags: ['recurring'],
        aiGenerated: false,
        metadata: {
          notes: `Auto-generated from recurring transaction: ${recurring.description}`,
          recurringTransactionId: recurring._id.toString(),
        },
      });

      console.log(`Created transaction ${transaction._id} from recurring ${recurring._id}`);

      // Update recurring transaction with atomic operation
      await RecurringTransaction.findByIdAndUpdate(recurring._id, {
        lastGeneratedDate: now,
        nextOccurrence,
        // Deactivate if past end date
        ...(recurring.endDate && nextOccurrence > recurring.endDate
          ? { isActive: false }
          : {}),
      });

      results.processed++;
    } catch (error) {
      console.error(`Error processing recurring transaction ${recurring._id}:`, error);
      results.failed++;
      results.errors.push({
        id: recurring._id.toString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log('Recurring transaction processing complete:', {
    processed: results.processed,
    failed: results.failed,
    skipped: results.skipped,
  });

  return results;
}
