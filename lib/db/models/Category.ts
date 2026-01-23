import mongoose, { Schema, Document, Model } from 'mongoose';
import { CATEGORY_TYPES } from '@/lib/constants/enums';

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
      enum: CATEGORY_TYPES,
    },
    icon: {
      type: String,
      default: 'category',
    },
    color: {
      type: String,
      default: '#6B7280',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'],
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

// Optimized indexes for efficient queries
// Unique constraint - prevents duplicate category names per user
CategorySchema.index({ userId: 1, name: 1 }, { unique: true, sparse: true });

// User categories filtered by type
CategorySchema.index({ userId: 1, type: 1 });

// System categories filtered by type
CategorySchema.index({ isSystem: 1, type: 1 });

// Color normalization pre-save hook
CategorySchema.pre('save', function(this: ICategory) {
  if (this.isModified('color') && this.color) {
    // Normalize to uppercase
    this.color = this.color.toUpperCase();
  }
});

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
