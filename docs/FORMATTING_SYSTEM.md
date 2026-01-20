# Global Formatting System

## Overview

The ExpenseAI application now has a global formatting system that handles currency and date formatting based on user preferences. This ensures a consistent user experience across all screens and components.

## Architecture

### 1. User Preferences Context

**Location:** [`lib/contexts/UserPreferencesContext.tsx`](../lib/contexts/UserPreferencesContext.tsx)

The `UserPreferencesContext` provides global access to user preferences throughout the application. It:

- Loads user preferences from the API on mount
- Provides methods to update preferences
- Automatically syncs with the backend
- Caches preferences in React state for performance

**Usage:**

```tsx
import { useUserPreferences } from '@/lib/contexts/UserPreferencesContext';

function MyComponent() {
  const { preferences, updatePreferences, isLoading } = useUserPreferences();
  
  // Access preferences
  console.log(preferences.currency); // 'USD', 'EUR', 'INR', etc.
  console.log(preferences.dateFormat); // 'MM/DD/YYYY', 'DD/MM/YYYY', etc.
  
  // Update preferences
  await updatePreferences({ currency: 'EUR' });
}
```

### 2. Formatting Hooks

**Location:** [`lib/hooks/useFormatting.ts`](../lib/hooks/useFormatting.ts)

Three hooks are provided for formatting:

#### `useCurrency()`

Formats currency values based on user preferences.

```tsx
import { useCurrency } from '@/lib/hooks/useFormatting';

function TransactionAmount({ amount }: { amount: number }) {
  const { formatCurrency, getSymbol, currency } = useCurrency();
  
  return (
    <div>
      {formatCurrency(amount)} {/* Uses user's preferred currency */}
      {formatCurrency(amount, 'EUR')} {/* Override with specific currency */}
      {getSymbol()} {/* Get currency symbol: $, €, ₹, etc. */}
    </div>
  );
}
```

#### `useDate()`

Formats dates based on user preferences.

```tsx
import { useDate } from '@/lib/hooks/useFormatting';

function TransactionDate({ date }: { date: Date | string }) {
  const { formatDate, dateFormat } = useDate();
  
  return (
    <div>
      {formatDate(date)} {/* Uses user's preferred format */}
      {formatDate(date, 'YYYY-MM-DD')} {/* Override with specific format */}
    </div>
  );
}
```

#### `useFormatting()`

Combined hook that provides both currency and date formatting.

```tsx
import { useFormatting } from '@/lib/hooks/useFormatting';

function TransactionRow({ transaction }) {
  const { formatCurrency, formatDate } = useFormatting();
  
  return (
    <tr>
      <td>{formatDate(transaction.date)}</td>
      <td>{formatCurrency(transaction.amount)}</td>
    </tr>
  );
}
```

### 3. Utility Functions

#### Currency Utilities

**Location:** [`lib/constants/currencies.ts`](../lib/constants/currencies.ts)

- `formatCurrency(amount, currencyCode)` - Format amount with currency symbol
- `getCurrencySymbol(code)` - Get currency symbol by code
- `getCurrencyByCode(code)` - Get full currency object

#### Date Utilities

**Location:** [`lib/constants/dateFormats.ts`](../lib/constants/dateFormats.ts)

- `formatDate(date, format)` - Format date according to specified format
- `getDateFormatByValue(value)` - Get date format configuration

**Supported Date Formats:**

- `MM/DD/YYYY` - US format (01/20/2026)
- `DD/MM/YYYY` - UK format (20/01/2026)
- `YYYY-MM-DD` - ISO format (2026-01-20)
- `DD MMM YYYY` - Day Month Year (20 Jan 2026)
- `MMM DD, YYYY` - Month Day, Year (Jan 20, 2026)

## Updated Components

The following components have been updated to use the global formatting system:

### 1. TransactionTable

**Location:** [`components/transactions/TransactionTable.tsx`](../components/transactions/TransactionTable.tsx)

- Date column now uses user's preferred date format
- Amount column uses user's preferred currency (with account currency override)

### 2. SummaryCards

**Location:** [`components/analytics/SummaryCards.tsx`](../components/analytics/SummaryCards.tsx)

