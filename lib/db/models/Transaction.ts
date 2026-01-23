import mongoose, { Schema, Document, Model } from 'mongoose';
import { TRANSACTION_TYPES } from '@/lib/constants/enums';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  description: string;
  accountId: mongoose.Types.ObjectId;
  toAccountId?: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  tags: string[];
  date: Date;
  attachments: Array<{
    url: string;
    type: string;
    extractedData?: Record<string, unknown>;
  }>;
  aiGenerated: boolean;
  metadata: {
    location?: string;
    notes?: string;
    [key: string]: unknown;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: TRANSACTION_TYPES,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    toAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: function(this: ITransaction) {
        return this.type === 'transfer';
      },
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: function(this: ITransaction) {
        return this.type !== 'transfer';
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    attachments: [{
      url: String,
      type: String,
      extractedData: Schema.Types.Mixed,
    }],
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Strategic compound indexes optimized for query patterns and write performance
// These 3 indexes provide comprehensive coverage while minimizing write overhead

// Primary index - covers most transaction queries (list, date ranges, trends)
TransactionSchema.index({ userId: 1, date: -1 });

// Type-filtered queries - essential for analytics, category breakdown, and expense/income separation
TransactionSchema.index({ userId: 1, type: 1, date: -1 });

// Account-specific queries - important for account detail pages and balance calculations
TransactionSchema.index({ userId: 1, accountId: 1, date: -1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
