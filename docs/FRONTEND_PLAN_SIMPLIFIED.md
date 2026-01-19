# Frontend Plan - ExpenseAI (Simplified MVP)

## Overview
A modern, responsive expense tracking app built with Next.js 16, shadcn/ui (dashboard-01 block), and Tailwind CSS with AI-powered insights.

**Key Decisions Based on Feedback:**
- ✅ Use `dashboard-01` block from shadcn/ui as base layout
- ✅ Start with 10-15 core components (not 50+)
- ✅ HTTP-only cookies for authentication
- ✅ Global error boundary for error handling
- ✅ Skeleton components for loading states
- ✅ Dark theme with bright accent colors
- ✅ Use `ky` as HTTP client
- ✅ AI chat is a core feature (but as modal, not full page)
- ✅ Responsive design using shadcn's built-in responsiveness
- ⏸️ Offline support and testing (Phase 2+)
- ⏸️ Advanced state management (Phase 2+)

---

## Technology Stack

**Framework & UI:**
- **Framework**: Next.js 16.1.2 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4.x
- **UI Library**: shadcn/ui (using dashboard-01 block)
- **Icons**: Lucide React (included with shadcn/ui)
- **Charts**: shadcn chart components (built on Recharts)

**Data & Forms:**
- **HTTP Client**: ky (modern fetch wrapper)
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **State Management**: React Context (TanStack Query in Phase 2)

**AI Integration:**
- **AI Chat**: Vercel AI SDK (`useChat` hook) - Already installed
- **AI Provider**: AWS Bedrock adapter - Already installed

---

## Page Structure (MVP - 6 Pages)

### Public Pages

#### 1. **Landing Page** (`/`)
- Hero section with value proposition
- Feature highlights
- Call-to-action (Sign up / Login)

#### 2. **Login Page** (`/login`)
- Email/password form
- "Remember me" checkbox
- "Forgot password" link
- **Command**: `npx shadcn@latest add login-01`

#### 3. **Sign Up Page** (`/signup`)
- Email, name, password fields
- Password strength indicator
- Terms & conditions checkbox
- **Command**: `npx shadcn@latest add signup-01`

### Protected Pages

#### 4. **Dashboard** (`/dashboard`)
**Layout**: Use shadcn `dashboard-01` as base
**Command**: `npx shadcn@latest add dashboard-01`

**Sections:**
- **Summary Cards** (3 cards): Total Balance, Income, Expense
- **Spending Trend Chart**: 30-day area chart (shadcn chart)
- **AI Insights Widget**: Compact card with 2-3 insights
- **Recent Transactions Table**: Last 10 transactions (shadcn table)

#### 5. **Transactions** (`/transactions`)
- Transaction table with inline actions
- Quick add transaction button (floating action button)
- Basic filters (type, date range)
- Create/edit transaction dialog

#### 6. **Accounts** (`/accounts`)
- Account cards grid
- Add/edit/delete accounts
- Account balance display
- Transfer between accounts dialog

### Additional Pages (Phase 2+)
- Categories (`/categories`)
- Budgets (`/budgets`)
- Recurring Transactions (`/recurring`)
- Goals (`/goals`)
- Analytics (`/analytics`)
- Settings (`/settings`)

---

## Dashboard Layout (Based on shadcn dashboard-01)

### Dashboard Structure
The dashboard uses the `dashboard-01` block which provides:
- **Sidebar navigation** (collapsible on mobile)
- **Header with breadcrumbs** and user menu
- **Main content area** with responsive grid
- **Built-in dark mode support**

### Dashboard Grid Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Dashboard                        🔔 👤 Settings     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Total Balance│ │ Income       │ │ Expense      │        │
│  │ $120,000     │ │ $53,000      │ │ $12,400      │        │
│  │ ↗ +12.5%     │ │ ↗ +8.2%      │ │ ↘ -3.1%      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│  ┌─────────────────────────────────────┐  ┌──────────────┐  │
│  │ Spending Trend (Last 30 days)       │  │ AI Insights  │  │
│  │ [Area Chart - shadcn chart]         │  │ 💡 Alert     │  │
│  │                                     │  │ 📊 Advice    │  │
│  │                                     │  │ 🎯 Goal      │  │
│  └─────────────────────────────────────┘  └──────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Recent Transactions                    [View All]        ││
│  │ ┌─────────────────────────────────────────────────────┐ ││
│  │ │ Date       Description    Category    Amount        │ ││
│  │ ├─────────────────────────────────────────────────────┤ ││
│  │ │ Today      Coffee Shop    Food         -$5.00       │ ││
│  │ │ Today      Salary         Income     +$5,000.00     │ ││
│  │ │ Yesterday  Grocery        Food        -$120.00      │ ││
│  │ └─────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Responsive Behavior:**
- **Desktop (>1024px)**: 3-column grid for summary cards, 2-column for chart + insights
- **Mobile (<768px)**: Single column, stacked layout

