# TanStack Query Implementation Guide

## Overview
Successfully integrated TanStack Query for server state management in the ExpenseAI application. This provides automatic caching, background refetching, and optimistic updates for all API data.

## What Was Implemented

### 1. Core Setup

#### QueryProvider (`lib/providers/QueryProvider.tsx`)
- Wraps the entire app with TanStack Query context
- Configured with sensible defaults:
  - 1-minute stale time
  - Disabled refetch on window focus
  - Single retry on failure
- Includes React Query DevTools for debugging

#### Root Layout Update (`app/layout.tsx`)
- Added QueryProvider wrapper around AuthProvider
- Maintains existing ErrorBoundary and Toaster

### 2. Query Keys (`lib/constants/queryKeys.ts`)
Centralized query key management for consistency:
- `transactions()` - All transactions
- `accounts` - All accounts
- `categories` - All categories
- `budgets` - All budgets
- `goals` - All goals
- `recurring` - Recurring transactions
- `insights` - AI insights
- `analytics.*` - Analytics endpoints (summary, trends, breakdown, comparison)

### 3. Refactored Hooks (`lib/hooks/useTransactions.ts`)

**Before (Manual State Management):**
```typescript
const { transactions, isLoading, error, refetch, deleteTransaction } = useTransactions();
```

**After (TanStack Query):**
```typescript
// Fetching
const { data: transactions, isLoading, error } = useTransactions();

// Creating
const createMutation = useCreateTransaction();
createMutation.mutate(data);

// Updating
const updateMutation = useUpdateTransaction();
updateMutation.mutate({ id, data });

// Deleting
const deleteMutation = useDeleteTransaction();
deleteMutation.mutate(id);
```

### 4. Updated Components

#### TransactionForm (`components/forms/TransactionForm.tsx`)
- Uses `useCreateTransaction()` and `useUpdateTransaction()` hooks
- Automatic cache invalidation after mutations
- Built-in loading states via `isPending`
- Automatic toast notifications

#### Transactions Page (`app/(dashboard)/transactions/page.tsx`)
- Simplified data fetching with `useTransactions()`
- Uses `useDeleteTransaction()` for deletions
- Removed manual refetch calls (automatic via cache invalidation)

#### QuickAddButton (`components/transactions/QuickAddButton.tsx`)
- Removed `onSuccess` callback (no longer needed)
- Mutations automatically update the cache

## Benefits Achieved

### ✅ Automatic Caching
- Data is cached in memory
- Subsequent requests use cached data
- Reduces unnecessary API calls

### ✅ Background Refetching
- Data stays fresh automatically
- Configurable stale time (1 minute)
- No manual refresh needed

### ✅ Optimistic Updates
- UI updates immediately
- Reverts on error
- Better user experience

### ✅ Loading States
- Built-in `isLoading` and `isPending` states
- No manual state management
- Consistent across the app

### ✅ Error Handling
- Automatic error states
- Retry logic built-in
- Toast notifications on errors

### ✅ Cache Invalidation
- Automatic after mutations
- Related queries updated
- Example: Creating a transaction invalidates both transactions and analytics

### ✅ DevTools
- Visual query inspector
- Cache visualization
- Network request tracking

## Usage Patterns

### Fetching Data
```typescript
const { data, isLoading, error } = useTransactions();

if (isLoading) return <Skeleton />;
if (error) return <Alert>Error</Alert>;
return <TransactionList transactions={data} />;
```

### Creating Data
```typescript
const createMutation = useCreateTransaction();

const handleCreate = () => {
  createMutation.mutate(formData, {
    onSuccess: (result) => {
      // Optional: Additional actions after success
      console.log('Created:', result);
    },
  });
};
```

### Updating Data
```typescript
const updateMutation = useUpdateTransaction();

const handleUpdate = (id: string, data: UpdateData) => {
  updateMutation.mutate({ id, data });
};
```

### Deleting Data
```typescript
const deleteMutation = useDeleteTransaction();

const handleDelete = (id: string) => {
  if (confirm('Are you sure?')) {
    deleteMutation.mutate(id);
  }
};
```

## Next Steps

### Immediate
1. Test the implementation thoroughly
2. Monitor DevTools for any issues
3. Verify cache invalidation works correctly

### Future Enhancements
1. **Add More Hooks** - Create similar hooks for:
   - `useAccounts()` / `useCreateAccount()` / etc.
   - `useBudgets()` / `useCreateBudget()` / etc.
   - `useGoals()` / `useCreateGoal()` / etc.
   - `useAnalytics()` for analytics data

2. **Optimistic Updates** - Implement for better UX:
   ```typescript
   const deleteMutation = useDeleteTransaction();
   
   deleteMutation.mutate(id, {
     onMutate: async (id) => {
       // Cancel outgoing refetches
       await queryClient.cancelQueries({ queryKey: queryKeys.transactions() });
       
       // Snapshot previous value
       const previous = queryClient.getQueryData(queryKeys.transactions());
       
       // Optimistically update
       queryClient.setQueryData(queryKeys.transactions(), (old) =>
         old.filter((t) => t._id !== id)
       );
       
       return { previous };
     },
     onError: (err, id, context) => {
       // Rollback on error
       queryClient.setQueryData(queryKeys.transactions(), context.previous);
     },
   });
   ```

3. **Pagination** - Add pagination support:
   ```typescript
   const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
     queryKey: queryKeys.transactions(),
     queryFn: ({ pageParam = 0 }) => transactionsApi.list({ skip: pageParam }),
     getNextPageParam: (lastPage) => lastPage.nextCursor,
   });
   ```

4. **Prefetching** - Prefetch data for better UX:
   ```typescript
   const queryClient = useQueryClient();
   
   const handleHover = (id: string) => {
     queryClient.prefetchQuery({
       queryKey: queryKeys.transaction(id),
       queryFn: () => transactionsApi.getById(id),
     });
   };
   ```

## Troubleshooting

### Cache Not Updating
- Ensure query keys match exactly
- Check that `invalidateQueries` is called
- Verify the mutation succeeded

### Stale Data
- Adjust `staleTime` in QueryProvider
- Use `refetchInterval` for real-time data
- Call `refetch()` manually if needed

### Memory Issues
- Adjust `cacheTime` (default: 5 minutes)
- Use `gcTime` to control garbage collection
- Clear cache manually: `queryClient.clear()`

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)
