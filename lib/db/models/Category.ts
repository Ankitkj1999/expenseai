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
      required: true,
      trim: true,
      maxlength: 50,
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

// Index for efficient queries
CategorySchema.index({ userId: 1, type: 1 });
CategorySchema.index({ isSystem: 1 });

// Compound index for system categories
CategorySchema.index({ isSystem: 1, type: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

// Default system categories
export const DEFAULT_CATEGORIES = {
  expense: [
    { name: 'Food & Dining', icon: 'restaurant', color: '#EF4444' },
    { name: 'Transportation', icon: 'directions_car', color: '#3B82F6' },
    { name: 'Shopping', icon: 'shopping_bag', color: '#8B5CF6' },
    { name: 'Entertainment', icon: 'movie', color: '#EC4899' },
    { name: 'Bills & Utilities', icon: 'receipt', color: '#F59E0B' },
    { name: 'Healthcare', icon: 'local_hospital', color: '#10B981' },
    { name: 'Education', icon: 'school', color: '#6366F1' },
    { name: 'Travel', icon: 'flight', color: '#14B8A6' },
    { name: 'Groceries', icon: 'local_grocery_store', color: '#84CC16' },
    { name: 'Other', icon: 'more_horiz', color: '#6B7280' },
  ],
  income: [
    { name: 'Salary', icon: 'payments', color: '#10B981' },
    { name: 'Business', icon: 'business', color: '#3B82F6' },
    { name: 'Investments', icon: 'trending_up', color: '#8B5CF6' },
    { name: 'Freelance', icon: 'work', color: '#F59E0B' },
    { name: 'Other', icon: 'more_horiz', color: '#6B7280' },
  ],
};