---

## Component Structure (Simplified - 10-15 Components)

### Layout Components (From dashboard-01 block)

#### `AppShell` (Provided by dashboard-01)
- Sidebar navigation (desktop) - **Built-in**
- Header with breadcrumbs - **Built-in**
- User menu dropdown - **Built-in**
- Responsive layout - **Built-in**
- Theme toggle - **Built-in**

**Note**: The dashboard-01 block provides most layout components. We only customize the content area.

### Core Feature Components (MVP)

#### Dashboard Components (3 components)
- `SummaryCard` - Reusable metric card (Balance, Income, Expense)
- `SpendingChart` - Area chart using shadcn chart components
- `InsightWidget` - Compact AI insights display

#### Transaction Components (3 components)
- `TransactionTable` - Table with inline actions (using shadcn Table)
- `TransactionDialog` - Create/edit in modal (using shadcn Dialog + Form)
- `QuickAddButton` - Floating action button

#### Account Components (2 components)
- `AccountCard` - Display account with balance
- `AccountDialog` - Create/edit in modal

#### Shared Form Components (2 components)
- `CategorySelect` - Dropdown with icons (using shadcn Select)
- `AccountSelect` - Dropdown for account selection

#### AI Components (2 components - Phase 1)
- `ChatModal` - AI chat as modal/drawer (not full page)
- `ChatMessage` - Message bubble with streaming support

### Shared Components (shadcn/ui)

**Essential for MVP:**
```bash
npx shadcn@latest add button input label card badge
npx shadcn@latest add dialog select table skeleton toast alert form calendar
npx shadcn@latest add dashboard-01 login-01 signup-01
npx shadcn@latest add chart
```

---

## Color Palette (Simplified - Dark Theme with Bright Accents)

### Core Colors (5 colors only)
```css
/* Dark theme base (from shadcn dark mode) */
--background: hsl(0 0% 3.9%)        /* Near black */
--foreground: hsl(0 0% 98%)         /* Near white */
--card: hsl(0 0% 14.9%)             /* Dark gray */
--border: hsl(0 0% 14.9%)           /* Dark gray */

/* Bright accent colors */
--primary: hsl(142 76% 36%)         /* Bright green - income/positive */
--destructive: hsl(0 84% 60%)       /* Bright red - expense/negative */
--warning: hsl(38 92% 50%)          /* Bright orange - alerts */
--info: hsl(217 91% 60%)            /* Bright blue - info */
--muted: hsl(0 0% 63.9%)            /* Gray text */
```

### Usage
- **Income/Positive**: Green (`--primary`)
- **Expense/Negative**: Red (`--destructive`)
- **Alerts/Warnings**: Orange (`--warning`)
- **Info/Neutral**: Blue (`--info`)
- **Charts**: Rotate through primary, info, warning, destructive

---

## Icon Strategy

### Lucide React (Included with shadcn/ui)

**Installation:**
```bash
npm install lucide-react
```

**Import Icons Individually (Not `import *`):**
```typescript
// ❌ DON'T: Imports entire library (~1000 icons)
import * as Icons from 'lucide-react';

// ✅ DO: Import only what you need
import { Utensils, Car, ShoppingCart, Wallet, TrendingUp } from 'lucide-react';
```

**Category Icons:**
```typescript
// lib/constants/categoryIcons.ts
import { 
  Utensils, Car, ShoppingCart, Receipt, Heart, Film, 
  Home, BookOpen, Briefcase, TrendingUp, Gift, PiggyBank 
} from 'lucide-react';

export const CATEGORY_ICONS = {
  // Expense Categories
  food: Utensils,
  transport: Car,
  shopping: ShoppingCart,
  bills: Receipt,
  health: Heart,
  entertainment: Film,
  home: Home,
  education: BookOpen,
  
  // Income Categories
  salary: Briefcase,
  investment: TrendingUp,
  gift: Gift,
  
  // Goals
  savings: PiggyBank,
} as const;
```

---

## Charts (Using shadcn Chart Components)

### Why shadcn Charts?
✅ **Built on Recharts** - Powerful but simplified
✅ **Pre-styled** - Matches your design system
✅ **Dark mode support** - Built-in
✅ **Responsive** - Mobile-friendly
✅ **TypeScript** - Full type safety
✅ **Smaller bundle** - Only import what you need

### Installation
```bash
npx shadcn@latest add chart
```

### Example: Spending Trend Chart
```typescript
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

export function SpendingChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <ChartTooltip />
        <Area 
          type="monotone" 
          dataKey="expense" 
          stroke="hsl(var(--destructive))" 
          fill="hsl(var(--destructive))" 
        />
      </AreaChart>
    </ChartContainer>
  )
}
```

