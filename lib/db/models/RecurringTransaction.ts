import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecurringTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'expense' | 'income';
  amount: number;
  description: string;
  accountId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., 2 for "every 2 months"
  startDate: Date;
  endDate?: Date; // optional, null for infinite recurrence
  nextOccurrence: Date; // when to create next transaction
  lastGeneratedDate?: Date; // last time transaction was created
  isActive: boolean;
  metadata: {
    dayOfMonth?: number; // for monthly (e.g., 1st, 15th)
    dayOfWeek?: number; // for weekly (0-6, Sunday-Saturday)
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RecurringTransactionSchema = new Schema<IRecurringTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['expense', 'income'],
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    frequency: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    nextOccurrence: {
      type: Date,
      required: true,
    },
    lastGeneratedDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
      },
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
      },
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Optimized compound indexes for efficient queries and write performance
// Primary user queries - covers userId + any filter combination + sorting
RecurringTransactionSchema.index({ userId: 1, isActive: 1, nextOccurrence: 1 });

// Cron job processing - critical for finding due transactions
RecurringTransactionSchema.index({ isActive: 1, nextOccurrence: 1 });

// Validation: endDate must be after startDate if provided
RecurringTransactionSchema.pre('save', function () {
  if (this.endDate && this.endDate <= this.startDate) {
    throw new Error('End date must be after start date');
  }
  
  // Validate dayOfMonth for monthly frequency
  if (this.frequency === 'monthly' && this.metadata.dayOfMonth) {
    if (this.metadata.dayOfMonth < 1 || this.metadata.dayOfMonth > 31) {
      throw new Error('Day of month must be between 1 and 31');
    }
  }
  
  // Validate dayOfWeek for weekly frequency
  if (this.frequency === 'weekly' && this.metadata.dayOfWeek !== undefined) {
    if (this.metadata.dayOfWeek < 0 || this.metadata.dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }
  }
});

const RecurringTransaction: Model<IRecurringTransaction> =
  mongoose.models.RecurringTransaction ||
  mongoose.model<IRecurringTransaction>('RecurringTransaction', RecurringTransactionSchema);

export default RecurringTransaction;
