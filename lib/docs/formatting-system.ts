/**
 * Global Formatting System Documentation
 * 
 * This file contains comprehensive documentation for the global formatting system
 * that handles currency and date formatting based on user preferences.
 */

export const FORMATTING_SYSTEM_DOCS = `
# Global Formatting System

## Overview

The ExpenseAI application now has a global formatting system that handles currency and date formatting based on user preferences. This ensures a consistent user experience across all screens and components.

## Key Features

✅ **User Preferences Context** - Global state management for user preferences
✅ **Formatting Hooks** - Easy-to-use hooks for currency and date formatting
✅ **Automatic Syncing** - Preferences sync with backend automatically
✅ **Override Support** - Can override with specific currency/format when needed
✅ **Type Safety** - Full TypeScript support

## Quick Start

### Using Currency Formatting

\`\`\`tsx
import { useCurrency } from '@/lib/hooks/useFormatting';

function MyComponent() {
  const { formatCurrency } = useCurrency();
  
  return <div>{formatCurrency(1234.56)}</div>;
  // Output: $1,234.56 (or ₹1,234.56, €1,234.56 based on user preference)
}
\`\`\`

### Using Date Formatting

\`\`\`tsx
import { useDate } from '@/lib/hooks/useFormatting';

function MyComponent() {
  const { formatDate } = useDate();
  
  return <div>{formatDate(new Date())}</div>;
  // Output: 01/20/2026 (or 20/01/2026, 2026-01-20 based on user preference)
}
\`\`\`

### Using Combined Formatting

\`\`\`tsx
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
\`\`\`

## Architecture

### 1. UserPreferencesContext
Location: lib/contexts/UserPreferencesContext.tsx

Provides global access to user preferences with automatic backend syncing.

### 2. Formatting Hooks
Location: lib/hooks/useFormatting.ts

Three hooks available:
- useCurrency() - For currency formatting
- useDate() - For date formatting
- useFormatting() - Combined hook

### 3. Utility Functions
Location: lib/constants/currencies.ts and lib/constants/dateFormats.ts

Low-level formatting functions used by the hooks.

## Supported Formats

### Currency Codes
USD, EUR, GBP, INR, JPY, AUD, CAD, CHF, CNY, SGD, HKD, NZD, SEK, NOK, DKK, MXN, BRL, ZAR, KRW, THB

### Date Formats
- MM/DD/YYYY - US format (01/20/2026)
- DD/MM/YYYY - UK format (20/01/2026)
- YYYY-MM-DD - ISO format (2026-01-20)
- DD MMM YYYY - Day Month Year (20 Jan 2026)
- MMM DD, YYYY - Month Day, Year (Jan 20, 2026)

## Updated Components

The following components have been updated:
✅ TransactionTable - Date and currency formatting
✅ SummaryCards - All currency amounts
✅ BudgetCard - Budget amounts and dates

## Components to Update

The following components should be updated in future:
- Dashboard AIInsights
- Analytics Charts (CategoryBreakdown, SpendingTrend, Comparison)
- TransactionCard
- RecurringTransactionCard
- Forms (Transaction, Account)

## Best Practices

1. Always use hooks in components (not utility functions directly)
2. Override currency when displaying account-specific amounts
3. Handle loading states when using preferences
4. Test with different preference combinations

## API Integration

Integrates with:
- GET /api/auth/me - Fetch user preferences
- PUT /api/user/preferences - Update preferences

## Migration Guide

1. Import the hook: import { useFormatting } from '@/lib/hooks/useFormatting';
2. Use in component: const { formatCurrency, formatDate } = useFormatting();
3. Replace hardcoded formatting with hook functions
4. Test thoroughly
`;

export default FORMATTING_SYSTEM_DOCS;