---

## Folder Structure (Simplified)

```
expenseai/
├── app/
│   ├── (auth)/                    # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/               # Dashboard layout group
│   │   ├── layout.tsx             # Dashboard shell (dashboard-01)
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Main dashboard
│   │   ├── transactions/
│   │   │   └── page.tsx           # Transaction list
│   │   └── accounts/
│   │       └── page.tsx           # Account list
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout
│   └── globals.css
├── components/
│   ├── layout/
│   │   └── ErrorBoundary.tsx      # Global error boundary
│   ├── dashboard/
│   │   ├── SummaryCard.tsx
│   │   ├── SpendingChart.tsx
│   │   └── InsightWidget.tsx
│   ├── transactions/
│   │   ├── TransactionTable.tsx
│   │   ├── TransactionDialog.tsx
│   │   └── QuickAddButton.tsx
│   ├── accounts/
│   │   ├── AccountCard.tsx
│   │   └── AccountDialog.tsx
│   ├── ai/
│   │   ├── ChatModal.tsx
│   │   └── ChatMessage.tsx
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── ... (all shadcn components)
├── lib/
│   ├── api/                       # API client functions
│   │   ├── client.ts              # ky HTTP client setup
│   │   ├── auth.ts
│   │   ├── transactions.ts
│   │   └── accounts.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useTransactions.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── constants/
│   │   └── categoryIcons.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
└── types/
    └── index.ts
```

---

## API Integration (Using ky HTTP Client)

### Install ky
```bash
npm install ky
```

### API Client Setup

**File**: `lib/api/client.ts`
```typescript
import ky from 'ky';

// Base client with HTTP-only cookie support
export const api = ky.create({
  prefixUrl: '/api',
  credentials: 'include', // HTTP-only cookies
  timeout: 30000,
  retry: 2,
  hooks: {
    beforeError: [
      error => {
        const { response } = error;
        if (response && response.body) {
          error.name = 'APIError';
          error.message = `${response.status}: ${response.statusText}`;
        }
        return error;
      }
    ]
  }
});
```

**File**: `lib/api/transactions.ts`
```typescript
import { api } from './client';
import type { Transaction, CreateTransactionData } from '@/types';

export const transactionsApi = {
  list: () => api.get('transactions').json<{ data: Transaction[] }>(),
  
  create: (data: CreateTransactionData) => 
    api.post('transactions', { json: data }).json<Transaction>(),
  
  update: (id: string, data: Partial<CreateTransactionData>) =>
    api.put(`transactions/${id}`, { json: data }).json<Transaction>(),
  
  delete: (id: string) => 
    api.delete(`transactions/${id}`),
};
```

**Why ky?**
- ✅ Smaller than axios (3KB vs 15KB)
- ✅ Modern fetch-based API
- ✅ Built-in retry and timeout
- ✅ Automatic JSON handling
- ✅ TypeScript-first
- ✅ HTTP-only cookie support

---

## State Management (Simplified)

### AuthContext (HTTP-only Cookies)

**File**: `lib/contexts/AuthContext.tsx`
```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api/client';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (HTTP-only cookie)
    api.get('auth/me')
      .json<{ data: User }>()
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('auth/login', { json: { email, password } }).json<{ data: User }>();
    setUser(res.data);
  };

  const logout = async () => {
    await api.post('auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Note**: Theme is handled by shadcn's built-in theme provider (no custom context needed).

---

## Error Handling (Global Error Boundary)

**File**: `components/layout/ErrorBoundary.tsx`
```typescript
'use client';

import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Usage in root layout:**
```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## Loading States (Skeleton Components)

### Example: Transaction Table Loading
```typescript
import { Skeleton } from '@/components/ui/skeleton';

function TransactionTableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

// Usage
function TransactionTable() {
  const { transactions, isLoading } = useTransactions();
  
  if (isLoading) return <TransactionTableSkeleton />;
  
  return <Table>...</Table>;
}
```

---

## Forms & Validation

### React Hook Form + Zod Integration

**Example: Transaction Form**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.date(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export function TransactionForm() {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      date: new Date(),
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    await transactionsApi.create(data);
    toast.success('Transaction created');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Transaction</Button>
      </form>
    </Form>
  );
}
```

---

## Mobile-First Design

### Responsive Patterns
- **Cards**: Stack vertically on mobile, grid on desktop
- **Tables**: Use shadcn's responsive table (horizontal scroll on mobile)
- **Dialogs**: Full-screen on mobile, centered modal on desktop
- **Sidebar**: Drawer on mobile (built into dashboard-01), permanent on desktop

