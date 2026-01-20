import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserPreferences {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    weeklyReports: boolean;
    transactionUpdates: boolean;
    insightNotifications: boolean;
  };
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    preferences: {
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD'],
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY', 'MMM DD, YYYY'],
      },
      theme: {
        type: String,
        default: 'light',
        enum: ['light', 'dark'],
      },
      notifications: {
        budgetAlerts: {
          type: Boolean,
          default: true,
        },
        goalReminders: {
          type: Boolean,
          default: true,
        },
        weeklyReports: {
          type: Boolean,
          default: false,
        },
        transactionUpdates: {
          type: Boolean,
          default: true,
        },
        insightNotifications: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
