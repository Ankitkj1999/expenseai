# AI Integration Guide - ExpenseAI

## Overview
ExpenseAI uses AWS Bedrock (Claude) with Vercel AI SDK for intelligent expense tracking through natural language conversations and tool calling.

---

## Architecture

### Tool-Based Pattern
Instead of manually injecting context, the AI decides when to query data:

```
User: "How much did I spend on food last month?"
  ↓
AI analyzes query
  ↓
AI calls tool: getSpendingSummary({ period: 'month' })
  ↓
Tool queries MongoDB
  ↓
Returns data to AI
  ↓
AI: "You spent $500 on food last month"
```

---

## Installation

### 1. Install Dependencies
```bash
npm install ai @ai-sdk/amazon-bedrock zod
```

### 2. Configure AWS Credentials
Add to `.env`:
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

---

## Available AI Tools

### 1. getTransactions
**Description:** Query transactions with filters
**Parameters:**
- `type?`: 'expense' | 'income' | 'transfer'
- `categoryId?`: string
- `accountId?`: string
- `startDate?`: string (ISO 8601)
- `endDate?`: string (ISO 8601)
- `limit?`: number (default: 50)

**Use Cases:**
- "Show me my expenses from last week"
- "What did I spend on groceries?"
- "List all my income transactions"

### 2. createTransaction
**Description:** Create expense, income, or transfer
**Parameters:**
- `type`: 'expense' | 'income' | 'transfer'
- `amount`: number
- `description`: string
- `accountId`: string
- `toAccountId?`: string (for transfers)
- `categoryId?`: string
- `date?`: string (ISO 8601)
- `tags?`: string[]
- `metadata?`: { location?, notes? }

**Use Cases:**
- "I spent $50 on lunch"
- "Log $1000 salary income"
- "Transfer $200 from checking to savings"

### 3. getSpendingSummary
**Description:** Get income/expense summary for a period
**Parameters:**
- `period?`: 'today' | 'week' | 'month' | 'year' | 'custom' (default: 'month')
- `startDate?`: string (for custom period)
- `endDate?`: string (for custom period)

**Use Cases:**
- "What's my spending this month?"
- "How much did I earn last year?"
- "Show me my financial summary"

### 4. getCategoryBreakdown
**Description:** Category-wise spending/income analysis
**Parameters:**
- `type?`: 'expense' | 'income' (default: 'expense')
- `period?`: 'today' | 'week' | 'month' | 'year' | 'custom' (default: 'month')
- `startDate?`: string (for custom period)
- `endDate?`: string (for custom period)

**Use Cases:**
- "Where is my money going?"
- "Show me spending by category"
- "What are my top expense categories?"

### 5. getBudgetStatus
**Description:** Check budget usage and alerts
**Parameters:**
- `budgetId?`: string (optional, returns all if not provided)

**Use Cases:**
- "Am I over budget?"
- "How much budget do I have left?"
- "Check my grocery budget"

---

## Implementation

### Complete the Chat Endpoint

Edit [`app/api/ai/chat/route.ts`](app/api/ai/chat/route.ts):

```typescript
import { streamText } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { tools } from '@/lib/services/aiService';

export async function POST(req: NextRequest) {
  const authResult = await authenticate(req);
  // ... authentication code ...

  const body = await req.json();
  const { messages } = body;

  // Call Vercel AI SDK with tools
  const result = await streamText({
    model: bedrock('amazon.nova-pro-v1:0'),
    messages,
    tools: {
      getTransactions: {
        description: tools.getTransactions.description,
        parameters: tools.getTransactions.parameters,
        execute: async (params) => 
          tools.getTransactions.execute(params, authResult.userId),
      },
      createTransaction: {
        description: tools.createTransaction.description,
        parameters: tools.createTransaction.parameters,
        execute: async (params) => 
          tools.createTransaction.execute(params, authResult.userId),
      },
      getSpendingSummary: {
        description: tools.getSpendingSummary.description,
        parameters: tools.getSpendingSummary.parameters,
        execute: async (params) => 
          tools.getSpendingSummary.execute(params, authResult.userId),
      },
      getCategoryBreakdown: {
        description: tools.getCategoryBreakdown.description,
        parameters: tools.getCategoryBreakdown.parameters,
        execute: async (params) => 
          tools.getCategoryBreakdown.execute(params, authResult.userId),
      },
      getBudgetStatus: {
        description: tools.getBudgetStatus.description,
        parameters: tools.getBudgetStatus.parameters,
        execute: async (params) => 
          tools.getBudgetStatus.execute(params, authResult.userId),
      },
    },
  });

  // Stream response back to client
  return result.toDataStreamResponse();
}
```

