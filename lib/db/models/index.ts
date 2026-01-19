/**
 * Barrel file for all Mongoose models
 * Ensures all models are registered with Mongoose before use
 * Prevents "Model not registered" errors in serverless environments
 */

// Import all models to register them with Mongoose
import User from './User';
import Account from './Account';
import Category from './Category';
import Transaction from './Transaction';
import Budget from './Budget';
import RecurringTransaction from './RecurringTransaction';
import Goal from './Goal';
import ChatSession from './ChatSession';

// Export all models for convenient importing
export {
  User,
  Account,
  Category,
  Transaction,
  Budget,
  RecurringTransaction,
  Goal,
  ChatSession,
};

// Default export with all models as an object
export default {
  User,
  Account,
  Category,
  Transaction,
  Budget,
  RecurringTransaction,
  Goal,
  ChatSession,
};