- All currency amounts use user's preferred currency
- Income, Expense, and Savings cards all respect user preferences

### 3. BudgetCard

**Location:** [`components/budgets/BudgetCard.tsx`](../components/budgets/BudgetCard.tsx)

- Budget amounts use user's preferred currency
- Date ranges use user's preferred date format

## Integration

The `UserPreferencesProvider` is integrated at the root level in [`app/layout.tsx`](../app/layout.tsx):

```tsx
<AuthProvider>
  <UserPreferencesProvider>
    {children}
  </UserPreferencesProvider>
</AuthProvider>
```

This ensures that preferences are available throughout the entire application.

## Best Practices

### 1. Always Use Hooks in Components

```tsx
// ✅ Good
function MyComponent() {
  const { formatCurrency } = useCurrency();
  return <div>{formatCurrency(100)}</div>;
}

// ❌ Bad - Don't use utility functions directly in components
function MyComponent() {
  return <div>{formatCurrency(100, 'USD')}</div>;
}
```

### 2. Override When Necessary

Sometimes you need to display a specific currency (e.g., account-specific):

```tsx
const { formatCurrency } = useCurrency();

// Use account's currency if available, otherwise user preference
const displayAmount = formatCurrency(
  transaction.amount,
  account?.currency // Optional override
);
```

### 3. Handle Loading States

```tsx
function MyComponent() {
  const { preferences, isLoading } = useUserPreferences();
  
  if (isLoading) {
    return <Skeleton />;
  }
  
  // Use preferences...
}
```

## Future Enhancements

### Components to Update

The following components should be updated to use the global formatting system:

1. **Dashboard Components**
   - [`components/dashboard/AIInsights.tsx`](../components/dashboard/AIInsights.tsx)

2. **Analytics Components**
   - [`components/analytics/CategoryBreakdownChart.tsx`](../components/analytics/CategoryBreakdownChart.tsx)
   - [`components/analytics/SpendingTrendChart.tsx`](../components/analytics/SpendingTrendChart.tsx)
   - [`components/analytics/ComparisonChart.tsx`](../components/analytics/ComparisonChart.tsx)

3. **Transaction Components**
   - [`components/transactions/TransactionCard.tsx`](../components/transactions/TransactionCard.tsx)
   - [`components/forms/TransactionForm.tsx`](../components/forms/TransactionForm.tsx)

4. **Recurring Transaction Components**
   - [`components/recurring/RecurringTransactionCard.tsx`](../components/recurring/RecurringTransactionCard.tsx)

5. **Account Components**
   - [`components/forms/AccountForm.tsx`](../components/forms/AccountForm.tsx)

### Additional Features

1. **Locale-based Number Formatting**
   - Add locale support for thousand separators
   - Support for different decimal separators

2. **Relative Date Formatting**
   - "Today", "Yesterday", "2 days ago"
   - Configurable in user preferences

3. **Time Zone Support**
   - Display times in user's time zone
   - Convert between time zones for international users

4. **Custom Format Strings**
   - Allow users to define custom date formats
   - Template-based currency formatting

## Testing

When testing components that use formatting:

```tsx
import { UserPreferencesProvider } from '@/lib/contexts/UserPreferencesContext';

// Wrap component in provider for testing
<UserPreferencesProvider>
  <YourComponent />
</UserPreferencesProvider>
```

## API Integration

The formatting system integrates with the following API endpoints:

- `GET /api/auth/me` - Fetch user preferences
- `PUT /api/user/preferences` - Update user preferences

See [`lib/api/auth.ts`](../lib/api/auth.ts) for implementation details.

## Migration Guide

To migrate existing components to use the global formatting system:

1. **Import the hook:**
   ```tsx
   import { useFormatting } from '@/lib/hooks/useFormatting';
   ```

2. **Use the hook in your component:**
   ```tsx
   const { formatCurrency, formatDate } = useFormatting();
   ```

3. **Replace hardcoded formatting:**
   ```tsx
   // Before
   ${amount.toFixed(2)}
   new Date(date).toLocaleDateString()
   
   // After
   formatCurrency(amount)
   formatDate(date)
   ```

4. **Test thoroughly** to ensure formatting works correctly across different user preferences.
