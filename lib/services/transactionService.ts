import Transaction, { ITransaction } from '@/lib/db/models/Transaction';
import Account from '@/lib/db/models/Account';
import connectDB from '@/lib/db/mongodb';
import mongoose from 'mongoose';

/**
 * Get transactions with filters
 */
export async function getTransactions(
  userId: string,
  filters: {
    type?: string;
    accountId?: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {},
  limit: number = 50,
  skip: number = 0
): Promise<{ transactions: ITransaction[]; total: number }> {
  await connectDB();

  const query: Record<string, unknown> = { userId };

  if (filters.type) query.type = filters.type;
  if (filters.accountId) query.accountId = filters.accountId;
  if (filters.categoryId) query.categoryId = filters.categoryId;
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) (query.date as Record<string, unknown>).$gte = filters.startDate;
    if (filters.endDate) (query.date as Record<string, unknown>).$lte = filters.endDate;
  }

  const transactions = await Transaction.find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('accountId', 'name type icon color')
    .populate('toAccountId', 'name type icon color')
    .populate('categoryId', 'name icon color');

  const total = await Transaction.countDocuments(query);

  return { transactions, total };
}

/**
 * Create a transaction and update account balance(s) atomically
 */
export async function createTransaction(data: {
  userId: mongoose.Types.ObjectId | string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  description: string;
  accountId: mongoose.Types.ObjectId | string;
  toAccountId?: mongoose.Types.ObjectId | string;
  categoryId?: mongoose.Types.ObjectId | string;
  date: Date;
  tags?: string[];
  metadata?: Record<string, unknown>;
  attachments?: Array<{
    url: string;
    type: string;
    extractedData?: Record<string, unknown>;
  }>;
  aiGenerated?: boolean;
}) {
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Calculate the amount change based on transaction type
    let fromAccountChange = 0;
    let toAccountChange = 0;

    switch (data.type) {
      case 'expense':
        fromAccountChange = -data.amount;
        break;
      case 'income':
        fromAccountChange = data.amount;
        break;
      case 'transfer':
        fromAccountChange = -data.amount;
        toAccountChange = data.amount;
        break;
    }

    // Update source account and get new balance
    const fromAccount = await Account.findOneAndUpdate(
      { _id: data.accountId, userId: data.userId },
      { $inc: { balance: fromAccountChange } },
      { session, new: true }
    );

    if (!fromAccount) {
      throw new Error('Source account not found');
    }

    // Prepare metadata with transferType for source
    const sourceMetadata = { ...(data.metadata || {}) };
    if (data.type === 'transfer') {
      sourceMetadata.transferType = 'outgoing';
    }

    // Create the main transaction with balanceAfter
    const transaction = await Transaction.create(
      [
        {
          ...data,
          metadata: sourceMetadata,
          balanceAfter: fromAccount.balance,
        },
      ],
      { session }
    );

    // Handle transfer: update destination account
    if (data.type === 'transfer' && data.toAccountId) {
      const toAccount = await Account.findOneAndUpdate(
        { _id: data.toAccountId, userId: data.userId },
        { $inc: { balance: toAccountChange } },
        { session, new: true }
      );

      if (!toAccount) {
        throw new Error('Destination account not found');
      }

      // Create corresponding transaction for destination account
      await Transaction.create(
        [
          {
            userId: data.userId,
            type: 'transfer',
            amount: data.amount,
            description: `Transfer from ${fromAccount.name}`,
            accountId: data.toAccountId,
            toAccountId: data.accountId,
            categoryId: data.categoryId,
            date: data.date,
            balanceAfter: toAccount.balance,
            tags: data.tags || [],
            metadata: { ...(data.metadata || {}), transferType: 'incoming' },
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Update a transaction and adjust account balances
 * NOTE: This implementation updates the CURRENT account balance but does not fully propagate
 * balanceAfter changes to all subsequent transactions. This is a trade-off for performance.
 */
export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<ITransaction>
): Promise<ITransaction> {
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get original transaction within the session
    const originalTransaction = await Transaction.findOne({
      _id: transactionId,
      userId
    }).session(session);

    if (!originalTransaction) {
      throw new Error('Transaction not found');
    }

    // Revert original balance changes
    if (originalTransaction.type === 'expense') {
      await Account.findByIdAndUpdate(
        originalTransaction.accountId,
        { $inc: { balance: originalTransaction.amount } },
        { session }
      );
    } else if (originalTransaction.type === 'income') {
      await Account.findByIdAndUpdate(
        originalTransaction.accountId,
        { $inc: { balance: -originalTransaction.amount } },
        { session }
      );
    } else if (originalTransaction.type === 'transfer' && originalTransaction.toAccountId) {
      await Account.findByIdAndUpdate(
        originalTransaction.accountId,
        { $inc: { balance: originalTransaction.amount } },
        { session }
      );
      await Account.findByIdAndUpdate(
        originalTransaction.toAccountId,
        { $inc: { balance: -originalTransaction.amount } },
        { session }
      );
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      updates,
      { new: true, session }
    );

    if (!updatedTransaction) {
      throw new Error('Failed to update transaction');
    }

    // Apply new balance changes to Account
    if (updatedTransaction.type === 'expense') {
      await Account.findByIdAndUpdate(
        updatedTransaction.accountId,
        { $inc: { balance: -updatedTransaction.amount } },
        { session }
      );
    } else if (updatedTransaction.type === 'income') {
      await Account.findByIdAndUpdate(
        updatedTransaction.accountId,
        { $inc: { balance: updatedTransaction.amount } },
        { session }
      );
    } else if (updatedTransaction.type === 'transfer' && updatedTransaction.toAccountId) {
      await Account.findByIdAndUpdate(
        updatedTransaction.accountId,
        { $inc: { balance: -updatedTransaction.amount } },
        { session }
      );
      await Account.findByIdAndUpdate(
        updatedTransaction.toAccountId,
        { $inc: { balance: updatedTransaction.amount } },
        { session }
      );
    }

    await session.commitTransaction();
    return updatedTransaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Delete a transaction and revert account balance changes atomically
 */
export async function deleteTransaction(
  transactionId: mongoose.Types.ObjectId | string,
  userId: mongoose.Types.ObjectId | string
) {
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    }).session(session);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Reverse the balance change
    let accountChange = 0;
    switch (transaction.type) {
      case 'expense':
        accountChange = transaction.amount; // Add back
        break;
      case 'income':
        accountChange = -transaction.amount; // Subtract
        break;
      case 'transfer':
        accountChange = transaction.amount; // Add back to source
        break;
    }

    await Account.findByIdAndUpdate(
      transaction.accountId,
      { $inc: { balance: accountChange } },
      { session }
    );

    // Handle transfer destination
    if (transaction.type === 'transfer' && transaction.toAccountId) {
      await Account.findByIdAndUpdate(
        transaction.toAccountId,
        { $inc: { balance: -transaction.amount } },
        { session }
      );

      // Delete the corresponding transfer transaction
      await Transaction.deleteOne(
        {
          userId,
          accountId: transaction.toAccountId,
          toAccountId: transaction.accountId,
          amount: transaction.amount,
          date: transaction.date,
        },
        { session }
      );
    }

    await Transaction.findByIdAndDelete(transactionId, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function reconcileAccount(accountId: mongoose.Types.ObjectId | string) {
  await connectDB();
  const transactions = await Transaction.find({ accountId })
    .sort({ date: 1, createdAt: 1 })
    .lean();

  let calculatedBalance = 0;
  const discrepancies = [];

  for (const txn of transactions) {
    if (txn.type === 'income') {
      calculatedBalance += txn.amount;
    } else if (txn.type === 'expense') {
      calculatedBalance -= txn.amount;
    } else if (txn.type === 'transfer') {
      // Check transferType metadata to determine direction
      const transferType = (txn.metadata as any)?.transferType;
      if (transferType === 'incoming') {
        calculatedBalance += txn.amount;
      } else if (transferType === 'outgoing') {
        calculatedBalance -= txn.amount;
      } else {
        // Fallback if metadata missing (old transactions), try to guess or assume outgoing
        // Or check if toAccountId match?
        // This is ambiguous for older transactions. 
        // Assuming outgoing if not specified for safety, or check if toAccountId is NOT this account?
        // In logic: toAccountId is destination.
        // If txn.accountId == this.accountId, and txn.toAccountId is defined... 
        // If it's outgoing, accountId=src.
        // If it's incoming, accountId=dest, toAccountId=src.
        // So in both cases `accountId` is THIS account.
        // BUT `toAccountId` is the OTHER account.
        // So we can't tell direction just by ids.
        // We rely on 'Transfer from' description?
        if (txn.description && txn.description.startsWith('Transfer from')) {
          calculatedBalance += txn.amount;
        } else {
          calculatedBalance -= txn.amount;
        }
      }
    }

    if (Math.abs(calculatedBalance - txn.balanceAfter) > 0.001) {
      discrepancies.push({
        transactionId: txn._id,
        expected: calculatedBalance,
        actual: txn.balanceAfter,
      });
    }
  }

  const account = await Account.findById(accountId);
  if (account && Math.abs(account.balance - calculatedBalance) > 0.001) {
    discrepancies.push({
      account: 'final',
      expected: calculatedBalance,
      actual: account.balance,
    });
  }

  return { isValid: discrepancies.length === 0, discrepancies };
}
