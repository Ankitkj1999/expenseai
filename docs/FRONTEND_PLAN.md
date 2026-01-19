# Frontend Plan - ExpenseAI

## Overview
A modern, responsive PWA built with Next.js 16, shadcn/ui, and Tailwind CSS for an AI-powered expense tracking experience.

---

## Technology Stack

**Current Versions (from package.json):**
- **Framework**: Next.js 16.1.2 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4.x
- **TypeScript**: 5.x

**UI & Visualization:**
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React (included with shadcn/ui)
- **Charts**: Recharts (for financial visualizations)
- **Forms**: React Hook Form + Zod validation (Zod already installed)

**AI Integration:**
- **AI Chat**: Vercel AI SDK (`useChat` hook) - Already installed (ai@6.0.39)
- **AI Provider**: AWS Bedrock adapter - Already installed (@ai-sdk/amazon-bedrock@4.0.19)

**Utilities:**
- **Date Handling**: date-fns
- **Animations**: Framer Motion (optional, for polish)
- **State Management**: React Context + Hooks (built-in)

---

## Page Structure

### Public Pages

#### 1. **Landing Page** (`/`)
- Hero section with value proposition
- Feature highlights
- Call-to-action (Sign up / Login)
- Use shadcn `login-01` block as base

#### 2. **Login Page** (`/login`)
- Email/password form
- "Remember me" checkbox
- "Forgot password" link
- Social login options (future)
- **Command**: `npx shadcn@latest add login-01`

#### 3. **Sign Up Page** (`/signup`)
- Email, name, password fields
- Password strength indicator
- Terms & conditions checkbox
- **Command**: `npx shadcn@latest add signup-01`

### Protected Pages (Requires Authentication)

#### 4. **Dashboard** (`/dashboard`)
**Layout**: Use shadcn `dashboard-01` as base
**Command**: `npx shadcn@latest add dashboard-01`

**Sections:**
- **Header**: Greeting, notifications, settings
- **Summary Cards**: Total earning, income, expense, savings
- **AI Insights Widget**: Weekly insights with alert/advice cards
- **Monthly Financial Rhythm**: Income/expense/saving breakdown
- **Asset Distribution**: Portfolio allocation table
- **Financial Health**: Circular progress chart
- **Favorite Transactions**: Quick access to recurring items

#### 5. **Transactions** (`/transactions`)
- Transaction list with filters (type, date range, category, account)
- Quick add transaction button (floating action button)
- Search and sort functionality
- Pagination
- Transaction detail modal/drawer

#### 6. **Accounts** (`/accounts`)
- Account cards with balance
- Add/edit/delete accounts
- Account type icons (cash, bank, credit, wallet)
- Transfer between accounts

#### 7. **Categories** (`/categories`)
- System categories (read-only)
- Custom categories (user-created)
- Icon picker with Lucide icons
- Color picker
- Category usage statistics

#### 8. **Budgets** (`/budgets`)
- Budget cards with progress bars
- Create/edit budget modal
- Budget status indicators (on track, warning, exceeded)
- Category-wise budget breakdown
- Alert threshold settings

#### 9. **Recurring Transactions** (`/recurring`)
- List of recurring transactions
- Status badges (active, paused)
- Next occurrence date
- Pause/resume/edit actions
- Create recurring transaction modal

#### 10. **Goals** (`/goals`)
- Goal cards with progress indicators
- Priority badges (high, medium, low)
- Deadline countdown
- Milestone timeline
- Add contribution modal
- Projected completion date

#### 11. **Analytics** (`/analytics`)
- Spending trends chart (line/bar)
- Category breakdown (pie/donut chart)
- Period comparison
- Income vs expense chart
- Export data button

#### 12. **AI Chat** (`/chat`)
- Chat interface with message history
- Streaming AI responses
- Tool call indicators
- Quick action buttons
- Voice input (future)
- Receipt upload (future)

#### 13. **Settings** (`/settings`)
- Profile settings
- Currency preferences
- Date format
- Theme (light/dark)
- Notification preferences
- Export/import data

---

## Component Structure

### Layout Components

#### `AppShell`
- Sidebar navigation (desktop)
- Bottom navigation (mobile)
- Header with user menu
- Notification bell
- Theme toggle

#### `Sidebar`
- Navigation links with icons
- Active state highlighting
- Collapsible on mobile
- User profile section at bottom

#### `Header`
- Page title
- Breadcrumbs
- Quick actions
- User avatar dropdown

### Feature Components

#### Transaction Components
- `TransactionList` - Paginated list with filters
- `TransactionCard` - Individual transaction display
- `TransactionForm` - Create/edit transaction
- `TransactionFilters` - Filter sidebar/drawer
- `QuickAddButton` - Floating action button

#### Account Components
- `AccountCard` - Display account with balance
- `AccountForm` - Create/edit account
- `AccountSelector` - Dropdown for selecting account
- `TransferDialog` - Transfer between accounts

#### Category Components
- `CategoryGrid` - Grid of category cards
- `CategoryForm` - Create/edit category
- `IconPicker` - Select icon from Lucide
- `ColorPicker` - Select category color

#### Budget Components
- `BudgetCard` - Budget with progress bar
- `BudgetForm` - Create/edit budget
- `BudgetProgress` - Visual progress indicator
- `BudgetAlert` - Warning/exceeded alert

#### Recurring Components
- `RecurringList` - List of recurring transactions
- `RecurringCard` - Individual recurring item
- `RecurringForm` - Create/edit recurring transaction
- `FrequencySelector` - Select frequency and interval

