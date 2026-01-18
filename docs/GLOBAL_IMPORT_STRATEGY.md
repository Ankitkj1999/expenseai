# Global Import Strategy for Mongoose Models

## Overview

The Global Import Strategy uses a barrel file ([`lib/db/models/index.ts`](lib/db/models/index.ts)) to ensure all Mongoose models are registered before use. This prevents common issues in serverless environments like Next.js API routes.

## Implementation

### 1. Barrel File (`lib/db/models/index.ts`)

```typescript
// Import all models to register them with Mongoose
import User from './User';
import Account from './Account';
import Category from './Category';
import Transaction from './Transaction';
import Budget from './Budget';
import ChatSession from './ChatSession';

// Export all models for convenient importing
export {
  User,
  Account,
  Category,
  Transaction,
  Budget,
  ChatSession,
};
```

### 2. Updated connectDB (`lib/db/mongodb.ts`)

```typescript
import mongoose from 'mongoose';
// Import all models to ensure they're registered
import '@/lib/db/models';

async function connectDB(): Promise<typeof mongoose> {
  // ... connection logic
}
```

## Benefits

### ✅ 1. Prevents "Model Not Registered" Errors

**Problem**: In serverless environments, each function invocation may have a fresh Node.js context. If a model isn't imported before use, Mongoose throws:
```
Error: Schema hasn't been registered for model "Transaction"
```

**Solution**: The barrel file ensures all models are registered when `connectDB()` is called.

### ✅ 2. Simplifies Imports

**Before**:
```typescript
import Transaction from '@/lib/db/models/Transaction';
import Account from '@/lib/db/models/Account';
import Category from '@/lib/db/models/Category';
```

**After** (optional, but cleaner):
```typescript
import { Transaction, Account, Category } from '@/lib/db/models';
```

### ✅ 3. Centralized Model Registration

All models are registered in one place. When you add a new model:
1. Create the model file
2. Add it to the barrel file
3. It's automatically available everywhere

### ✅ 4. Prevents Circular Dependencies

By having a single entry point for all models, you avoid circular dependency issues that can occur when models reference each other.

### ✅ 5. Better for Serverless/Edge Functions

In serverless environments (Vercel, AWS Lambda, etc.), each function invocation may have:
- Fresh Node.js context
- No guarantee of model registration order
- Potential for race conditions

The barrel file ensures consistent model registration regardless of execution context.

### ✅ 6. Easier Testing

In tests, you can mock the entire models module:
```typescript
jest.mock('@/lib/db/models', () => ({
  User: mockUserModel,
  Transaction: mockTransactionModel,
  // ...
}));
```

## How It Works

1. **Import Side Effect**: When `import '@/lib/db/models'` runs, it executes the barrel file
2. **Model Registration**: Each model file defines its schema and calls `mongoose.model()`
3. **Mongoose Registry**: Mongoose stores all models in an internal registry
4. **Subsequent Uses**: Any code that uses a model finds it already registered

## When to Use This Pattern

✅ **Use when**:
- Building serverless applications (Next.js API routes, AWS Lambda, etc.)
- Working with multiple models that reference each other
- Experiencing "Model not registered" errors
- Want cleaner, more maintainable imports

❌ **Not needed when**:
- Building traditional long-running Node.js servers
- Using a single model
- Models are always imported before use

## Comparison with Other Approaches

### Approach 1: Import Models Individually (Before)
```typescript
// Every route file
import Transaction from '@/lib/db/models/Transaction';
import Account from '@/lib/db/models/Account';
```
❌ Repetitive
❌ Easy to forget imports
❌ Potential for "Model not registered" errors

### Approach 2: Import in connectDB (Alternative)
```typescript
// lib/db/mongodb.ts
async function connectDB() {
  // Import all models here
  await import('@/lib/db/models/User');
  await import('@/lib/db/models/Account');
  // ...
}
```
❌ Async imports add complexity
❌ Still need to list all models
✅ Works, but less elegant

### Approach 3: Barrel File (Current Implementation)
```typescript
// lib/db/mongodb.ts
import '@/lib/db/models';
```
✅ Single import
✅ Synchronous
✅ Clean and maintainable
✅ Works everywhere

## Migration Guide

If you want to use the cleaner import syntax throughout the codebase:

**Before**:
```typescript
import Transaction from '@/lib/db/models/Transaction';
```

**After**:
```typescript
import { Transaction } from '@/lib/db/models';
```

This is **optional** - both styles work. The key benefit is that models are registered regardless of import style.

## Adding New Models

When you create a new model:

1. Create the model file: `lib/db/models/NewModel.ts`
2. Update the barrel file:
```typescript
import NewModel from './NewModel';

export {
  User,
  Account,
  // ... existing models
  NewModel, // Add here
};
```
3. Done! The model is now registered and available everywhere.

## Performance Impact

**Negligible**: 
- Models are only registered once per Node.js context
- Import happens at module load time, not runtime
- No performance difference in production
- Slightly faster cold starts (models pre-registered)

## Conclusion

The Global Import Strategy is a best practice for Next.js applications using Mongoose. It:
- Prevents common serverless errors
- Simplifies code maintenance
- Provides cleaner imports
- Has zero performance cost

This pattern is especially valuable in the ExpenseAI codebase with 6 models and 26+ API routes.
