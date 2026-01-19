# Floating Action Button (FAB) Implementation

## Overview
A reusable Floating Action Button (FAB) component has been implemented to provide a consistent UI pattern across multiple pages in the application.

## Component Location
- **Generic FAB Component**: [`components/ui/floating-action-button.tsx`](../components/ui/floating-action-button.tsx)
- **Transaction-specific wrapper**: [`components/transactions/QuickAddButton.tsx`](../components/transactions/QuickAddButton.tsx)

## Features
- **Responsive Design**: Adapts to different screen sizes
  - Mobile: `bottom-4 right-4`, `h-14 w-14`
  - Tablet+: `bottom-6 right-6`
  - Desktop: `h-16 w-16`
- **Smooth Animations**: Hover scale effects and shadow transitions
- **Accessibility**: Includes proper ARIA labels and screen reader text
- **Fixed Positioning**: Always visible in bottom-right corner with `z-50`

## Current Implementation

### 1. Accounts Page
**File**: [`app/(dashboard)/accounts/page.tsx`](../app/(dashboard)/accounts/page.tsx)

Changes made:
- ✅ Removed "+ Add Account" button from header
- ✅ Removed "+ Add Your First Account" button from empty state
- ✅ Added FAB at bottom-right corner
- ✅ Updated empty state text to reference the FAB

```tsx
import { FloatingActionButton } from '@/components/ui/floating-action-button';

// At the end of the component, before closing </div>
<FloatingActionButton ariaLabel="Add new account" />
```

### 2. Transactions Page
**File**: [`app/(dashboard)/transactions/page.tsx`](../app/(dashboard)/transactions/page.tsx)

- ✅ Already using FAB via `<QuickAddButton />` component
- ✅ Updated to use the new generic `FloatingActionButton` component
- ✅ Integrated with `TransactionDialog` for form handling

## Usage Guide

### Basic Usage (Simple onClick)
```tsx
import { FloatingActionButton } from '@/components/ui/floating-action-button';

<FloatingActionButton 
  onClick={() => console.log('FAB clicked')}
  ariaLabel="Add new item"
/>
```

### Advanced Usage (With Dialog/Form)
```tsx
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { SomeDialog } from '@/components/forms/SomeDialog';

<SomeDialog
  mode="create"
  trigger={
    <FloatingActionButton ariaLabel="Add new item">
      <Plus className="h-6 w-6" />
    </FloatingActionButton>
  }
/>
```

### Custom Styling
```tsx
<FloatingActionButton 
  className="bg-green-500 hover:bg-green-600"
  ariaLabel="Add new item"
>
  <CustomIcon className="h-6 w-6" />
</FloatingActionButton>
```

## Future Implementation

### For Budget Page
When creating the Budget page, follow this pattern:

1. Remove any "+ Add Budget" buttons from the header
2. Add FAB at the end of the component:
```tsx
<FloatingActionButton ariaLabel="Add new budget" />
```

3. Later, integrate with a BudgetDialog:
```tsx
<BudgetDialog
  mode="create"
  trigger={
    <FloatingActionButton ariaLabel="Add new budget">
      <Plus className="h-6 w-6" />
    </FloatingActionButton>
  }
/>
```

### For Recurring Transactions Page
Similar pattern:

1. Remove any "+ Add Recurring Transaction" buttons
2. Add FAB:
```tsx
<RecurringTransactionDialog
  mode="create"
  trigger={
    <FloatingActionButton ariaLabel="Add recurring transaction">
      <Plus className="h-6 w-6" />
    </FloatingActionButton>
  }
/>
```

## Component Props

### FloatingActionButton Props
```typescript
interface FloatingActionButtonProps {
  onClick?: () => void;           // Optional click handler
  children?: ReactNode;            // Custom icon/content (defaults to Plus icon)
  className?: string;              // Additional CSS classes
  ariaLabel?: string;              // Accessibility label (default: "Add new item")
}
```

## Design Specifications
- **Size**: 56px × 56px (mobile), 64px × 64px (desktop)
- **Position**: Fixed, bottom-right corner
- **Spacing**: 16px from edges (mobile), 24px (tablet+)
- **Shadow**: `shadow-lg` with `hover:shadow-xl`
- **Border Radius**: Fully circular (`rounded-full`)
- **Z-Index**: 50 (ensures it's above most content)
- **Transitions**: All properties with smooth transitions
- **Hover Effect**: Scale up to 105%
- **Active Effect**: Scale down to 95%

## Accessibility Features
- Semantic button element
- ARIA label for screen readers
- Visually hidden text with `sr-only` class
- Keyboard accessible
- Focus states handled by Button component

## Best Practices
1. Always provide a descriptive `ariaLabel`
2. Use consistent icon size (h-6 w-6 for Plus icon)
3. Keep FAB visible and unobstructed
4. Ensure FAB doesn't overlap important content on small screens
5. Use for primary actions only (one FAB per page)

## Notes
- The FAB uses the primary button variant by default
- It's positioned with `fixed` so it stays visible during scrolling
- The component is fully responsive and works on all screen sizes
- The z-index of 50 ensures it appears above most content but below modals/dialogs
