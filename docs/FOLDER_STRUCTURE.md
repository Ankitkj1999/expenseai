# Folder Structure

ExpenseAI is a Next.js 16 application using the App Router pattern with TypeScript, MongoDB, and AI integration.

## Root Structure

```
expenseai/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components organized by feature
├── lib/              # Core business logic and utilities
├── docs/             # Project documentation
└── public/           # Static assets
```

## `/app` - Application Routes

```
app/
├── (auth)/           # Authentication pages (login, signup)
├── (dashboard)/      # Protected dashboard pages
├── api/              # API route handlers
├── layout.tsx        # Root layout
├── page.tsx          # Landing page
└── globals.css       # Global styles
```

### API Routes (`/app/api`)
- **`/accounts`** - Account management
- **`/analytics`** - Financial analytics and insights
- **`/auth`** - Authentication (login, register, logout)
- **`/budgets`** - Budget CRUD operations
- **`/categories`** - Category management
- **`/insights`** - AI-generated insights
- **`/recurring-transactions`** - Recurring transaction management
- **`/transactions`** - Transaction CRUD operations
- **`/ai/chat`** - AI chat interface
- **`/user/preferences`** - User settings

## `/components` - UI Components

```
components/
├── ui/               # Reusable UI primitives (shadcn/ui)
├── forms/            # Form components and dialogs
├── analytics/        # Charts and analytics visualizations
├── dashboard/        # Dashboard-specific components
├── transactions/     # Transaction table and cards
├── budgets/          # Budget cards and displays
├── recurring/        # Recurring transaction components
├── ai/               # AI chat interface components
├── auth/             # Auth guards and wrappers
├── landing/          # Landing page components
└── layout/           # Layout utilities (error boundaries, containers)
```

## `/lib` - Business Logic

```
lib/
├── db/               # Database connection and models
│   ├── mongodb.ts    # MongoDB connection
│   └── models/       # Mongoose schemas
├── services/         # Business logic layer
├── api/              # Frontend API client functions
├── hooks/            # Custom React hooks
├── contexts/         # React context providers
├── middleware/       # API middleware (auth, validation)
├── providers/        # React providers (React Query)
├── utils/            # Utility functions
└── constants/        # App constants and configurations
```

### Key Subdirectories

**`/lib/db/models`** - Mongoose schemas for:
- User, Account, Transaction, Budget
- Category, RecurringTransaction
- AIInsight, ChatSession

**`/lib/services`** - Business logic services:
- Account, Transaction, Budget management
- Analytics calculations
- AI integration
- Recurring transaction processing

**`/lib/api`** - Frontend API client functions matching backend routes

**`/lib/hooks`** - React Query hooks for data fetching and mutations

## `/docs` - Documentation

Technical documentation including API specs, integration guides, and architectural decisions.

## Key Patterns

- **App Router**: File-based routing with route groups `(auth)` and `(dashboard)`
- **API Routes**: RESTful endpoints in `/app/api` with service layer separation
- **Component Organization**: Feature-based folders with index exports
- **Data Fetching**: React Query hooks wrapping API client functions
- **Authentication**: JWT-based with middleware protection
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Amazon Bedrock for chat and insights
