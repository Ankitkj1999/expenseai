# ExpenseAI

An AI-powered expense tracking application that simplifies financial management through natural language interactions. Track expenses, manage budgets, and gain insights into your spending patterns with the help of AI.

## Overview

ExpenseAI eliminates the friction of traditional expense tracking by allowing users to log transactions through conversational AI. Instead of filling out forms, simply chat with the AI to record expenses, create budgets, and analyze your financial data.

## Key Features

- **AI-Powered Chat Interface** - Log expenses and income through natural conversation
- **Smart Transaction Management** - Automatic categorization and insights
- **Budget Tracking** - Set and monitor budgets with AI-driven recommendations
- **Analytics Dashboard** - Visualize spending patterns and trends
- **Multi-Account Support** - Manage multiple bank accounts and cash sources
- **Recurring Transactions** - Automate regular expenses and income
- **Custom Categories** - Create personalized expense categories

## AI Tools & Capabilities

The AI assistant uses specialized tools to interact with your financial data:

- **`getTransactions`** - Retrieve transaction history with filters (type, category, date range, account)
- **`createTransaction`** - Log new expenses, income, or transfers through natural language
- **`getSpendingSummary`** - Get income, expenses, and net balance for any period
- **`getCategoryBreakdown`** - Analyze spending or income by category with percentages
- **`getBudgetStatus`** - Check budget usage, remaining amounts, and alerts
- **`getAccounts`** - List all accounts with balances and details
- **`getCategories`** - View available expense and income categories

**Example Queries:**
- "Show my budget status"
- "What did I spend this month?"
- "I spent $50 on lunch"
- "Show me my grocery expenses for last week"
- "How much money do I have in my savings account?"

## Upcoming Features

- **Notifications** - Real-time alerts for budget limits, recurring transactions, and spending insights
- **Recurring Transaction Improvements** - Enhanced automation with cron scheduling (addressing current cron issues)
- **Enhanced AI Chat** - Expanded AI capabilities with tools for creating categories, recurring transactions, and more through natural conversation
- **Generative AI Features** - Advanced AI-powered financial insights and personalized recommendations
- **Progressive Web App (PWA)** - In progress: Enable installation on home screen for a native app-like experience

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: Vercel AI SDK with Amazon Bedrock
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Authentication**: JWT with bcryptjs

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env.local`):
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # Add AI SDK credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
expenseai/
├── app/              # Next.js App Router
│   ├── (auth)/       # Authentication pages
│   ├── (dashboard)/  # Protected dashboard pages
│   └── api/          # API route handlers
├── components/       # React components
│   ├── ui/           # Reusable UI primitives
│   ├── forms/        # Form components
│   ├── analytics/    # Charts and visualizations
│   ├── dashboard/    # Dashboard components
│   └── ...           # Feature-specific components
├── lib/              # Core business logic
│   ├── db/           # Database models and connection
│   ├── services/     # Business logic layer
│   ├── api/          # Frontend API clients
│   ├── hooks/        # Custom React hooks
│   └── utils/        # Utility functions
└── docs/             # Documentation
```

For detailed folder structure documentation, see [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md).

## Security

ExpenseAI implements comprehensive security measures including:
- Strong password requirements (12+ characters with complexity)
- NoSQL injection prevention
- Request size limits to prevent DoS attacks
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- JWT authentication with HTTP-only cookies
- Input validation and sanitization

For detailed security documentation, see [docs/SECURITY.md](docs/SECURITY.md).

## License

MIT