#### Goal Components
- `GoalCard` - Goal with progress circle
- `GoalForm` - Create/edit goal
- `GoalProgress` - Progress visualization
- `MilestoneTimeline` - Timeline of milestones
- `ContributeDialog` - Add contribution modal

#### Insight Components
- `InsightWidget` - Container for insight cards
- `InsightCard` - Individual insight (alert/advice)
- `InsightIcon` - Icon based on category
- `InsightActions` - Mark read/dismiss actions

#### Chart Components
- `SpendingTrendChart` - Line/bar chart (Recharts)
- `CategoryPieChart` - Pie/donut chart
- `FinancialHealthChart` - Circular progress
- `ComparisonChart` - Side-by-side comparison
- `AssetAllocationChart` - Portfolio distribution

#### AI Components
- `ChatInterface` - Main chat UI
- `ChatMessage` - Individual message bubble
- `ChatInput` - Input with send button
- `ToolCallIndicator` - Show when AI calls tools
- `StreamingIndicator` - Loading animation

### Shared Components (shadcn/ui)

**Already Available:**
- `Button`, `Input`, `Label`, `Card`, `Badge`
- `Dialog`, `Sheet`, `Popover`, `Dropdown`
- `Table`, `Tabs`, `Select`, `Checkbox`
- `Progress`, `Separator`, `Avatar`, `Skeleton`
- `Toast`, `Alert`, `Command`, `Calendar`

**To Add:**
```bash
npx shadcn@latest add button input label card badge
npx shadcn@latest add dialog sheet popover dropdown-menu
npx shadcn@latest add table tabs select checkbox
npx shadcn@latest add progress separator avatar skeleton
npx shadcn@latest add toast alert command calendar
npx shadcn@latest add form  # React Hook Form integration
```

---

## Icon Strategy

### Primary: **Lucide React** (Included with shadcn/ui)

**Installation:**
```bash
npm install lucide-react
```

**Category Icons:**
```typescript
// lib/constants/categoryIcons.ts
import * as Icons from 'lucide-react';

export const CATEGORY_ICONS = {
  // Expense Categories
  food: 'Utensils',
  transport: 'Car',
  shopping: 'ShoppingCart',
  bills: 'Receipt',
  health: 'Heart',
  entertainment: 'Film',
  home: 'Home',
  education: 'BookOpen',
  
  // Income Categories
  salary: 'Briefcase',
  freelance: 'Laptop',
  investment: 'TrendingUp',
  gift: 'Gift',
  
  // Account Types
  cash: 'Wallet',
  bank: 'Building2',
  credit: 'CreditCard',
  wallet: 'Wallet',
  
  // Goals
  savings: 'PiggyBank',
  vacation: 'Plane',
  purchase: 'ShoppingBag',
  emergency: 'Shield',
} as const;

// Dynamic icon renderer
export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = Icons[name as keyof typeof Icons] || Icons.Circle;
  return <IconComponent className={className} />;
}
```

**Available Icons for Expense Tracker:**
- **Food**: `Utensils`, `Coffee`, `Pizza`, `Apple`, `Beef`
- **Transport**: `Car`, `Bus`, `Bike`, `Plane`, `Train`, `Fuel`
- **Shopping**: `ShoppingCart`, `ShoppingBag`, `Gift`, `Package`
- **Bills**: `Receipt`, `FileText`, `Zap`, `Wifi`, `Phone`
- **Health**: `Heart`, `Activity`, `Pill`, `Stethoscope`, `Cross`
- **Entertainment**: `Film`, `Music`, `Gamepad2`, `Tv`, `Popcorn`
- **Home**: `Home`, `Sofa`, `Wrench`, `Hammer`, `PaintBucket`
- **Education**: `BookOpen`, `GraduationCap`, `School`, `Library`
- **Income**: `Briefcase`, `DollarSign`, `TrendingUp`, `Wallet`
- **Goals**: `Target`, `PiggyBank`, `Trophy`, `Star`, `Flag`

---

## Chart Library: Recharts

### Why Recharts?
✅ **React-native** - Built for React
✅ **Declarative** - Easy to use with JSX
✅ **Responsive** - Works on all screen sizes
✅ **Customizable** - Full control over styling
✅ **Well-maintained** - Active development
✅ **TypeScript support** - Full type safety

### Installation
```bash
npm install recharts
```

### Chart Types Needed

