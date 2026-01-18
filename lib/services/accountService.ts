import Account from '@/lib/db/models/Account';
import type { IAccount } from '@/lib/db/models/Account';

/**
 * Account Service
 * Handles all business logic for account operations
 */

export interface CreateAccountDto {
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'wallet';
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
}

export interface UpdateAccountDto {
  name?: string;
  type?: 'cash' | 'bank' | 'credit' | 'wallet';
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
   * @param userId - User ID
   * @returns List of accounts with total balance
   */
  async getAll(userId: string): Promise<AccountListResult> {
    const accounts = await Account.find({
      userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return {
      accounts,
      totalBalance,
      count: accounts.length,
    };
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
   * @param userId - User ID
   * @param data - Account data
   * @returns Created account
   */
  async create(userId: string, data: CreateAccountDto): Promise<IAccount> {
    return Account.create({
      userId,
      name: data.name,
      type: data.type,
      balance: data.balance ?? 0,
      currency: data.currency ?? 'INR',
      icon: data.icon ?? 'wallet',
      color: data.color ?? '#3B82F6',
    });
  },

  /**
   * Update an account
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
    return Account.findOneAndUpdate(
      { _id: accountId, userId },
      data,
      { new: true, runValidators: true }
    );
  },

  /**
   * Soft delete an account
   * @param userId - User ID
   * @param accountId - Account ID
   * @returns Updated account or null
   */
  async delete(userId: string, accountId: string): Promise<IAccount | null> {
    return Account.findOneAndUpdate(
      { _id: accountId, userId },
      { isActive: false },
      { new: true }
    );
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
   * @param accountId - Account ID
   * @param amount - Amount to add (negative to subtract)
   * @returns Updated account or null
   */
  async updateBalance(accountId: string, amount: number): Promise<IAccount | null> {
    return Account.findByIdAndUpdate(
      accountId,
      { $inc: { balance: amount } },
      { new: true }
    );
  },
};

export default accountService;
