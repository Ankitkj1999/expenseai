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
      index: true,
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
      index: true,
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

// Compound indexes for efficient queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ userId: 1, accountId: 1, date: -1 });
TransactionSchema.index({ userId: 1, categoryId: 1, date: -1 });

// Additional indexes for analytics and filtered queries
TransactionSchema.index({ userId: 1, type: 1, categoryId: 1, date: -1 }); // Category breakdown analytics
TransactionSchema.index({ userId: 1, accountId: 1, type: 1, date: -1 }); // Account-specific filtering
TransactionSchema.index({ userId: 1, date: 1 }); // Ascending date queries for trends

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