#### 1. **Spending Trend Chart** (Line/Area Chart)
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={trendData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="expense" stroke="#EF4444" />
    <Line type="monotone" dataKey="income" stroke="#10B981" />
  </LineChart>
</ResponsiveContainer>
```

#### 2. **Category Breakdown** (Pie/Donut Chart)
```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={categoryData}
      dataKey="amount"
      nameKey="categoryName"
      cx="50%"
      cy="50%"
      innerRadius={60}  // For donut chart
      outerRadius={80}
      label
    >
      {categoryData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

#### 3. **Financial Health** (Radial/Circular Progress)
```typescript
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <RadialBarChart
    innerRadius="60%"
    outerRadius="100%"
    data={[{ name: 'Savings', value: 64, fill: '#10B981' }]}
    startAngle={180}
    endAngle={0}
  >
    <RadialBar dataKey="value" />
  </RadialBarChart>
</ResponsiveContainer>
```

#### 4. **Budget Progress** (Bar Chart)
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={budgetData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="spent" fill="#EF4444" />
    <Bar dataKey="remaining" fill="#10B981" />
  </BarChart>
</ResponsiveContainer>
```

---

## Color Palette (Inspired by Image)

### Primary Colors
```css
--primary: #1a1a1a (dark text)
--secondary: #6b7280 (gray text)
--accent: #10B981 (green - positive/income)
--danger: #EF4444 (red - negative/expense)
--warning: #F59E0B (orange - alerts)
--info: #3B82F6 (blue - info)
```

### Background Colors
```css
--background: #ffffff (white)
--card: #f9fafb (light gray)
--muted: #f3f4f6 (muted gray)
--border: #e5e7eb (border gray)
```

### Chart Colors
```css
--chart-1: #10B981 (green)
--chart-2: #3B82F6 (blue)
--chart-3: #F59E0B (orange)
--chart-4: #8B5CF6 (purple)
--chart-5: #EC4899 (pink)
```

### Category Colors (Suggested)
- Food: `#10B981` (green)
- Transport: `#3B82F6` (blue)
- Shopping: `#F59E0B` (orange)
- Bills: `#6366F1` (indigo)
- Health: `#EF4444` (red)
- Entertainment: `#8B5CF6` (purple)
- Home: `#14B8A6` (teal)
- Education: `#06B6D4` (cyan)

---

## Folder Structure

```
expenseai/
├── app/
│   ├── (auth)/                    # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/               # Dashboard layout group
│   │   ├── layout.tsx             # Dashboard shell with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Main dashboard
│   │   ├── transactions/
│   │   │   ├── page.tsx           # Transaction list
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Transaction detail
│   │   ├── accounts/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── budgets/
│   │   │   └── page.tsx
│   │   ├── recurring/
│   │   │   └── page.tsx
│   │   ├── goals/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx          # Mobile navigation
│   │   └── UserMenu.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionCard.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionFilters.tsx
│   │   └── QuickAddButton.tsx
│   ├── accounts/
│   │   ├── AccountCard.tsx
│   │   ├── AccountForm.tsx
│   │   ├── AccountSelector.tsx
│   │   └── TransferDialog.tsx
│   ├── categories/
│   │   ├── CategoryGrid.tsx
│   │   ├── CategoryForm.tsx
│   │   ├── IconPicker.tsx
│   │   └── ColorPicker.tsx
│   ├── budgets/
│   │   ├── BudgetCard.tsx
│   │   ├── BudgetForm.tsx
│   │   ├── BudgetProgress.tsx
│   │   └── BudgetAlert.tsx
│   ├── recurring/
│   │   ├── RecurringList.tsx
│   │   ├── RecurringCard.tsx
│   │   ├── RecurringForm.tsx
│   │   └── FrequencySelector.tsx
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   ├── GoalForm.tsx
│   │   ├── GoalProgress.tsx
│   │   ├── MilestoneTimeline.tsx
│   │   └── ContributeDialog.tsx
│   ├── insights/
│   │   ├── InsightWidget.tsx
│   │   ├── InsightCard.tsx
│   │   └── InsightActions.tsx
│   ├── charts/
│   │   ├── SpendingTrendChart.tsx
│   │   ├── CategoryPieChart.tsx
│   │   ├── FinancialHealthChart.tsx
│   │   ├── ComparisonChart.tsx
│   │   └── AssetAllocationChart.tsx
│   ├── ai/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ToolCallIndicator.tsx
│   │   └── StreamingIndicator.tsx
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (all shadcn components)
├── lib/
│   ├── api/                       # API client functions
│   │   ├── auth.ts
│   │   ├── accounts.ts
│   │   ├── transactions.ts
│   │   ├── categories.ts
│   │   ├── budgets.ts
│   │   ├── recurring.ts
│   │   ├── goals.ts
│   │   ├── insights.ts
│   │   └── analytics.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAccounts.ts
│   │   ├── useTransactions.ts
│   │   ├── useBudgets.ts
│   │   ├── useGoals.ts
│   │   ├── useInsights.ts
│   │   └── useAnalytics.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── constants/
│   │   ├── categoryIcons.ts
│   │   ├── colors.ts
│   │   └── routes.ts
│   └── utils/
│       ├── formatters.ts          # Currency, date formatting
│       ├── validators.ts
│       └── helpers.ts
└── types/
    └── index.ts
```

---

## Dashboard Layout (Inspired by Image)

### Improved Dashboard Grid Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Good morning, [Name] 👋          🤖 ⚙️ 🔔          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────┐  ┌────────────────────┐  │
│  │ Total Balance                │  │ Weekly AI Insight  │  │
│  │ $120,000                     │  │ ┌────┐  ┌────┐    │  │
│  │ Saved 12% from last month    │  │ │Alrt│  │Advc│    │  │
│  │                              │  │ └────┘  └────┘    │  │
│  │ Income  Expense  Saving      │  │ Spending ↑ 12%    │  │
│  │ $53,000 $12,400  $129,000    │  │ Budget at 85%     │  │
│  └──────────────────────────────┘  └────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────┐  ┌────────────────────┐  │
│  │ Spending Trend (7 days)      │  │ Financial Health   │  │
│  │ [Line Chart]                 │  │   ╭─────╮          │  │
│  │ ↗ Income  ↘ Expense          │  │  │  64%  │         │  │
│  └──────────────────────────────┘  │   ╰─────╯          │  │
│                                     │ Savings Rate       │  │
│  ┌──────────────────────────────┐  └────────────────────┘  │
│  │ Category Breakdown           │                           │
│  │ [Pie Chart + Top 5 List]     │  ┌────────────────────┐  │
│  │ 🍔 Food        $2,500  40%   │  │ Active Goals       │  │
│  │ 🚗 Transport   $1,200  20%   │  │ Emergency: 60%     │  │
│  │ 🛍️ Shopping    $1,000  16%   │  │ Vacation: 35%      │  │
│  └──────────────────────────────┘  │ Laptop: 80%        │  │
│                                     └────────────────────┘  │
│  ┌──────────────────────────────┐                           │
│  │ Recent Transactions (5)      │  ┌────────────────────┐  │
│  │ Today                        │  │ Budget Overview    │  │
│  │ ├ Coffee Shop      -$5       │  │ Groceries: 85%     │  │
│  │ ├ Salary        +$5,000      │  │ Transport: 45%     │  │
│  │ Yesterday                    │  │ Entertainment: 90% │  │
│  │ ├ Grocery        -$120       │  │ [View All]         │  │
│  │ └ Uber           -$15        │  └────────────────────┘  │
│  └──────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. ✅ **Replaced "Favorite Transactions"** → **"Active Goals"** widget
2. ✅ **Replaced "Upgrade to Pro"** → **"Budget Overview"** widget
3. ✅ **Added "Spending Trend Chart"** → 7-day line chart
4. ✅ **Added "Category Breakdown"** → Pie chart + top 5 list
5. ✅ **Added "Recent Transactions"** → Last 5 transactions
6. ✅ **Renamed "Total Earning"** → **"Total Balance"** (more accurate)

### Responsive Breakpoints
```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

**Layout Strategy:**
- **Mobile** (< 768px): Single column, bottom navigation
- **Tablet** (768px - 1024px): 2-column grid, collapsible sidebar
- **Desktop** (> 1024px): 3-column grid, permanent sidebar

---

## State Management

### Context Providers

#### `AuthContext`
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}
```

#### `ThemeContext`
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### Custom Hooks

#### `useAccounts()`
```typescript
const { accounts, isLoading, createAccount, updateAccount, deleteAccount } = useAccounts();
```

#### `useTransactions(filters)`
```typescript
const { transactions, total, isLoading, createTransaction, updateTransaction, deleteTransaction } = useTransactions({
  type: 'expense',
  startDate: new Date(),
  endDate: new Date(),
});
```

#### `useInsights()`
```typescript
const { insights, isLoading, refresh, markAsRead, dismiss } = useInsights();
```

---

## Key Features Implementation

### 1. Dashboard Summary Cards

**Component**: `SummaryCard.tsx`
```typescript
interface SummaryCardProps {
  title: string;
  amount: number;
  change?: {
    percentage: number;
    period: string;
  };
  icon: LucideIcon;
  trend?: 'up' | 'down';
}
```

### 2. AI Insight Widget

**Component**: `InsightWidget.tsx`
- Displays 2-4 insight cards
- Categories: Money alert, Advice, Achievement, Goal progress
- Click to expand for details
- Dismiss/mark as read actions
- Auto-refresh indicator

### 3. Transaction Quick Add

**Component**: `QuickAddButton.tsx`
- Floating action button (bottom-right on mobile)
- Opens dialog with transaction form
- Quick category selection
- Amount input with currency
- Date picker (defaults to today)

### 4. Financial Health Gauge

**Component**: `FinancialHealthChart.tsx`
- Circular progress indicator
- Shows savings rate (% of income saved)
- Color-coded (green: good, orange: warning, red: poor)
- Based on last 30 days data

### 5. Recurring Transaction Cards

**Component**: `RecurringCard.tsx`
- Shows next occurrence date
- Pause/resume toggle
- Edit/delete actions
- Frequency badge (monthly, weekly, etc.)
- Amount and category display

### 6. Goal Progress Cards

**Component**: `GoalCard.tsx`
- Progress circle or bar
- Remaining amount
- Deadline countdown
- "Add contribution" button
- Projected completion date
- Priority badge

---

## Forms & Validation

### React Hook Form + Zod Integration

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers zod
npx shadcn@latest add form
```

**Example: Transaction Form**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  accountId: z.string(),
  categoryId: z.string(),
  date: z.date(),
});

const form = useForm({
  resolver: zodResolver(transactionSchema),
  defaultValues: {
    type: 'expense',
    amount: 0,
    description: '',
    date: new Date(),
  },
});
```

---

## API Integration

### API Client Pattern

**File**: `lib/api/transactions.ts`
```typescript
export async function getTransactions(filters?: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
  
  const response = await fetch(`/api/transactions?${params}`, {
    credentials: 'include', // Include cookies
  });
  
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function createTransaction(data: CreateTransactionData) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
}
```

### Custom Hook Pattern

**File**: `lib/hooks/useTransactions.ts`
```typescript
export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true);
      try {
        const data = await getTransactions(filters);
        setTransactions(data.data);
      } catch (error) {
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTransactions();
  }, [filters]);
  
  return { transactions, isLoading, refetch: fetchTransactions };
}
```

---

## Mobile-First Design

### Bottom Navigation (Mobile)
```typescript
// components/layout/BottomNav.tsx
const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Add', href: '/transactions/new', icon: PlusCircle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'More', href: '/settings', icon: Menu },
];
```

### Responsive Patterns
- **Cards**: Stack vertically on mobile, grid on desktop
- **Tables**: Horizontal scroll on mobile, full table on desktop
- **Dialogs**: Full-screen on mobile, centered modal on desktop
- **Sidebar**: Drawer on mobile, permanent on desktop

---

## Implementation Priority

### Phase 1: Authentication & Layout ✅
1. Set up shadcn/ui and Tailwind
2. Create login/signup pages (`login-01`, `signup-01`)
3. Implement authentication flow
4. Create dashboard layout (`dashboard-01`)
5. Build sidebar and header components

### Phase 2: Core Features
1. **Dashboard Page**
   - Summary cards (earning, income, expense, saving)
   - Basic layout with placeholder data
2. **Transactions**
   - Transaction list with filters
   - Create/edit/delete transaction
   - Transaction detail view
3. **Accounts**
   - Account cards
   - Create/edit/delete account
   - Account selector component

### Phase 3: Budgets & Categories
1. **Categories**
   - Category grid
   - Icon picker with Lucide icons
   - Color picker
   - Create/edit custom categories
2. **Budgets**
   - Budget cards with progress bars
   - Create/edit budget
   - Budget status indicators

### Phase 4: Recurring & Goals
1. **Recurring Transactions**
   - Recurring transaction list
   - Create/edit recurring transaction
   - Pause/resume functionality
   - Frequency selector
2. **Goals**
   - Goal cards with progress
   - Create/edit goal
   - Add contribution dialog
   - Milestone timeline

### Phase 5: AI & Insights
1. **AI Chat**
   - Chat interface with `useChat` hook
   - Message bubbles
   - Streaming responses
   - Tool call indicators
2. **AI Insights Widget**
   - Insight cards (alert/advice)
   - Auto-refresh
   - Mark as read/dismiss

### Phase 6: Analytics & Charts
1. **Analytics Dashboard**
   - Spending trend chart (Recharts)
   - Category breakdown pie chart
   - Period comparison
   - Financial health gauge
2. **Chart Components**
   - Reusable chart wrappers
   - Responsive containers
   - Custom tooltips

### Phase 7: Polish & PWA
1. Loading states and skeletons
2. Error boundaries
3. Toast notifications
4. PWA manifest and service worker
5. Offline support
6. Push notifications

---

## Backend API Integration Map

### Authentication Flow
**Pages**: `/login`, `/signup`
**APIs Used:**
- `POST /api/auth/register` → Create account
- `POST /api/auth/login` → Login with cookies
- `GET /api/auth/me` → Get current user
- `POST /api/auth/logout` → Logout

**Components:**
- `LoginForm` → Calls login API, stores cookie
- `SignupForm` → Calls register API
- `AuthGuard` → Checks `/api/auth/me` on route change

### Dashboard Page (`/dashboard`)
**APIs Used:**
- `GET /api/analytics/summary?period=month` → Total earning, income, expense
- `GET /api/insights` → Weekly AI insights
- `GET /api/analytics/trends?period=month` → Monthly financial rhythm
- `GET /api/accounts` → Asset distribution
- `GET /api/goals` → Financial health calculation
- `GET /api/recurring-transactions?isActive=true` → Favorite transactions

**Components:**
- `SummaryCards` → Display income/expense/savings
- `InsightWidget` → Show AI-generated insights
- `FinancialRhythmChart` → Visualize income sources
- `AssetDistributionTable` → Show account balances
- `FinancialHealthGauge` → Savings rate indicator
- `FavoriteTransactions` → Quick access to recurring items

### Transactions Page (`/transactions`)
**APIs Used:**
- `GET /api/transactions?limit=50&skip=0` → List transactions
- `POST /api/transactions` → Create transaction
- `PUT /api/transactions/:id` → Update transaction
- `DELETE /api/transactions/:id` → Delete transaction
- `GET /api/accounts` → Account selector
- `GET /api/categories` → Category selector

**Components:**
- `TransactionList` → Fetch and display transactions
- `TransactionFilters` → Filter by type, date, category, account
- `TransactionForm` → Create/edit with validation
- `QuickAddButton` → Floating action button
- `TransactionCard` → Display individual transaction

### Accounts Page (`/accounts`)
**APIs Used:**
- `GET /api/accounts` → List all accounts
- `POST /api/accounts` → Create account
- `PUT /api/accounts/:id` → Update account
- `DELETE /api/accounts/:id` → Delete account

**Components:**
- `AccountGrid` → Display account cards
- `AccountCard` → Show balance, type, icon
- `AccountForm` → Create/edit account
- `TransferDialog` → Transfer between accounts

### Categories Page (`/categories`)
**APIs Used:**
- `GET /api/categories` → List categories
- `POST /api/categories` → Create custom category
- `PUT /api/categories/:id` → Update category
- `DELETE /api/categories/:id` → Delete category

**Components:**
- `CategoryGrid` → Display all categories
- `CategoryCard` → Show icon, color, usage stats
- `CategoryForm` → Create/edit with icon picker
- `IconPicker` → Select from Lucide icons
- `ColorPicker` → Choose category color

### Budgets Page (`/budgets`)
**APIs Used:**
- `GET /api/budgets` → List budgets
- `POST /api/budgets` → Create budget
- `PUT /api/budgets/:id` → Update budget
- `DELETE /api/budgets/:id` → Delete budget
- `GET /api/budgets/:id/status` → Get spending status

**Components:**
- `BudgetList` → Display budget cards
- `BudgetCard` → Show progress bar, status
- `BudgetForm` → Create/edit budget
- `BudgetProgress` → Visual progress indicator
- `BudgetAlert` → Warning when threshold reached

### Recurring Transactions Page (`/recurring`)
**APIs Used:**
- `GET /api/recurring-transactions` → List recurring
- `POST /api/recurring-transactions` → Create recurring
- `PUT /api/recurring-transactions/:id` → Update recurring
- `DELETE /api/recurring-transactions/:id` → Delete recurring
- `POST /api/recurring-transactions/:id/pause` → Pause
- `POST /api/recurring-transactions/:id/resume` → Resume

**Components:**
- `RecurringList` → Display recurring transactions
- `RecurringCard` → Show frequency, next date, status
- `RecurringForm` → Create/edit with frequency selector
- `FrequencySelector` → Choose daily/weekly/monthly/yearly
- `PauseResumeToggle` → Control recurring status

### Goals Page (`/goals`)
**APIs Used:**
- `GET /api/goals` → List goals
- `POST /api/goals` → Create goal
- `PUT /api/goals/:id` → Update goal
- `DELETE /api/goals/:id` → Delete goal
- `GET /api/goals/:id/progress` → Get progress with projections
- `POST /api/goals/:id/contribute` → Add contribution
- `POST /api/goals/:id/complete` → Mark complete

**Components:**
- `GoalGrid` → Display goal cards
- `GoalCard` → Show progress circle, deadline
- `GoalForm` → Create/edit goal
- `GoalProgress` → Circular/linear progress
- `ContributeDialog` → Add contribution
- `MilestoneTimeline` → Show progress history
- `ProjectionBadge` → Estimated completion date

### Analytics Page (`/analytics`)
**APIs Used:**
- `GET /api/analytics/summary?period=month` → Summary stats
- `GET /api/analytics/trends?period=month&groupBy=day` → Trend data
- `GET /api/analytics/category-breakdown?type=expense` → Category data
- `GET /api/analytics/comparison?currentPeriod=month` → Period comparison

**Components:**
- `AnalyticsDashboard` → Main container
- `SpendingTrendChart` → Line chart (Recharts)
- `CategoryPieChart` → Pie chart (Recharts)
- `ComparisonCards` → Current vs previous period
- `PeriodSelector` → Choose time range
- `ExportButton` → Download data

### AI Chat Page (`/chat`)
**APIs Used:**
- `POST /api/ai/chat` → Send message, get streaming response
- `GET /api/ai/chat?sessionId=xxx` → Get chat history

**Components:**
- `ChatInterface` → Main chat container
- `ChatMessages` → Message list with auto-scroll
- `ChatMessage` → Individual message bubble
- `ChatInput` → Input with send button
- `StreamingIndicator` → Typing animation
- `ToolCallBadge` → Show when AI uses tools
- `QuickActions` → Suggested prompts

### Settings Page (`/settings`)
**APIs Used:**
- `GET /api/auth/me` → Get user info
- `PUT /api/auth/me` → Update profile (to be implemented)
- `GET /api/export` → Export data (to be implemented)
- `POST /api/import` → Import data (to be implemented)

**Components:**
- `SettingsTabs` → Profile, Preferences, Data
- `ProfileForm` → Update name, email
- `PreferencesForm` → Currency, date format, theme
- `ExportImportSection` → Data portability

---

## Design System

### Typography
```css
/* Headings */
h1: text-4xl font-bold (Dashboard title)
h2: text-2xl font-semibold (Section headers)
h3: text-xl font-medium (Card titles)
h4: text-lg font-medium (Subsections)

/* Body */
body: text-base (Regular text)
small: text-sm (Secondary info)
tiny: text-xs (Labels, captions)
```

### Spacing
```css
/* Consistent spacing scale */
xs: 0.5rem (2px)
sm: 0.75rem (3px)
md: 1rem (4px)
lg: 1.5rem (6px)
xl: 2rem (8px)
2xl: 3rem (12px)
```

### Card Styles
```css
/* Standard card */
className="rounded-lg border bg-card p-6 shadow-sm"

/* Hover card */
className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"

/* Insight card (from image) */
className="rounded-xl bg-muted/50 p-4 hover:bg-muted/70 transition-colors"
```

### Button Variants
- **Primary**: `variant="default"` - Main actions
- **Secondary**: `variant="outline"` - Secondary actions
- **Destructive**: `variant="destructive"` - Delete actions
- **Ghost**: `variant="ghost"` - Subtle actions
- **Link**: `variant="link"` - Navigation

### Status Colors
```typescript
// Transaction types
expense: 'text-red-500 bg-red-50'
income: 'text-green-500 bg-green-50'
transfer: 'text-blue-500 bg-blue-50'

// Budget status
on_track: 'text-green-500'
warning: 'text-orange-500'
exceeded: 'text-red-500'

// Goal priority
high: 'text-red-500 bg-red-50'
medium: 'text-orange-500 bg-orange-50'
low: 'text-blue-500 bg-blue-50'

// Insight categories
alert: 'text-red-500 bg-red-50'
advice: 'text-blue-500 bg-blue-50'
achievement: 'text-green-500 bg-green-50'
goal_progress: 'text-purple-500 bg-purple-50'
```

---

## Polished UI Principles

### 1. **Consistent Spacing**
- Use Tailwind spacing scale consistently
- 4px/8px/16px/24px grid system
- Consistent padding in cards (p-4 or p-6)

### 2. **Subtle Animations**
- Hover states on interactive elements
- Smooth transitions (transition-colors, transition-shadow)
- Loading skeletons for async data
- Fade-in animations for new content

### 3. **Clear Visual Hierarchy**
- Bold headings with proper sizing
- Muted text for secondary information
- Icons to reinforce meaning
- Consistent color coding

### 4. **Responsive Design**
- Mobile-first approach
- Touch-friendly targets (min 44x44px)
- Collapsible sidebar on mobile
- Bottom navigation for mobile
- Responsive charts and tables

### 5. **Feedback & States**
- Loading skeletons (not spinners)
- Toast notifications for actions
- Inline validation errors
- Success/error states
- Empty states with illustrations

### 6. **Accessibility**
- Proper ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast (WCAG AA)
- Screen reader support

---

## Installation Commands

### 1. Install Required Dependencies
```bash
# Charts
npm install recharts

# Date handling
npm install date-fns

# Forms (React Hook Form already compatible with Zod)
npm install react-hook-form @hookform/resolvers

# Optional: Animations
npm install framer-motion
```

### 2. Add shadcn/ui Components
```bash
# Core components
npx shadcn@latest init
npx shadcn@latest add button input label card badge
npx shadcn@latest add dialog sheet popover dropdown-menu
npx shadcn@latest add table tabs select checkbox radio-group
npx shadcn@latest add progress separator avatar skeleton
npx shadcn@latest add toast alert command calendar
npx shadcn@latest add form textarea switch slider

# Pre-built blocks
npx shadcn@latest add login-01      # Login page
npx shadcn@latest add signup-01     # Signup page
npx shadcn@latest add dashboard-01  # Dashboard layout
```

### 3. Install Lucide Icons
```bash
# Already included with shadcn/ui, but explicit install:
npm install lucide-react
```

---

## API Client Layer

### Centralized API Functions

**File**: `lib/api/client.ts`
```typescript
// Base fetch wrapper with error handling
async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include', // Include HTTP-only cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}
```

### Feature-Specific API Files

**`lib/api/transactions.ts`**
```typescript
export const transactionsApi = {
  list: (filters?: TransactionFilters) => 
    apiClient<TransactionResponse>(`/api/transactions?${buildQuery(filters)}`),
  
  create: (data: CreateTransactionData) =>
    apiClient<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: UpdateTransactionData) =>
    apiClient<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiClient(`/api/transactions/${id}`, { method: 'DELETE' }),
};
```

**Similar structure for:**
- `lib/api/accounts.ts`
- `lib/api/categories.ts`
- `lib/api/budgets.ts`
- `lib/api/recurring.ts`
- `lib/api/goals.ts`
- `lib/api/insights.ts`
- `lib/api/analytics.ts`

---

## Custom Hooks Pattern

### Data Fetching Hooks

**`lib/hooks/useTransactions.ts`**
```typescript
export function useTransactions(filters?: TransactionFilters) {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await transactionsApi.list(filters);
      setData(response.data);
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (data: CreateTransactionData) => {
    await transactionsApi.create(data);
    await fetchTransactions(); // Refresh list
    toast.success('Transaction created');
  };

  return {
    transactions: data,
    isLoading,
    error,
    refetch: fetchTransactions,
    createTransaction,
  };
}
```

**Similar hooks for:**
- `useAccounts()` → Account management
- `useBudgets()` → Budget tracking
- `useGoals()` → Goal progress
- `useRecurring()` → Recurring transactions
- `useInsights()` → AI insights
- `useAnalytics(period)` → Analytics data

---

## Component-to-API Mapping

### Transaction Components
| Component | API Endpoint | Method | Purpose |
|-----------|-------------|--------|---------|
| `TransactionList` | `/api/transactions` | GET | Fetch transactions |
| `TransactionForm` | `/api/transactions` | POST | Create transaction |
| `TransactionForm` | `/api/transactions/:id` | PUT | Update transaction |
| `TransactionCard` | `/api/transactions/:id` | DELETE | Delete transaction |
| `TransactionFilters` | `/api/transactions?filters` | GET | Filter transactions |

### Budget Components
| Component | API Endpoint | Method | Purpose |
|-----------|-------------|--------|---------|
| `BudgetList` | `/api/budgets` | GET | Fetch budgets |
| `BudgetForm` | `/api/budgets` | POST | Create budget |
| `BudgetCard` | `/api/budgets/:id/status` | GET | Get budget status |
| `BudgetProgress` | `/api/budgets/:id/status` | GET | Show progress |

### Goal Components
| Component | API Endpoint | Method | Purpose |
|-----------|-------------|--------|---------|
| `GoalGrid` | `/api/goals` | GET | Fetch goals |
| `GoalForm` | `/api/goals` | POST | Create goal |
| `GoalProgress` | `/api/goals/:id/progress` | GET | Get progress data |
| `ContributeDialog` | `/api/goals/:id/contribute` | POST | Add contribution |
| `GoalCard` | `/api/goals/:id/complete` | POST | Mark complete |

### Recurring Components
| Component | API Endpoint | Method | Purpose |
|-----------|-------------|--------|---------|
| `RecurringList` | `/api/recurring-transactions` | GET | Fetch recurring |
| `RecurringForm` | `/api/recurring-transactions` | POST | Create recurring |
| `RecurringCard` | `/api/recurring-transactions/:id/pause` | POST | Pause recurring |
| `RecurringCard` | `/api/recurring-transactions/:id/resume` | POST | Resume recurring |

### Insight Components
| Component | API Endpoint | Method | Purpose |
|-----------|-------------|--------|---------|
| `InsightWidget` | `/api/insights` | GET | Fetch cached insights |
| `InsightCard` | `/api/insights/:id` | DELETE | Dismiss insight |
| `RefreshButton` | `/api/insights` | POST | Manual refresh |

### Analytics Components
| Component | API Endpoint | Method | Purpose |
|-----------|-------------|--------|---------|
| `SpendingTrendChart` | `/api/analytics/trends` | GET | Trend data |
| `CategoryPieChart` | `/api/analytics/category-breakdown` | GET | Category data |
| `SummaryCards` | `/api/analytics/summary` | GET | Summary stats |
| `ComparisonChart` | `/api/analytics/comparison` | GET | Period comparison |

### AI Chat Components
| Component | API Endpoint | Method | Purpose |
|-----------|-------------|--------|---------|
| `ChatInterface` | `/api/ai/chat` | POST | Send message (streaming) |
| `ChatHistory` | `/api/ai/chat?sessionId=xxx` | GET | Load chat history |

---

## Responsive Dashboard Grid

### Desktop Layout (> 1024px)
```typescript
<div className="grid grid-cols-12 gap-6 p-6">
  {/* Summary Cards - Full width */}
  <div className="col-span-8">
    <SummaryCards />
  </div>
  
  {/* AI Insights - Sidebar */}
  <div className="col-span-4">
    <InsightWidget />
  </div>
  
  {/* Financial Rhythm - 2/3 width */}
  <div className="col-span-8">
    <FinancialRhythmChart />
  </div>
  
  {/* Financial Health - 1/3 width */}
  <div className="col-span-4">
    <FinancialHealthGauge />
  </div>
  
  {/* Asset Distribution - 2/3 width */}
  <div className="col-span-8">
    <AssetDistributionTable />
  </div>
  
  {/* Favorite Transactions - 1/3 width */}
  <div className="col-span-4">
    <FavoriteTransactions />
  </div>
</div>
```

### Mobile Layout (< 768px)
```typescript
<div className="flex flex-col gap-4 p-4">
  <SummaryCards />
  <InsightWidget />
  <FinancialHealthGauge />
  <FinancialRhythmChart />
  <FavoriteTransactions />
  <AssetDistributionTable />
</div>
```

---

## Key UI Patterns

### 1. **Loading States**
```typescript
// Skeleton loading
{isLoading ? (
  <Skeleton className="h-24 w-full" />
) : (
  <TransactionCard transaction={transaction} />
)}
```

### 2. **Empty States**
```typescript
// No data state
{transactions.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12">
    <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium">No transactions yet</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Start by adding your first transaction
    </p>
    <Button onClick={openAddDialog}>Add Transaction</Button>
  </div>
)}
```

### 3. **Error States**
```typescript
// Error boundary
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

### 4. **Success Feedback**
```typescript
// Toast notifications
import { toast } from 'sonner';

toast.success('Transaction created successfully');
toast.error('Failed to delete account');
toast.info('Budget threshold reached');
```

---

## Performance Optimization

### 1. **Code Splitting**
- Use dynamic imports for heavy components
- Lazy load charts and analytics
- Split by route automatically (Next.js)

### 2. **Data Caching**
- Cache API responses with SWR or React Query (optional)
- Optimistic UI updates
- Invalidate cache on mutations

### 3. **Image Optimization**
- Use Next.js `<Image>` component
- Lazy load images
- Proper sizing and formats

### 4. **Bundle Size**
- Tree-shake Lucide icons
- Import Recharts components individually
- Use dynamic imports for modals

---

## Implementation Checklist

### Phase 1: Setup & Authentication
- [ ] Initialize shadcn/ui (`npx shadcn@latest init`)
- [ ] Add login-01 block
- [ ] Add signup-01 block
- [ ] Create AuthContext
- [ ] Implement login/signup pages
- [ ] Add authentication guards

### Phase 2: Dashboard & Core
- [ ] Add dashboard-01 block
- [ ] Create AppShell layout
- [ ] Build Sidebar component
- [ ] Implement Dashboard page with summary cards
- [ ] Add InsightWidget component
- [ ] Create FinancialHealthGauge

### Phase 3: Transactions & Accounts
- [ ] Install Recharts
- [ ] Create TransactionList component
- [ ] Build TransactionForm with validation
- [ ] Add QuickAddButton (FAB)
- [ ] Create AccountCard component
- [ ] Build AccountForm

### Phase 4: Categories & Budgets
- [ ] Create IconPicker with Lucide icons
- [ ] Build ColorPicker component
- [ ] Implement CategoryGrid
- [ ] Create BudgetCard with progress bars
- [ ] Build BudgetForm

### Phase 5: Recurring & Goals
- [ ] Create RecurringCard component
- [ ] Build FrequencySelector
- [ ] Implement GoalCard with progress circle
- [ ] Create MilestoneTimeline
- [ ] Build ContributeDialog

### Phase 6: AI & Analytics
- [ ] Implement ChatInterface with useChat hook
- [ ] Create chart components (Recharts)
- [ ] Build SpendingTrendChart
- [ ] Create CategoryPieChart
- [ ] Implement AnalyticsDashboard

### Phase 7: Polish
- [ ] Add loading skeletons everywhere
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Create empty states
- [ ] Test responsive design
- [ ] Add PWA manifest

---

## Next Steps

1. **Run shadcn init**: `npx shadcn@latest init`
2. **Add base components**: Start with button, card, dialog, form
3. **Add blocks**: Install login-01, signup-01, dashboard-01
4. **Install dependencies**: Recharts, date-fns, react-hook-form
5. **Create API client layer**: Build `lib/api/` functions
6. **Build custom hooks**: Create `lib/hooks/` for data fetching
7. **Implement pages**: Start with authentication, then dashboard

The frontend is designed to be **polished but not overdone** - clean, modern, and functional with subtle animations and consistent design patterns.