# Backend Plan - ExpenseAI

## Overview
A Next.js full-stack application using MongoDB for an AI-powered expense tracking PWA.

---

## Database Schema (MongoDB)

### Collections

#### 1. **users**
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date,
  preferences: {
    currency: String,
    dateFormat: String,
    theme: String
  }
}
```

#### 2. **accounts**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String, // "Cash", "HDFC Bank", "Credit Card"
  type: String, // "cash", "bank", "credit", "wallet"
  balance: Number,
  currency: String,
  icon: String,
  color: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **categories**
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // null for system categories
  name: String,
  type: String, // "expense" or "income"
  icon: String,
  color: String,
  isSystem: Boolean, // true for default categories
  createdAt: Date
}
```

#### 4. **transactions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // "expense", "income", "transfer"
  amount: Number,
  description: String,
  accountId: ObjectId, // source account
  toAccountId: ObjectId, // for transfers only
  categoryId: ObjectId,
  tags: [String],
  date: Date,
  attachments: [{ // receipts/images
    url: String,
    type: String,
    extractedData: Object // AI extracted data from receipt
  }],
  aiGenerated: Boolean, // logged via AI chat/speech
  metadata: {
    location: String,
    notes: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. **budgets**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  categoryId: ObjectId, // optional, budget per category
  amount: Number,
  period: String, // "daily", "weekly", "monthly", "yearly"
  startDate: Date,
  endDate: Date,
  alertThreshold: Number, // percentage (e.g., 80%)
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. **recurring_transactions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // "expense", "income"
  amount: Number,
  description: String,
  accountId: ObjectId,
  categoryId: ObjectId,
  frequency: String, // "daily", "weekly", "monthly", "yearly"
  interval: Number, // e.g., 2 for "every 2 months"
  startDate: Date,
  endDate: Date, // optional, null for infinite recurrence
  nextOccurrence: Date, // when to create next transaction
  lastGeneratedDate: Date, // last time transaction was created
  isActive: Boolean,
  metadata: {
    dayOfMonth: Number, // for monthly (e.g., 1st, 15th)
    dayOfWeek: Number, // for weekly (0-6, Sunday-Saturday)
    notes: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. **goals**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String, // "Emergency Fund", "Vacation", "New Laptop"
  type: String, // "savings", "debt_payoff", "purchase"
  targetAmount: Number,
  currentAmount: Number,
  deadline: Date, // optional target date
  linkedAccountId: ObjectId, // optional, track specific account
  linkedCategoryId: ObjectId, // optional, track category spending
  priority: String, // "high", "medium", "low"
  status: String, // "active", "completed", "paused"
  milestones: [{
    amount: Number,
    date: Date,
    note: String
  }],
  metadata: {
    icon: String,
    color: String,
    notes: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 8. **ai_insights**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // "weekly" | "monthly" | "realtime"
  insights: [{
    category: String, // "alert" | "advice" | "achievement" | "goal_progress"
    title: String, // "Spending increased by 12%"
    description: String, // "last week"
    priority: String, // "high" | "medium" | "low"
    metadata: {
      percentage: Number,
      amount: Number,
      comparisonPeriod: String,
      categoryId: ObjectId,
      goalId: ObjectId
    },
    isRead: Boolean,
    createdAt: Date
  }],
  generatedAt: Date,
  expiresAt: Date, // Auto-delete after 30 days
  isStale: Boolean, // True if >7 days old
  createdAt: Date,
  updatedAt: Date
}
```

#### 9. **chat_sessions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  messages: [{
    role: String, // "user" or "assistant"
    content: String,
    timestamp: Date,
    toolCalls: [{ // Tool/function calls made by AI
      toolName: String, // e.g., "getTransactions", "createTransaction"
      arguments: Object, // Tool input parameters
      result: Object, // Tool execution result
      timestamp: Date
    }],
    generatedComponents: [String], // For Generative UI (React component names)
    linkedTransactionIds: [ObjectId], // Transactions created/referenced
    metadata: {
      actionType: String // "log_expense", "query", "analysis", "visualization"
    }
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `GET /api/accounts/:id/balance` - Get account balance

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/:id` - Get transaction details

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create custom category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/status` - Get budget usage status

### Recurring Transactions
- `GET /api/recurring-transactions` - List all recurring transactions
- `POST /api/recurring-transactions` - Create recurring transaction
- `PUT /api/recurring-transactions/:id` - Update recurring transaction
- `DELETE /api/recurring-transactions/:id` - Delete recurring transaction
- `POST /api/recurring-transactions/:id/pause` - Pause recurring transaction
- `POST /api/recurring-transactions/:id/resume` - Resume recurring transaction
- `POST /api/recurring-transactions/process` - Manual trigger to process due recurrences (cron job)

### Goals
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/:id/progress` - Get goal progress and projections
- `POST /api/goals/:id/contribute` - Manually add contribution to goal
- `POST /api/goals/:id/complete` - Mark goal as completed

### AI Features
- `POST /api/ai/chat` - Main AI chat endpoint with tool calling (text streaming)
- `POST /api/ai/chat-ui` - AI chat with Generative UI (returns React components)
- `POST /api/ai/extract-receipt` - Extract structured data from receipt images

### AI Insights
- `GET /api/insights` - Get current cached insights for user
- `POST /api/insights/generate` - Manually trigger insight generation (rate-limited)
- `PUT /api/insights/:id/read` - Mark specific insight as read
- `DELETE /api/insights/:id` - Dismiss/delete specific insight
- `POST /api/insights/process` - Background cron job to generate insights for all users

### Analytics
- `GET /api/analytics/summary` - Get expense/income summary
- `GET /api/analytics/trends` - Get spending trends
- `GET /api/analytics/category-breakdown` - Category-wise breakdown
- `GET /api/analytics/comparison` - Period comparison

### Import/Export
- `POST /api/import` - Import transactions (CSV/JSON)
- `GET /api/export` - Export transactions (CSV/JSON)

---

## Services Layer

### 1. **authService**
- User authentication
- JWT token management
- Password hashing

### 2. **transactionService**
- CRUD operations for transactions
- Transaction validation
- Account balance updates

### 3. **aiService**
- AWS Bedrock integration (Claude/Llama via Vercel AI SDK)
- Tool/function definitions for AI to call
- Natural language processing for expense logging
- Receipt image analysis (Claude 3.5 Sonnet Vision)
- Chat streaming with tool calling
- Generative UI component generation

### 4. **analyticsService**
- Generate spending insights (called by AI tools)
- Calculate trends and growth metrics
- Period comparisons
- Budget tracking and alerts
- Category breakdowns for visualizations
- Aggregated data for AI analysis

### 5. **accountService**
- Manage accounts
- Calculate balances
- Handle transfers

### 6. **categoryService**
- Manage categories
- Initialize default categories

### 7. **budgetService**
- Budget calculations
- Alert triggers
- Usage tracking

### 8. **recurringTransactionService**
- CRUD operations for recurring transactions
- Process due recurrences (cron job logic)
- Generate actual transactions from templates
- Calculate next occurrence dates
- Handle pause/resume functionality

### 9. **goalService**
- CRUD operations for goals
- Track progress and contributions
- Calculate projections and completion estimates
- Link to accounts/categories for automatic tracking
- Milestone management

### 10. **insightService**
- Generate periodic AI insights (weekly/monthly)
- Analyze spending patterns and trends
- Create alert and advice cards
- Process insights for all users (cron job)
- Cache management and expiration
- Real-time critical alerts (budget exceeded, unusual transactions)

### 11. **exportService**
- CSV/JSON export
- Data import validation

---

## Folder Structure

```
expenseai/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── me/route.ts
│   │   ├── accounts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── transactions/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── budgets/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── recurring-transactions/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── process/route.ts
│   │   │   └── [id]/
│   │   │       ├── pause/route.ts
│   │   │       └── resume/route.ts
│   │   ├── goals/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── progress/route.ts
│   │   │       ├── contribute/route.ts
│   │   │       └── complete/route.ts
│   │   ├── ai/
│   │   │   ├── chat/route.ts           # Main AI chat with tool calling
│   │   │   ├── chat-ui/route.ts        # Generative UI endpoint
│   │   │   └── extract-receipt/route.ts # Receipt image analysis
│   │   ├── insights/
│   │   │   ├── route.ts                # Get cached insights
│   │   │   ├── generate/route.ts       # Manual trigger
│   │   │   ├── process/route.ts        # Cron job endpoint
│   │   │   └── [id]/
│   │   │       ├── read/route.ts       # Mark as read
│   │   │       └── route.ts            # Delete insight
│   │   ├── analytics/
│   │   │   ├── summary/route.ts
│   │   │   ├── trends/route.ts
│   │   │   └── category-breakdown/route.ts
│   │   └── import-export/
│   │       ├── import/route.ts
│   │       └── export/route.ts
│   └── (pages...)
├── lib/
│   ├── db/
│   │   ├── mongodb.ts          # MongoDB connection
│   │   └── models/              # Mongoose models
│   │       ├── User.ts
│   │       ├── Account.ts
│   │       ├── Transaction.ts
│   │       ├── Category.ts
│   │       ├── Budget.ts
│   │       ├── RecurringTransaction.ts
│   │       ├── Goal.ts
│   │       ├── AIInsight.ts
│   │       └── ChatSession.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── aiService.ts
│   │   ├── analyticsService.ts
│   │   ├── accountService.ts
│   │   ├── categoryService.ts
│   │   ├── budgetService.ts
│   │   ├── recurringTransactionService.ts
│   │   ├── goalService.ts
│   │   ├── insightService.ts
│   │   └── exportService.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── helpers.ts
│   └── middleware/
│       ├── auth.ts
│       └── errorMiddleware.ts
├── types/
│   └── index.ts                # TypeScript types
└── .env
```

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (HTTP-only cookies)
- **AI Provider**: AWS Bedrock (Claude 3.5 Sonnet, Llama models)
- **AI SDK**: Vercel AI SDK (`ai` package) with `@ai-sdk/amazon-bedrock` adapter
- **Validation**: Zod (for tool schemas and data validation)
- **API**: Next.js API Routes
- **UI Components**: Vercel AI SDK UI hooks (`useChat`, `useCompletion`)

---

## Implementation Priority

### Phase 1: Core Features ✅ (Completed)
1. ✅ Database setup & models
2. ✅ Authentication system (JWT with HTTP-only cookies)
3. ✅ Account management
4. ✅ Basic transaction CRUD with balance updates
5. ✅ Categories (with defaults)
6. ✅ Budgets with status tracking

### Phase 2: AI Integration 🎯 (Current Focus)
1. Install Vercel AI SDK + AWS Bedrock adapter
2. Create aiService with tool definitions:
   - `getTransactions` - Query transactions with filters
   - `createTransaction` - Create expense/income via AI
   - `getSpendingSummary` - Get aggregated spending data
   - `getBudgetStatus` - Check budget usage
   - `getCategoryBreakdown` - Category-wise analysis
3. Build `/api/ai/chat` endpoint (text streaming with tool calling)
4. Build basic chat UI with `useChat` hook
5. Test tool calling with simple queries

### Phase 3: Advanced AI Features
1. Implement `/api/ai/chat-ui` (Generative UI)
2. Create chart components (PieChart, BarChart, LineChart)
3. Receipt image extraction (Claude 3.5 Sonnet Vision)
4. Speech-to-text integration
5. Natural language date parsing

### Phase 4: Recurring Transactions & Goals 🔄 (Next Priority)
1. Create RecurringTransaction model
2. Build recurringTransactionService with:
   - CRUD operations
   - Next occurrence calculation logic
   - Transaction generation from templates
3. Build `/api/recurring-transactions` endpoints
4. Create Goal model
5. Build goalService with:
   - Progress tracking
   - Projection calculations
   - Auto-tracking from linked accounts/categories
6. Build `/api/goals` endpoints
7. Add cron job/scheduler for processing recurring transactions

### Phase 5: AI Insights 💡
1. Create AIInsight model
2. Build insightService with:
   - Weekly/monthly insight generation logic
   - Spending pattern analysis
   - Alert and advice card creation
   - Cache management
3. Build `/api/insights` endpoints
4. Implement cron jobs:
   - Weekly insights (Sunday 8 PM)
   - Monthly insights (1st of month)
   - Daily budget alerts
5. Add manual refresh with rate limiting
6. Create insight card UI components

### Phase 6: Analytics & Polish
1. Analytics dashboard with visualizations
2. Budget alerts and notifications
3. Import/Export (CSV/JSON)
4. Error handling and validation
5. Testing (unit + integration)
6. PWA features (offline support, push notifications)

---

## Key Design Decisions

1. **MongoDB over SQL**: Flexible schema for AI-generated data, easier to iterate
2. **Next.js API Routes**: Simplified full-stack development, single codebase
3. **AWS Bedrock + Vercel AI SDK**:
   - Tool calling pattern (AI decides when to query DB)
   - No manual context injection (efficient token usage)
   - Streaming responses for better UX
   - Generative UI for inline visualizations
4. **Tool-Based Architecture**: AI calls predefined functions instead of raw DB access (security + scalability)
5. **User-owned Categories**: Flexibility for custom expense categories
6. **Transfer as Transaction Type**: Simplifies account balance tracking
7. **Chat Sessions with Tool Metadata**: Track tool calls for debugging and undo functionality
8. **Extensible Schema**: Metadata fields for future features
9. **Dual API Pattern**: Traditional REST APIs + AI tool APIs work side-by-side
10. **Separate Recurring Model**: Templates don't affect balances, clean separation of concerns
11. **Goal Tracking Flexibility**: Link to accounts/categories for automatic progress or manual contributions
12. **Cached AI Insights**: Periodic generation (not per-request) for performance and cost efficiency
13. **Hybrid Insight System**: Cached periodic insights + real-time critical alerts

---

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/expenseai

# Authentication
JWT_SECRET=your-secret-key-here

# AWS Bedrock (AI)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Optional: NextAuth (if using OAuth)
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## AI Architecture: Tool Calling Pattern

### How AI Accesses Data

**Traditional Approach (Inefficient):**
```
User: "How much did I spend on food?"
→ Fetch ALL transactions
→ Send to AI (wastes tokens)
→ AI filters and responds
```

**New Approach (Efficient):**
```
User: "How much did I spend on food?"
→ AI analyzes query
→ AI calls tool: getTransactions({ category: 'food' })
→ Tool queries DB with filters
→ Returns only relevant data
→ AI processes and responds
```

### Tool Definitions

AI has access to these predefined tools:

1. **`getTransactions`** - Query transactions with filters
   - Parameters: `{ type?, categoryId?, startDate?, endDate?, limit? }`
   - Returns: Array of transactions
   - Use case: "Show me expenses from last week"

2. **`createTransaction`** - Create new transaction
   - Parameters: `{ type, amount, description, accountId, categoryId, date? }`
   - Returns: Created transaction
   - Use case: "I spent $50 on groceries"

3. **`getSpendingSummary`** - Get aggregated spending data
   - Parameters: `{ period: 'today' | 'week' | 'month' | 'year', groupBy? }`
   - Returns: Summary with totals and breakdowns
   - Use case: "What's my spending this month?"

4. **`getBudgetStatus`** - Check budget usage
   - Parameters: `{ categoryId? }`
   - Returns: Budget status with alerts
   - Use case: "Am I over budget?"

5. **`getCategoryBreakdown`** - Category-wise analysis
   - Parameters: `{ period, type: 'expense' | 'income' }`
   - Returns: Data for pie charts
   - Use case: "Show me spending by category"

### Security Model

✅ **AI NEVER has direct DB access**
✅ **All queries go through service layer**
✅ **userId is injected by middleware (AI can't fake it)**
✅ **Tool parameters are validated with Zod schemas**
✅ **Rate limiting on AI endpoints**

### Data Flow Example

```
┌─────────────────┐
│ User: "I spent  │
│ $50 on lunch"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ POST /api/ai/chat       │
│ (Vercel AI SDK)         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ AI analyzes message     │
│ Decides to call tool    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Tool: createTransaction │
│ { type: 'expense',      │
│   amount: 50,           │
│   description: 'lunch', │
│   categoryId: 'food' }  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ transactionService      │
│ .createTransaction()    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ MongoDB Insert          │
│ Update account balance  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Return to AI            │
│ "Transaction created"   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ AI: "I've logged your   │
│ $50 lunch expense"      │
└─────────────────────────┘
```

---

## Generative UI Pattern

Instead of just text responses, AI can return React components:

**Example:**
```
User: "Show me my spending breakdown"

AI Response (Generative UI):
┌─────────────────────────┐
│ Your Spending Breakdown │
├─────────────────────────┤
│  [Pie Chart Component]  │
│  Food: 40%              │
│  Transport: 30%         │
│  Entertainment: 20%     │
│  Other: 10%             │
└─────────────────────────┘
```

**Implementation:**
- Use `/api/ai/chat-ui` endpoint
- AI returns: `<PieChart data={categoryData} />`
- Client renders component directly in chat
- Interactive and visually rich

---

## Next Steps for AI Implementation

1. **Install Dependencies:**
   ```bash
   npm install ai @ai-sdk/amazon-bedrock zod
   ```

2. **Create aiService.ts:**
   - Define all tools
   - Configure Bedrock connection
   - Implement tool handlers

3. **Build API Endpoints:**
   - `/api/ai/chat` - Main chat endpoint
   - `/api/ai/chat-ui` - Generative UI endpoint
   - `/api/ai/extract-receipt` - Image analysis

4. **Create Chat UI:**
   - Use `useChat` hook from Vercel AI SDK
   - Streaming responses
   - Tool call indicators

5. **Test Tool Calling:**
   - "Show me expenses from last week"
   - "I spent $50 on groceries"
   - "What's my budget status?"
