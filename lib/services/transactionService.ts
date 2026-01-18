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
 * Create a transaction and update account balance(s)
 */
export async function createTransaction(
  userId: string,
  transactionData: Partial<ITransaction>
): Promise<ITransaction> {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { type, amount, accountId, toAccountId } = transactionData;

    // Verify account ownership
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      throw new Error('Account not found');
    }

    // For transfers, verify destination account
    if (type === 'transfer' && toAccountId) {
      const toAccount = await Account.findOne({ _id: toAccountId, userId });
      if (!toAccount) {
        throw new Error('Destination account not found');
      }
    }

    // Create transaction
    const [transaction] = await Transaction.create([{ ...transactionData, userId }], { session });

    // Update account balances
    if (type === 'expense') {
      await Account.findByIdAndUpdate(
        accountId,
        { $inc: { balance: -amount! } },
        { session }
      );
    } else if (type === 'income') {
      await Account.findByIdAndUpdate(
        accountId,
        { $inc: { balance: amount! } },
        { session }
      );
    } else if (type === 'transfer' && toAccountId) {
      // Deduct from source account
      await Account.findByIdAndUpdate(
        accountId,
        { $inc: { balance: -amount! } },
        { session }
      );
      // Add to destination account
      await Account.findByIdAndUpdate(
        toAccountId,
        { $inc: { balance: amount! } },
        { session }
      );
    }

    await session.commitTransaction();
    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Update a transaction and adjust account balances
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
    // Get original transaction within the session to prevent race conditions
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

    // Apply new balance changes
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
 * Delete a transaction and revert account balance changes
 */
export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get transaction within the session to prevent race conditions
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId
    }).session(session);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Revert balance changes
    if (transaction.type === 'expense') {
      await Account.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: transaction.amount } },
        { session }
      );
    } else if (transaction.type === 'income') {
      await Account.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: -transaction.amount } },
        { session }
      );
    } else if (transaction.type === 'transfer' && transaction.toAccountId) {
      await Account.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: transaction.amount } },
        { session }
      );
      await Account.findByIdAndUpdate(
        transaction.toAccountId,
        { $inc: { balance: -transaction.amount } },
        { session }
      );
    }

    // Delete transaction
    await Transaction.findByIdAndDelete(transactionId, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