### Tailwind Breakpoints
```typescript
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

**Layout Strategy:**
- **Mobile** (< 768px): Single column, drawer navigation
- **Desktop** (> 768px): Multi-column grid, permanent sidebar

---

## Implementation Priority (Revised)

### Phase 1: Foundation (Week 1-2)
- [ ] Install shadcn/ui and configure dark theme
- [ ] Add dashboard-01, login-01, signup-01 blocks
- [ ] Set up ky HTTP client with HTTP-only cookies
- [ ] Implement AuthContext with login/logout
- [ ] Create Global ErrorBoundary
- [ ] Configure Skeleton loading states

### Phase 2: Core Dashboard (Week 3-4)
- [ ] Build Dashboard page using dashboard-01 layout
- [ ] Create 3 SummaryCard components (Balance, Income, Expense)
- [ ] Add SpendingChart using shadcn chart
- [ ] Build InsightWidget for AI insights
- [ ] Add Recent Transactions table

### Phase 3: Transactions & Accounts (Week 5-6)
- [ ] Create TransactionTable component
- [ ] Build TransactionDialog with form validation
- [ ] Add QuickAddButton (floating action button)
- [ ] Create AccountCard component
- [ ] Build AccountDialog

### Phase 4: AI Integration (Week 7-8)
- [ ] Implement ChatModal with useChat hook
- [ ] Add streaming response support
- [ ] Create tool call indicators
- [ ] Build AI insights fetching and display
- [ ] Add dismiss/mark as read functionality

### Phase 5: Additional Features (Week 9-12)
- [ ] Budgets page and components
- [ ] Goals page and components
- [ ] Recurring transactions page
- [ ] Categories management
- [ ] Analytics page with advanced charts

### Phase 6: Polish (Week 13-14)
- [ ] Add loading skeletons everywhere
- [ ] Implement toast notifications for all actions
- [ ] Create empty states with illustrations
- [ ] Test responsive design on all devices
- [ ] Performance optimization

---

## Installation Commands (MVP)

### 1. Install Required Dependencies
```bash
# HTTP client
npm install ky

# Date handling
npm install date-fns

# Forms (React Hook Form + Zod already installed)
npm install react-hook-form @hookform/resolvers
```

### 2. Add shadcn/ui Components (MVP Only)
```bash
# Initialize shadcn (if not done)
npx shadcn@latest init

# Core components
npx shadcn@latest add button input label card badge
npx shadcn@latest add dialog select table skeleton toast alert form calendar

# Pre-built blocks (includes charts!)
npx shadcn@latest add dashboard-01  # Dashboard with sidebar + charts
npx shadcn@latest add login-01      # Login page
npx shadcn@latest add signup-01     # Signup page

# Chart components (built on Recharts)
npx shadcn@latest add chart
```

**Note**: Lucide icons are already included with shadcn/ui.

---

## Key Simplifications from Original Plan

### ✅ What We Kept
1. **shadcn/ui with dashboard-01** - Perfect base layout
2. **Dark theme with bright accents** - Modern and clean
3. **HTTP-only cookies** - Secure authentication
4. **Skeleton loading states** - Better UX
5. **AI chat as core feature** - But as modal, not full page
6. **Responsive design** - Mobile-first approach

### ✂️ What We Simplified
1. **Components**: 50+ → 10-15 core components
2. **Pages**: 13 → 6 pages for MVP
3. **Charts**: Custom Recharts → shadcn chart components
4. **State Management**: Custom hooks → Simple useEffect (TanStack Query later)
5. **HTTP Client**: Custom wrapper → ky
6. **Colors**: 17+ colors → 5 core colors
7. **Icons**: Import all → Import individually

### ⏸️ What We Deferred (Phase 2+)
1. Offline support and PWA features
2. Testing infrastructure
3. Advanced state management (TanStack Query)
4. Budgets, Goals, Recurring, Categories pages
5. Advanced analytics and charts
6. Framer Motion animations

---

## Next Steps

1. ✅ **Review this simplified plan** - Confirm it aligns with your vision
2. 🚀 **Start Phase 1** - Set up foundation (Week 1-2)
3. 📊 **Build Dashboard** - Core dashboard components (Week 3-4)
4. 💰 **Add Transactions** - Transaction management (Week 5-6)
5. 🤖 **Integrate AI** - AI chat and insights (Week 7-8)

**Estimated MVP Timeline**: 8-10 weeks for a fully functional expense tracker with AI features.

---

## Summary

This simplified plan focuses on:
- **Speed to market** - 6 pages instead of 13
- **Proven patterns** - Using shadcn blocks instead of custom components
- **Modern tools** - ky, shadcn charts, HTTP-only cookies
- **Clean code** - 10-15 components instead of 50+
- **Iterative approach** - Build MVP, then add features based on feedback

The result: A polished, functional expense tracker that can be built in 8-10 weeks instead of 6+ months.
