import Account from '@/lib/db/models/Account';
import type { IAccount } from '@/lib/db/models/Account';
import mongoose from 'mongoose';
import cache from '@/lib/utils/cache';

/**
 * Account Service
 * Handles all business logic for account operations
 */

export interface CreateAccountDto {
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'wallet' | 'savings';
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
}

export interface UpdateAccountDto {
  name?: string;
  type?: 'cash' | 'bank' | 'credit' | 'wallet' | 'savings';
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export interface AccountListResult {
  accounts: IAccount[];
  totalBalance: number;
  count: number;
}

export const accountService = {
  /**
   * Get all active accounts for a user
   * Uses aggregation to calculate total balance on database side
   * Implements caching with 5-minute TTL
   * @param userId - User ID
   * @returns List of accounts with total balance
   */
  async getAll(userId: string): Promise<AccountListResult> {
    const cacheKey = `accounts:${userId}`;
    
    // Try to get from cache
    const cached = cache.get<AccountListResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Use aggregation with $facet to get both accounts and total balance in one query
    const [result] = await Account.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isActive: true,
        },
      },
      {
        $facet: {
          accounts: [
            { $sort: { createdAt: -1 } },
          ],
          totalBalance: [
            {
              $group: {
                _id: null,
                total: { $sum: '$balance' },
              },
            },
          ],
        },
      },
    ]);

    const accounts = result.accounts || [];
    const totalBalance = result.totalBalance[0]?.total || 0;

    const accountResult = {
      accounts,
      totalBalance,
      count: accounts.length,
    };

    // Cache for 5 minutes
    cache.set(cacheKey, accountResult, 300);

    return accountResult;
  },

  /**
   * Get a single account by ID
   * @param userId - User ID
   * @param accountId - Account ID
   * @returns Account or null
   */
  async getById(userId: string, accountId: string): Promise<IAccount | null> {
    return Account.findOne({
      _id: accountId,
      userId,
    });
  },

  /**
   * Create a new account
   * Invalidates cache after creation
   * @param userId - User ID
   * @param data - Account data
   * @returns Created account
   */
  async create(userId: string, data: CreateAccountDto): Promise<IAccount> {
    const account = await Account.create({
      userId,
      name: data.name,
      type: data.type,
      balance: data.balance ?? 0,
      currency: data.currency ?? 'INR',
      icon: data.icon ?? 'wallet',
      color: data.color ?? '#3B82F6',
    });

    // Invalidate cache
    cache.delete(`accounts:${userId}`);

    return account;
  },

  /**
   * Update an account
   * Invalidates cache after update
   * @param userId - User ID
   * @param accountId - Account ID
   * @param data - Update data
   * @returns Updated account or null
   */
  async update(
    userId: string,
    accountId: string,
    data: UpdateAccountDto
  ): Promise<IAccount | null> {
    const account = await Account.findOneAndUpdate(
      { _id: accountId, userId },
      data,
      { new: true, runValidators: true }
    );

    // Invalidate cache
    if (account) {
      cache.delete(`accounts:${userId}`);
    }

    return account;
  },

  /**
   * Soft delete an account
   * Invalidates cache after deletion
   * @param userId - User ID
   * @param accountId - Account ID
   * @returns Updated account or null
   */
  async delete(userId: string, accountId: string): Promise<IAccount | null> {
    const account = await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { isActive: false },
      { new: true }
    );

    // Invalidate cache
    if (account) {
      cache.delete(`accounts:${userId}`);
    }

    return account;
  },

  /**
   * Check if account exists and belongs to user
   * @param userId - User ID
   * @param accountId - Account ID
   * @returns True if exists
   */
  async exists(userId: string, accountId: string): Promise<boolean> {
    const count = await Account.countDocuments({
      _id: accountId,
      userId,
      isActive: true,
    });
    return count > 0;
  },

  /**
   * Update account balance
   * @param userId - User ID (for security verification)
   * @param accountId - Account ID
   * @param amount - Amount to add (negative to subtract)
   * @returns Updated account or null
   */
  async updateBalance(userId: string, accountId: string, amount: number): Promise<IAccount | null> {
    return Account.findOneAndUpdate(
      { _id: accountId, userId }, // Verify ownership
      { $inc: { balance: amount } },
      { new: true }
    );
  },
};

export default accountService;
