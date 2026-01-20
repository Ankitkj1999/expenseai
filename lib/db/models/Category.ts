import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  userId: mongoose.Types.ObjectId | null;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [1, 'Category name is required'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: ['expense', 'income'],
    },
    icon: {
      type: String,
      default: 'category',
    },
    color: {
      type: String,
      default: '#6B7280',
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for efficient queries
CategorySchema.index({ userId: 1, name: 1 }, { unique: true, sparse: true }); // Prevent duplicate names per user
CategorySchema.index({ userId: 1, type: 1 });
CategorySchema.index({ isSystem: 1, type: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
