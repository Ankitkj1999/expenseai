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

#### 6. **chat_sessions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  messages: [{
    role: String, // "user" or "assistant"
    content: String,
    timestamp: Date,
    metadata: {
      transactionIds: [ObjectId], // linked transactions
      actionType: String // "log_expense", "query", "analysis"
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

### AI Features
- `POST /api/ai/chat` - Send message to AI assistant
- `POST /api/ai/speech-to-text` - Convert speech to transaction
- `POST /api/ai/extract-receipt` - Extract data from receipt image
- `POST /api/ai/parse-transaction` - Parse natural language to transaction

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
- Gemini API integration
- Natural language processing for expense logging
- Receipt image analysis
- Chat context management
- Speech-to-text processing

### 4. **analyticsService**
- Generate spending insights
- Calculate trends
- Period comparisons
- Budget tracking

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

### 8. **exportService**
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
│   │   ├── ai/
│   │   │   ├── chat/route.ts
│   │   │   ├── speech-to-text/route.ts
│   │   │   ├── extract-receipt/route.ts
│   │   │   └── parse-transaction/route.ts
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
│   │       └── ChatSession.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── aiService.ts
│   │   ├── analyticsService.ts
│   │   ├── accountService.ts
│   │   ├── categoryService.ts
│   │   ├── budgetService.ts
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
- **Authentication**: NextAuth.js or JWT
- **AI**: Google Gemini SDK (gemini-2.0-flash, gemini-2.5-flash)
- **Validation**: Zod
- **API**: Next.js API Routes

---

## Implementation Priority

### Phase 1: Core Features
1. Database setup & models
2. Authentication system
3. Account management
4. Basic transaction CRUD
5. Categories (with defaults)

### Phase 2: AI Integration
1. AI service setup (Gemini)
2. Natural language transaction parsing
3. AI chat interface
4. Speech-to-text

### Phase 3: Advanced Features
1. Analytics & insights
2. Budgets
3. Receipt image extraction
4. Import/Export

### Phase 4: Polish
1. Optimization
2. Error handling
3. Testing
4. PWA features

---

## Key Design Decisions

1. **MongoDB over SQL**: Flexible schema for AI-generated data, easier to iterate
2. **Next.js API Routes**: Simplified full-stack development, single codebase
3. **Gemini Direct Integration**: No LangChain - simpler for straightforward use cases
4. **User-owned Categories**: Flexibility for custom expense categories
5. **Transfer as Transaction Type**: Simplifies account balance tracking
6. **Chat Sessions**: Maintain context for conversational AI interactions
7. **Extensible Schema**: Metadata fields for future features

---

## Environment Variables

```
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_GEMINI_API_KEY=
JWT_SECRET=
```
