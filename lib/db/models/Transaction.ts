import mongoose, { Schema, Document, Model } from 'mongoose';

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
      enum: ['expense', 'income', 'transfer'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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
      location: String,
      notes: String,
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

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
