import mongoose, { Schema, Document, Model } from 'mongoose';
import { CURRENCY_CODES } from '@/lib/constants/currencies';
import { ACCOUNT_TYPES } from '@/lib/constants/enums';

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'wallet' | 'savings';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      minlength: [1, 'Account name is required'],
      maxlength: [50, 'Account name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: ACCOUNT_TYPES,
    },
    // Implement on the fly calulation of balance from transactions later
    // TODO: Should balance be allowed to go negative? For credit accounts, yes. or We should let user decide? 
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'INR',
      uppercase: true,
      enum: CURRENCY_CODES,
    },
    icon: {
      type: String,
      default: 'wallet',
    },
    color: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-F]{6}$/i, 'Invalid hex color format'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimized index for efficient account queries
AccountSchema.index({ userId: 1, isActive: 1 });

// Color normalization pre-save hook
AccountSchema.pre('save', function(this: IAccount) {
  if (this.isModified('color') && this.color) {
    // Normalize to uppercase
    this.color = this.color.toUpperCase();
  }
});

const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);

export default Account;