---

## Frontend Integration

### Using Vercel AI SDK UI Hooks

```typescript
'use client';

import { useChat } from 'ai/react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/ai/chat',
  });

  return (
    <div>
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={m.role}>
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your expenses..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

---

## Example Conversations

### 1. Logging Expenses
```
User: "I spent $45 on groceries at Walmart"
AI: [Calls createTransaction tool]
AI: "I've logged your $45 grocery expense. Your remaining grocery budget is $155."
```

### 2. Querying Spending
```
User: "How much did I spend on food last week?"
AI: [Calls getTransactions with filters]
AI: "You spent $230 on food last week across 8 transactions."
```

### 3. Budget Check
```
User: "Am I over budget this month?"
AI: [Calls getBudgetStatus]
AI: "You're at 85% of your monthly budget ($4,250 of $5,000). You have $750 remaining."
```

### 4. Category Analysis
```
User: "Where is most of my money going?"
AI: [Calls getCategoryBreakdown]
AI: "Your top spending categories are:
1. Food & Dining: $1,200 (40%)
2. Transportation: $800 (27%)
3. Entertainment: $500 (17%)"
```

---

## Security Model

✅ **AI Never Has Direct DB Access**
- All queries go through service layer
- userId is injected by middleware (AI can't fake it)
- Tool parameters are validated with Zod schemas

✅ **Rate Limiting**
- Implement rate limiting on `/api/ai/chat`
- Prevent abuse and control costs

✅ **Input Validation**
- All tool parameters validated before execution
- Type-safe with TypeScript + Zod

---

## Data Flow

```
┌─────────────────────┐
│ User: "I spent $50  │
│ on lunch"           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│ POST /api/ai/chat       │
│ (Vercel AI SDK)         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ AWS Bedrock Claude      │
│ Analyzes message        │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ AI decides to call:     │
│ createTransaction       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Tool validates params   │
│ (Zod schema)            │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ transactionService      │
│ .createTransaction()    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ MongoDB Insert          │
│ Update account balance  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Return to AI            │
│ "Transaction created"   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ AI: "I've logged your   │
│ $50 lunch expense"      │
└─────────────────────────┘
```

---

## Files Created

1. [`lib/db/models/ChatSession.ts`](lib/db/models/ChatSession.ts) - Chat session storage
2. [`lib/services/aiService.ts`](lib/services/aiService.ts) - Tool definitions
3. [`app/api/ai/chat/route.ts`](app/api/ai/chat/route.ts) - Chat endpoint (placeholder)

---

## Next Steps

1. **Install Dependencies:**
   ```bash
   npm install ai @ai-sdk/amazon-bedrock zod
   ```

2. **Configure AWS:**
   - Set up AWS Bedrock access
   - Add credentials to `.env`

3. **Complete Chat Endpoint:**
   - Uncomment AI SDK code in `chat/route.ts`
   - Test with simple queries

4. **Build Chat UI:**
   - Create chat interface component
   - Use `useChat` hook from Vercel AI SDK
   - Add streaming support

5. **Test Tool Calling:**
   - "Show me expenses from last week"
   - "I spent $50 on groceries"
   - "What's my budget status?"

6. **Add Advanced Features:**
   - Generative UI (charts in chat)
   - Receipt image extraction
   - Speech-to-text
   - Natural language date parsing

---

## Cost Optimization

- Use Claude 3.5 Sonnet for balance of cost/quality
- Implement caching for repeated queries
- Rate limit API calls
- Consider using Claude 3 Haiku for simple queries

---

## Testing

### Test Tool Execution
```typescript
import { tools } from '@/lib/services/aiService';

// Test getSpendingSummary
const result = await tools.getSpendingSummary.execute(
  { period: 'month' },
  'user-id-here'
);
console.log(result);
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "messages": [
      { "role": "user", "content": "How much did I spend this month?" }
    ]
  }'
```

---

## Troubleshooting

### Issue: "Module not found: ai"
**Solution:** Install dependencies: `npm install ai @ai-sdk/amazon-bedrock`

### Issue: "AWS credentials not configured"
**Solution:** Add AWS credentials to `.env` file

### Issue: "Tool not being called"
**Solution:** Check tool description - make it clear when to use the tool

### Issue: "Type errors in tool execution"
**Solution:** Ensure Zod schemas match function parameters

---

## Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [AWS Bedrock Models](https://aws.amazon.com/bedrock/claude/)
- [Zod Documentation](https://zod.dev/)
- [Tool Calling Guide](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
