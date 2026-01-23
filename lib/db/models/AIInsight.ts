import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInsight {
  category: 'alert' | 'advice' | 'achievement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  metadata: {
    percentage?: number;
    amount?: number;
    comparisonPeriod?: string;
    categoryId?: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  createdAt: Date;
}

export interface IAIInsight extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'weekly' | 'monthly' | 'realtime';
  insights: IInsight[];
  generatedAt: Date;
  expiresAt: Date;
  isStale: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    category: {
      type: String,
      required: true,
      enum: ['alert', 'advice', 'achievement'],
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    priority: {
      type: String,
      required: true,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    metadata: {
      percentage: Number,
      amount: Number,
      comparisonPeriod: String,
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Insights are subdocuments, no separate _id needed
);

const AIInsightSchema = new Schema<IAIInsight>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['weekly', 'monthly', 'realtime'],
    },
    insights: {
      type: [InsightSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isStale: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optimized compound indexes for efficient queries
// Primary queries - covers userId + type filtering + sorting by generation date
AIInsightSchema.index({ userId: 1, type: 1, generatedAt: -1 });

// Cleanup cron job - finds expired insights for deletion
AIInsightSchema.index({ expiresAt: 1 });

// Auto-set expiration date based on type
AIInsightSchema.pre('save', function () {
  if (!this.expiresAt) {
    const now = new Date(this.generatedAt);
    switch (this.type) {
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'realtime':
        now.setDate(now.getDate() + 3); // Realtime insights expire in 3 days
        break;
    }
    this.expiresAt = now;
  }

  // Mark as stale if older than 7 days
  const daysSinceGeneration =
    (Date.now() - this.generatedAt.getTime()) / (1000 * 60 * 60 * 24);
  this.isStale = daysSinceGeneration > 7;
});

const AIInsight: Model<IAIInsight> =
  mongoose.models.AIInsight || mongoose.model<IAIInsight>('AIInsight', AIInsightSchema);

export default AIInsight;
