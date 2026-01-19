import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'savings' | 'debt_payoff' | 'purchase';
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  linkedAccountId?: mongoose.Types.ObjectId;
  linkedCategoryId?: mongoose.Types.ObjectId;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  milestones: Array<{
    amount: number;
    date: Date;
    note?: string;
  }>;
  metadata: {
    icon?: string;
    color?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      required: true,
      enum: ['savings', 'debt_payoff', 'purchase'],
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      default: null,
    },
    linkedAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    linkedCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
      index: true,
    },
    milestones: [{
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      date: {
        type: Date,
        required: true,
      },
      note: String,
    }],
    metadata: {
      icon: String,
      color: String,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, type: 1 });
GoalSchema.index({ userId: 1, priority: 1 });
GoalSchema.index({ userId: 1, deadline: 1 });

// Validation: currentAmount cannot exceed targetAmount
GoalSchema.pre('save', function () {
  if (this.currentAmount > this.targetAmount) {
    throw new Error('Current amount cannot exceed target amount');
  }
  
  // Auto-complete goal if target reached
  if (this.currentAmount >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
  }
});

// Virtual for progress percentage
GoalSchema.virtual('progress').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Virtual for remaining amount
GoalSchema.virtual('remainingAmount').get(function () {
  return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Ensure virtuals are included in JSON
GoalSchema.set('toJSON', { virtuals: true });
GoalSchema.set('toObject', { virtuals: true });

const Goal: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);

export default Goal;
