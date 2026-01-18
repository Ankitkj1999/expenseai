# Auth + DB Connection Middleware Refactoring

## Problem Analysis

Every API route in the application repeats the same auth and DB connection code:

```typescript
// Repeated in EVERY route handler
const auth = await authenticate(request);
if (!auth.authenticated || !auth.userId) {
  return NextResponse.json(
    { error: auth.error || 'Unauthorized' },
    { status: 401 }
  );
}

await connectDB();
```

This violates the DRY (Don't Repeat Yourself) principle and creates:
- **Code duplication**: Same 8-10 lines repeated ~40+ times
- **Maintenance burden**: Changes require updating multiple files
- **Error-prone**: Easy to forget auth or DB connection in new routes
- **Inconsistent error handling**: Slight variations in error messages

## Files Requiring Refactoring

### Protected Routes (Auth + DB Required)

#### Transactions API
- ✅ `app/api/transactions/route.ts` (GET, POST)
- ✅ `app/api/transactions/[id]/route.ts` (GET, PUT, DELETE)

#### Accounts API
- ✅ `app/api/accounts/route.ts` (GET, POST)
- ✅ `app/api/accounts/[id]/route.ts` (GET, PUT, DELETE)

#### Categories API
- ✅ `app/api/categories/route.ts` (GET, POST)
- ✅ `app/api/categories/[id]/route.ts` (GET, PUT)

#### Budgets API
- ✅ `app/api/budgets/route.ts` (GET, POST)
- ✅ `app/api/budgets/[id]/route.ts` (GET, PUT, DELETE)
- ✅ `app/api/budgets/[id]/status/route.ts` (GET)

#### Analytics API
- ✅ `app/api/analytics/summary/route.ts` (GET)
- ✅ `app/api/analytics/category-breakdown/route.ts` (GET)
- ✅ `app/api/analytics/trends/route.ts` (GET)
- ✅ `app/api/analytics/comparison/route.ts` (GET)

#### AI Chat API
- ✅ `app/api/ai/chat/route.ts` (GET, POST)

### Auth Routes (DB Only, No Auth Required)
- ⚠️ `app/api/auth/login/route.ts` (POST) - DB only
- ⚠️ `app/api/auth/register/route.ts` (POST) - DB only
- ⚠️ `app/api/auth/logout/route.ts` (POST) - No middleware needed
- ✅ `app/api/auth/me/route.ts` (GET) - Auth only, no DB

## Proposed Solution

### 1. Create Unified Middleware

Create `lib/middleware/withAuthAndDb.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from './auth';
import connectDB from '@/lib/db/mongodb';

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
}

export type AuthenticatedHandler<T = unknown> = (
  request: AuthenticatedRequest,
  context?: T
) => Promise<Response>;

/**
 * Middleware that combines authentication and database connection
 * Reduces boilerplate in route handlers
 */
export function withAuthAndDb<T = unknown>(
  handler: AuthenticatedHandler<T>
) {
  return async (request: NextRequest, context?: T) => {
    try {
      // Authenticate user
      const auth = await authenticate(request);
      
      if (!auth.authenticated || !auth.userId) {
        return NextResponse.json(
          { error: auth.error || 'Unauthorized' },
          { status: 401 }
        );
      }

      // Connect to database
      await connectDB();

      // Attach userId to request for handler
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.userId = auth.userId;

      // Call the actual handler
      return handler(authenticatedRequest, context);
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware for routes that only need DB connection (e.g., login, register)
 */
export function withDb<T = unknown>(
  handler: (request: NextRequest, context?: T) => Promise<Response>
) {
  return async (request: NextRequest, context?: T) => {
    try {
      await connectDB();
      return handler(request, context);
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

### 2. Example Refactored Route

**Before** (`app/api/transactions/route.ts`):
```typescript
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Build filter
    const filter: TransactionFilter = { userId: auth.userId };
    
    // ... rest of logic
  } catch (error) {
    // error handling
  }
}
```

**After**:
```typescript
export const GET = withAuthAndDb(async (request) => {
  // Get query parameters
  const { searchParams } = new URL(request.url);
  
  // Build filter - userId is now on request
  const filter: TransactionFilter = { userId: request.userId };
  
  // ... rest of logic - no try/catch needed, middleware handles it
});
```

### 3. Benefits

✅ **Eliminates ~320 lines of duplicate code** (8 lines × 40 handlers)
✅ **Consistent error handling** across all routes
✅ **Type-safe** with TypeScript interfaces
✅ **Easier testing** - mock middleware instead of auth + DB in each test
✅ **Faster development** - new routes are simpler to write
✅ **Single source of truth** for auth + DB logic
✅ **Better separation of concerns** - routes focus on business logic

### 4. Migration Strategy

1. ✅ Create middleware file
2. ✅ Refactor one route as proof of concept
3. ✅ Test thoroughly
4. ✅ Migrate remaining routes in batches:
   - Batch 1: Transactions (5 handlers)
   - Batch 2: Accounts (5 handlers)
   - Batch 3: Categories (4 handlers)
   - Batch 4: Budgets (6 handlers)
   - Batch 5: Analytics (4 handlers)
   - Batch 6: AI Chat (2 handlers)
5. ✅ Update auth routes with `withDb` middleware
6. ✅ Update documentation

### 5. Testing Checklist

- [ ] Auth middleware correctly rejects unauthenticated requests
- [ ] DB connection is established before handler runs
- [ ] userId is correctly attached to request
- [ ] Error handling works for auth failures
- [ ] Error handling works for DB connection failures
- [ ] All existing API tests pass
- [ ] Performance is not degraded

## Metrics

- **Files to refactor**: 15 route files
- **Handlers to refactor**: ~40 individual handlers
- **Lines of code removed**: ~320 lines
- **Code duplication eliminated**: 100%
- **Estimated time**: 2-3 hours
- **Risk level**: Low (middleware pattern is well-established)

## Notes

- Auth routes (login/register) only need `withDb` middleware
- The `/api/auth/me` route only needs auth, not DB connection
- The `/api/auth/logout` route needs neither (just clears cookies)
- Consider adding rate limiting to middleware in future
- Consider adding request logging to middleware in future
