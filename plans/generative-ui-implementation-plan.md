# Generative UI Implementation Plan for ExpenseAI

## Overview
Implement Vercel Generative UI using the **current AI SDK UI** (not deprecated RSC) to render React components instead of plain text for AI responses, starting with the `getSpendingSummary` function.

## Critical Finding
AI SDK RSC development is **paused and deprecated**. Use AI SDK UI with `streamText`, `useChat`, and client-side component rendering based on tool outputs.

## Current Architecture
- **AI Implementation**: `generateText` with tools → plain text responses
- **Frontend**: Custom ChatInterface with fetch API → renders text messages
- **SDK Version**: AI SDK v6.0.39 (UI SDK)

## Target Architecture
- **AI Implementation**: `streamText` with tools → structured message parts
- **Frontend**: `useChat` hook → renders components based on tool outputs
- **Component Rendering**: Client-side based on `message.parts` analysis

---

## Implementation Phases

### Phase 1: Create Generative Components (Day 1)

#### 1.1 SpendingSummary Component
```typescript
// components/ai/SpendingSummary.tsx
interface SpendingSummaryProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  period: { start: string; end: string };
  currency: string;
}

export function SpendingSummary({
  totalIncome,
  totalExpense,
  netBalance,
  transactionCount,
  period,
  currency
}: SpendingSummaryProps) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
        <h3 className="font-semibold text-lg">Monthly Summary</h3>
      </div>

      {/* Income/Expense Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Income</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {currency}{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Expenses</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {currency}{totalExpense.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Net Balance */}
      <div className={`p-4 rounded-lg border ${
        netBalance >= 0
          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
          : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
      }`}>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Net Balance</p>
        <p className={`text-3xl font-bold ${
          netBalance >= 0
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-orange-700 dark:text-orange-300'
        }`}>
          {currency}{Math.abs(netBalance).toLocaleString()}
        </p>
      </div>

      {/* Period and Transaction Count */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
        </span>
        <span>{transactionCount} transactions</span>
      </div>
    </div>
  );
}
```

#### 1.2 CategoryBreakdown Component
```typescript
// components/ai/CategoryBreakdown.tsx
interface CategoryBreakdownProps {
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  currency: string;
}

export function CategoryBreakdown({ categories, currency }: CategoryBreakdownProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Category Breakdown</h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="font-medium">{category.name}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">{currency}{category.amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{category.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 2: Update AI Service for Streaming (Day 2)

#### 2.1 Create Tools Definition File
```typescript
// lib/ai/tools.ts
import { tool as createTool } from 'ai';
import { z } from 'zod';
import analyticsService from '@/lib/services/analyticsService';
import { getCurrencySymbol } from '@/lib/constants/currencies';

export const getSpendingSummaryTool = createTool({
  description: 'Get spending summary for a period (day/week/month/year). Returns income, expenses, net balance, and transaction count.',
  inputSchema: z.object({
    period: z.enum(['day', 'week', 'month', 'year']).default('month'),
    endDate: z.string().optional(),
  }),
  execute: async function ({ period, endDate }, { userId }) {
    console.log('[AI Tool] getSpendingSummary called with params:', { period, endDate });
    console.log('[AI Tool] userId:', userId);

    const summary = await analyticsService.getSummary(userId, {
      period,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Get user currency (simplified - should come from user preferences)
    const currency = '₹'; // getCurrencySymbol(userPreferences.currency);

    console.log('[AI Tool] getSpendingSummary result:', summary);

    return {
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      netBalance: summary.netBalance,
      transactionCount: summary.transactionCount,
      period: summary.period,
      currency,
    };
  },
});

export const getCategoryBreakdownTool = createTool({
  description: 'Get expense breakdown by category with percentages. Perfect for visualizing spending patterns.',
  inputSchema: z.object({
    type: z.enum(['expense', 'income']).default('expense'),
    period: z.enum(['day', 'week', 'month', 'year']).default('month'),
    endDate: z.string().optional(),
  }),
  execute: async function ({ type, period, endDate }, { userId }) {
    console.log('[AI Tool] getCategoryBreakdown called with params:', { type, period, endDate });

    const breakdown = await analyticsService.getCategoryBreakdown(userId, {
      type,
      period,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    const currency = '₹';

    return {
      categories: breakdown.map(item => ({
        name: item.category,
        amount: item.amount,
        percentage: item.percentage,
        color: item.color || '#8884d8', // Default color
      })),
      currency,
    };
  },
});

export const tools = {
  getSpendingSummary: getSpendingSummaryTool,
  getCategoryBreakdown: getCategoryBreakdownTool,
  // Add other tools as needed...
};
```

#### 2.2 Update API Route to Use streamText
```typescript
// app/api/ai/chat/route.ts
import { streamText, convertToModelMessages } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import ChatSession from '@/lib/db/models/ChatSession';
import { tools } from '@/lib/ai/tools';
import { getCurrencySymbol } from '@/lib/constants/currencies';

export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  console.log('\n========== AI CHAT REQUEST START ==========');

  const body = await request.json();
  const { messages } = body;

  console.log('[AI Chat] Request received');
  console.log('[AI Chat] userId:', request.userId);
  console.log('[AI Chat] messages count:', messages.length);

  // Get user preferences for currency
  const userCurrency = request.user.preferences?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(userCurrency);
  console.log('[AI Chat] User currency:', userCurrency, 'Symbol:', currencySymbol);

  // Get or create chat session
  let chatSession;
  if (body.sessionId) {
    chatSession = await ChatSession.findOne({
      _id: body.sessionId,
      userId: request.userId,
    });
  }

  if (!chatSession) {
    chatSession = await ChatSession.create({
      userId: request.userId,
      messages: [],
    });
    console.log('[AI Chat] New session created:', chatSession._id);
  }

  // Add user message to session
  const userMessage = messages[messages.length - 1];
  chatSession.messages.push({
    role: 'user',
    content: userMessage.content,
    timestamp: new Date(),
  });
  await chatSession.save();

  try {
    // Use streamText with tools for Generative UI
    const result = streamText({
      model: bedrock('anthropic.claude-3-sonnet-20240229-v1:0'),
      system: `You are a helpful AI assistant for ExpenseAI, an expense tracking application.
You help users log expenses, track spending, analyze budgets, and answer financial questions.

USER PREFERENCES:
- User's preferred currency: ${userCurrency} (${currencySymbol})
- ALWAYS use ${currencySymbol} when displaying monetary amounts in text
- Format all currency values with the ${currencySymbol} symbol

TOOL USAGE GUIDELINES:
- Use getSpendingSummary when users ask about spending, income, or financial overview
- Use getCategoryBreakdown when users want to see spending by category or breakdown
- Always call tools to get real data before responding
- Be conversational and provide actionable insights

Current date: ${new Date().toISOString().split('T')[0]}`,
      messages: await convertToModelMessages(messages),
      tools,
      maxSteps: 5,
    });

    // Convert to UI message stream response
    const streamResponse = result.toUIMessageStreamResponse();

    // Save assistant response to session (this will be handled differently with streaming)
    // For now, we'll save after the stream completes
    streamResponse.body?.getReader().read().then(() => {
      // This is a simplified approach - in production, you'd need to handle streaming completion
      ChatSession.findById(chatSession._id).then(session => {
        if (session) {
          session.messages.push({
            role: 'assistant',
            content: 'Response with components', // Simplified
            timestamp: new Date(),
          });
          session.save();
        }
      });
    });

    console.log('========== AI CHAT REQUEST END ==========\n');

    return streamResponse;
  } catch (error) {
    console.error('[AI Chat] ERROR in streamText:', error);
    console.log('========== AI CHAT REQUEST END (ERROR) ==========\n');

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

### Phase 3: Update Frontend for Component Rendering (Days 3-4)

#### 3.1 Update ChatInterface to Use useChat Hook
```typescript
// components/ai/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHistory } from './ChatHistory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, History, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpendingSummary } from './SpendingSummary';
import { CategoryBreakdown } from './CategoryBreakdown';

interface ToolCall {
  name: string;
  status: 'pending' | 'completed' | 'error';
}

interface ChatInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function ChatInterface({ open, onOpenChange, userId }: ChatInterfaceProps) {
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use AI SDK useChat hook for Generative UI
  const { messages, sendMessage, isLoading, error: chatError } = useChat({
    api: '/api/ai/chat',
    body: { userId, sessionId },
    onFinish: (message) => {
      // Handle completion if needed
      console.log('Message completed:', message);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Handle chat errors
  useEffect(() => {
    if (chatError) {
      setError(chatError.message);
    }
  }, [chatError]);

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading) return;

    setError(null);
    sendMessage({ text: input });
  };

  const handleRegenerate = async () => {
    if (messages.length < 2 || isLoading) return;

    // Remove last assistant message
    const newMessages = messages.slice(0, -1);
    // This is simplified - you'd need to handle regeneration properly
  };

  const handleSelectSession = (id: string) => {
    setSessionId(id);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setShowHistory(false);
  };

  // Render message parts based on type
  const renderMessagePart = (part: any, index: number) => {
    if (part.type === 'text') {
      return (
        <div key={index} className="prose prose-sm max-w-none">
          {part.text}
        </div>
      );
    }

    if (part.type === 'tool-getSpendingSummary') {
      if (part.state === 'input-available') {
        return (
          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading spending summary...
          </div>
        );
      }
      if (part.state === 'output-available') {
        return <SpendingSummary key={index} {...part.output} />;
      }
      if (part.state === 'output-error') {
        return (
          <div key={index} className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            Error loading spending summary: {part.errorText}
          </div>
        );
      }
    }

    if (part.type === 'tool-getCategoryBreakdown') {
      if (part.state === 'input-available') {
        return (
          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading category breakdown...
          </div>
        );
      }
      if (part.state === 'output-available') {
        return <CategoryBreakdown key={index} {...part.output} />;
      }
      if (part.state === 'output-error') {
        return (
          <div key={index} className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            Error loading category breakdown: {part.errorText}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col p-0 h-full transition-all duration-300",
          showHistory ? "w-full sm:max-w-4xl" : "w-full sm:max-w-2xl"
        )}
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b sm:px-6 sm:pt-6 sm:pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shrink-0 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg sm:text-xl">AI Assistant</SheetTitle>
              <SheetDescription className="text-xs truncate">
                Ask me anything about your finances
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="shrink-0"
            >
              {showHistory ? <X className="h-4 w-4" /> : <History className="h-4 w-4" />}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Chat History Sidebar */}
          {showHistory && (
            <>
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden" onClick={() => setShowHistory(false)} />
              <div className={cn(
                "absolute inset-y-0 left-0 w-full sm:w-80 md:relative md:w-80 lg:w-96",
                "border-r shrink-0 z-20 bg-background",
                "animate-in slide-in-from-left-full md:slide-in-from-left-0 duration-300"
              )}>
                <ChatHistory
                  currentSessionId={sessionId}
                  onSelectSession={handleSelectSession}
                  onNewChat={handleNewChat}
                />
              </div>
            </>
          )}

          {/* Main Chat Area */}
          <div className="flex flex-col flex-1 min-w-0 relative">
            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-2">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted mb-3 sm:mb-4">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">Start a conversation</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4 sm:mb-6">
                    I can help you track expenses, analyze spending, and show you visual summaries.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
                        "active:scale-95"
                      )}
                      onClick={() => handleSend("What did I spend this month?")}
                    >
                      Monthly spending
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
                        "active:scale-95"
                      )}
                      onClick={() => handleSend("Show me spending by category")}
                    >
                      Category breakdown
                    </Badge>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 mb-4",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}

                      <div className={cn(
                        "flex flex-col gap-2 max-w-[80%]",
                        message.role === 'user' ? 'items-end' : 'items-start'
                      )}>
                        {message.parts?.map((part, partIndex) => renderMessagePart(part, partIndex))}

                        {message.role === 'assistant' && index === messages.length - 1 && (
                          <div className="flex gap-1 text-xs text-muted-foreground">
                            <button
                              onClick={handleRegenerate}
                              className="hover:text-foreground transition-colors"
                              disabled={isLoading}
                            >
                              Regenerate
                            </button>
                          </div>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <span className="text-sm font-medium">You</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3 mb-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Thinking</span>
                        <span className="flex gap-0.5">
                          <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                          <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                          <span className="animate-bounce">.</span>
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
                  Error: {error}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t px-4 py-3 sm:px-6 sm:py-4">
              <ChatInput
                onSend={handleSend}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

### Phase 4: Testing and Polish (Day 5)

#### 4.1 Test Queries
- "What did I spend this month?" → Should render SpendingSummary component
- "Show me spending by category" → Should render CategoryBreakdown component
- "I spent $50 on lunch" → Should create transaction and show confirmation

#### 4.2 Add Error Boundaries
```typescript
// components/ai/ComponentErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export class ComponentErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to render component. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

#### 4.3 Performance Optimizations
- Lazy load components
- Memoize expensive calculations
- Add loading skeletons

---

## Key Technical Differences

| Aspect | Original Plan (Deprecated RSC) | Updated Plan (Current UI SDK) |
|--------|-------------------------------|-------------------------------|
| **API Function** | `streamUI` from `ai/rsc` | `streamText` from `ai` |
| **Response Format** | Direct JSX from server | Tool outputs as data objects |
| **Component Location** | Server-rendered components | Client-side component rendering |
| **Hook** | `useActions` | `useChat` |
| **Tool Return** | JSX elements | Plain data objects |
| **Message Structure** | Custom ReactNode | Typed `UIMessage` with parts |

---

## Implementation Checklist

- [ ] Create `SpendingSummary` and `CategoryBreakdown` components
- [ ] Create `lib/ai/tools.ts` with tool definitions
- [ ] Update `/api/ai/chat/route.ts` to use `streamText`
- [ ] Modify `ChatInterface` to use `useChat` hook
- [ ] Implement component rendering logic for tool outputs
- [ ] Add loading states and error handling
- [ ] Test with sample queries
- [ ] Add animations and polish
- [ ] Update documentation

---

## Benefits

✅ **Visual Richness**: Cards, colors, and layouts instead of plain text
✅ **Interactive**: Components can include buttons and drill-down features
✅ **Consistent**: Matches app's design system
✅ **Scalable**: Easy to add more generative components
✅ **Production-Ready**: Uses current Vercel recommendations
✅ **Fallback Support**: Text alternatives when components fail

This implementation follows Vercel's current AI SDK UI patterns and provides a solid foundation for generative UI in ExpenseAI.</content>
</xai:function_call">### Phase 1: Create Generative Components (Day 1)

#### 1.1 SpendingSummary Component
```typescript
// components/ai/SpendingSummary.tsx
interface SpendingSummaryProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  period: { start: string; end: string };
  currency: string;
}

export function SpendingSummary({
  totalIncome,
  totalExpense,
  netBalance,
  transactionCount,
  period,
  currency
}: SpendingSummaryProps) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
        <h3 className="font-semibold text-lg">Monthly Summary</h3>
      </div>

      {/* Income/Expense Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Income</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {currency}{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Expenses</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {currency}{totalExpense.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Net Balance */}
      <div className={`p-4 rounded-lg border ${
        netBalance >= 0
          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
          : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
      }`}>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Net Balance</p>
        <p className={`text-3xl font-bold ${
          netBalance >= 0
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-orange-700 dark:text-orange-300'
        }`}>
          {currency}{Math.abs(netBalance).toLocaleString()}
        </p>
      </div>

      {/* Period and Transaction Count */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
        </span>
        <span>{transactionCount} transactions</span>
      </div>
    </div>
  );
}
```

#### 1.2 CategoryBreakdown Component
```typescript
// components/ai/CategoryBreakdown.tsx
interface CategoryBreakdownProps {
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  currency: string;
}

export function CategoryBreakdown({ categories, currency }: CategoryBreakdownProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Category Breakdown</h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="font-medium">{category.name}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">{currency}{category.amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{category.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 2: Update AI Service for Streaming (Day 2)

#### 2.1 Create Tools Definition File
```typescript
// lib/ai/tools.ts
import { tool as createTool } from 'ai';
import { z } from 'zod';
import analyticsService from '@/lib/services/analyticsService';
import { getCurrencySymbol } from '@/lib/constants/currencies';

export const getSpendingSummaryTool = createTool({
  description: 'Get spending summary for a period (day/week/month/year). Returns income, expenses, net balance, and transaction count.',
  inputSchema: z.object({
    period: z.enum(['day', 'week', 'month', 'year']).default('month'),
    endDate: z.string().optional(),
  }),
  execute: async function ({ period, endDate }, { userId }) {
    console.log('[AI Tool] getSpendingSummary called with params:', { period, endDate });
    console.log('[AI Tool] userId:', userId);

    const summary = await analyticsService.getSummary(userId, {
      period,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Get user currency (simplified - should come from user preferences)
    const currency = '₹'; // getCurrencySymbol(userPreferences.currency);

    console.log('[AI Tool] getSpendingSummary result:', summary);

    return {
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      netBalance: summary.netBalance,
      transactionCount: summary.transactionCount,
      period: summary.period,
      currency,
    };
  },
});

export const getCategoryBreakdownTool = createTool({
  description: 'Get expense breakdown by category with percentages. Perfect for visualizing spending patterns.',
  inputSchema: z.object({
    type: z.enum(['expense', 'income']).default('expense'),
    period: z.enum(['day', 'week', 'month', 'year']).default('month'),
    endDate: z.string().optional(),
  }),
  execute: async function ({ type, period, endDate }, { userId }) {
    console.log('[AI Tool] getCategoryBreakdown called with params:', { type, period, endDate });

    const breakdown = await analyticsService.getCategoryBreakdown(userId, {
      type,
      period,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    const currency = '₹';

    return {
      categories: breakdown.map(item => ({
        name: item.category,
        amount: item.amount,
        percentage: item.percentage,
        color: item.color || '#8884d8', // Default color
      })),
      currency,
    };
  },
});

export const tools = {
  getSpendingSummary: getSpendingSummaryTool,
  getCategoryBreakdown: getCategoryBreakdownTool,
  // Add other tools as needed...
};
```

#### 2.2 Update API Route to Use streamText
```typescript
// app/api/ai/chat/route.ts
import { streamText, convertToModelMessages } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import ChatSession from '@/lib/db/models/ChatSession';
import { tools } from '@/lib/ai/tools';
import { getCurrencySymbol } from '@/lib/constants/currencies';

export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  console.log('\n========== AI CHAT REQUEST START ==========');

  const body = await request.json();
  const { messages } = body;

  console.log('[AI Chat] Request received');
  console.log('[AI Chat] userId:', request.userId);
  console.log('[AI Chat] messages count:', messages.length);

  // Get user preferences for currency
  const userCurrency = request.user.preferences?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(userCurrency);
  console.log('[AI Chat] User currency:', userCurrency, 'Symbol:', currencySymbol);

  // Get or create chat session
  let chatSession;
  if (body.sessionId) {
    chatSession = await ChatSession.findOne({
      _id: body.sessionId,
      userId: request.userId,
    });
  }

  if (!chatSession) {
    chatSession = await ChatSession.create({
      userId: request.userId,
      messages: [],
    });
    console.log('[AI Chat] New session created:', chatSession._id);
  }

  // Add user message to session
  const userMessage = messages[messages.length - 1];
  chatSession.messages.push({
    role: 'user',
    content: userMessage.content,
    timestamp: new Date(),
  });
  await chatSession.save();

  try {
    // Use streamText with tools for Generative UI
    const result = streamText({
      model: bedrock('anthropic.claude-3-sonnet-20240229-v1:0'),
      system: `You are a helpful AI assistant for ExpenseAI, an expense tracking application.
You help users log expenses, track spending, analyze budgets, and answer financial questions.

USER PREFERENCES:
- User's preferred currency: ${userCurrency} (${currencySymbol})
- ALWAYS use ${currencySymbol} when displaying monetary amounts in text
- Format all currency values with the ${currencySymbol} symbol

TOOL USAGE GUIDELINES:
- Use getSpendingSummary when users ask about spending, income, or financial overview
- Use getCategoryBreakdown when users want to see spending by category or breakdown
- Always call tools to get real data before responding
- Be conversational and provide actionable insights

Current date: ${new Date().toISOString().split('T')[0]}`,
      messages: await convertToModelMessages(messages),
      tools,
      maxSteps: 5,
    });

    // Convert to UI message stream response
    const streamResponse = result.toUIMessageStreamResponse();

    // Save assistant response to session (this will be handled differently with streaming)
    // For now, we'll save after the stream completes
    streamResponse.body?.getReader().read().then(() => {
      // This is a simplified approach - in production, you'd need to handle streaming completion
      ChatSession.findById(chatSession._id).then(session => {
        if (session) {
          session.messages.push({
            role: 'assistant',
            content: 'Response with components', // Simplified
            timestamp: new Date(),
          });
          session.save();
        }
      });
    });

    console.log('========== AI CHAT REQUEST END ==========\n');

    return streamResponse;
  } catch (error) {
    console.error('[AI Chat] ERROR in streamText:', error);
    console.log('========== AI CHAT REQUEST END (ERROR) ==========\n');

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

### Phase 3: Update Frontend for Component Rendering (Days 3-4)

#### 3.1 Update ChatInterface to Use useChat Hook
```typescript
// components/ai/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHistory } from './ChatHistory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, History, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpendingSummary } from './SpendingSummary';
import { CategoryBreakdown } from './CategoryBreakdown';

interface ToolCall {
  name: string;
  status: 'pending' | 'completed' | 'error';
}

interface ChatInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function ChatInterface({ open, onOpenChange, userId }: ChatInterfaceProps) {
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use AI SDK useChat hook for Generative UI
  const { messages, sendMessage, isLoading, error: chatError } = useChat({
    api: '/api/ai/chat',
    body: { userId, sessionId },
    onFinish: (message) => {
      // Handle completion if needed
      console.log('Message completed:', message);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Handle chat errors
  useEffect(() => {
    if (chatError) {
      setError(chatError.message);
    }
  }, [chatError]);

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading) return;

    setError(null);
    sendMessage({ text: input });
  };

  const handleRegenerate = async () => {
    if (messages.length < 2 || isLoading) return;

    // Remove last assistant message
    const newMessages = messages.slice(0, -1);
    // This is simplified - you'd need to handle regeneration properly
  };

  const handleSelectSession = (id: string) => {
    setSessionId(id);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setShowHistory(false);
  };

  // Render message parts based on type
  const renderMessagePart = (part: any, index: number) => {
    if (part.type === 'text') {
      return (
        <div key={index} className="prose prose-sm max-w-none">
          {part.text}
        </div>
      );
    }

    if (part.type === 'tool-getSpendingSummary') {
      if (part.state === 'input-available') {
        return (
          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading spending summary...
          </div>
        );
      }
      if (part.state === 'output-available') {
        return <SpendingSummary key={index} {...part.output} />;
      }
      if (part.state === 'output-error') {
        return (
          <div key={index} className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            Error loading spending summary: {part.errorText}
          </div>
        );
      }
    }

    if (part.type === 'tool-getCategoryBreakdown') {
      if (part.state === 'input-available') {
        return (
          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading category breakdown...
          </div>
        );
      }
      if (part.state === 'output-available') {
        return <CategoryBreakdown key={index} {...part.output} />;
      }
      if (part.state === 'output-error') {
        return (
          <div key={index} className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            Error loading category breakdown: {part.errorText}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col p-0 h-full transition-all duration-300",
          showHistory ? "w-full sm:max-w-4xl" : "w-full sm:max-w-2xl"
        )}
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b sm:px-6 sm:pt-6 sm:pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shrink-0 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg sm:text-xl">AI Assistant</SheetTitle>
              <SheetDescription className="text-xs truncate">
                Ask me anything about your finances
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="shrink-0"
            >
              {showHistory ? <X className="h-4 w-4" /> : <History className="h-4 w-4" />}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Chat History Sidebar */}
          {showHistory && (
            <>
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden" onClick={() => setShowHistory(false)} />
              <div className={cn(
                "absolute inset-y-0 left-0 w-full sm:w-80 md:relative md:w-80 lg:w-96",
                "border-r shrink-0 z-20 bg-background",
                "animate-in slide-in-from-left-full md:slide-in-from-left-0 duration-300"
              )}>
                <ChatHistory
                  currentSessionId={sessionId}
                  onSelectSession={handleSelectSession}
                  onNewChat={handleNewChat}
                />
              </div>
            </>
          )}

          {/* Main Chat Area */}
          <div className="flex flex-col flex-1 min-w-0 relative">
            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-2">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted mb-3 sm:mb-4">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">Start a conversation</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4 sm:mb-6">
                    I can help you track expenses, analyze spending, and show you visual summaries.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
                        "active:scale-95"
                      )}
                      onClick={() => handleSend("What did I spend this month?")}
                    >
                      Monthly spending
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
                        "active:scale-95"
                      )}
                      onClick={() => handleSend("Show me spending by category")}
                    >
                      Category breakdown
                    </Badge>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 mb-4",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}

                      <div className={cn(
                        "flex flex-col gap-2 max-w-[80%]",
                        message.role === 'user' ? 'items-end' : 'items-start'
                      )}>
                        {message.parts?.map((part, partIndex) => renderMessagePart(part, partIndex))}

                        {message.role === 'assistant' && index === messages.length - 1 && (
                          <div className="flex gap-1 text-xs text-muted-foreground">
                            <button
                              onClick={handleRegenerate}
                              className="hover:text-foreground transition-colors"
                              disabled={isLoading}
                            >
                              Regenerate
                            </button>
                          </div>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <span className="text-sm font-medium">You</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3 mb-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Thinking</span>
                        <span className="flex gap-0.5">
                          <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                          <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                          <span className="animate-bounce">.</span>
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
                  Error: {error}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t px-4 py-3 sm:px-6 sm:py-4">
              <ChatInput
                onSend={handleSend}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

### Phase 4: Testing and Polish (Day 5)

#### 4.1 Test Queries
- "What did I spend this month?" → Should render SpendingSummary component
- "Show me spending by category" → Should render CategoryBreakdown component
- "I spent $50 on lunch" → Should create transaction and show confirmation

#### 4.2 Add Error Boundaries
```typescript
// components/ai/ComponentErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export class ComponentErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to render component. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

#### 4.3 Performance Optimizations
- Lazy load components
- Memoize expensive calculations
- Add loading skeletons

---

## Key Technical Differences

| Aspect | Original Plan (Deprecated RSC) | Updated Plan (Current UI SDK) |
|--------|-------------------------------|-------------------------------|
| **API Function** | `streamUI` from `ai/rsc` | `streamText` from `ai` |
| **Response Format** | Direct JSX from server | Tool outputs as data objects |
| **Component Location** | Server-rendered components | Client-side component rendering |
| **Hook** | `useActions` | `useChat` |
| **Tool Return** | JSX elements | Plain data objects |
| **Message Structure** | Custom ReactNode | Typed `UIMessage` with parts |

---

## Implementation Checklist

- [ ] Create `SpendingSummary` and `CategoryBreakdown` components
- [ ] Create `lib/ai/tools.ts` with tool definitions
- [ ] Update `/api/ai/chat/route.ts` to use `streamText`
- [ ] Modify `ChatInterface` to use `useChat` hook
- [ ] Implement component rendering logic for tool outputs
- [ ] Add loading states and error handling
- [ ] Test with sample queries
- [ ] Add animations and polish
- [ ] Update documentation

---

## Benefits

✅ **Visual Richness**: Cards, colors, and layouts instead of plain text
✅ **Interactive**: Components can include buttons and drill-down features
✅ **Consistent**: Matches app's design system
✅ **Scalable**: Easy to add more generative components
✅ **Production-Ready**: Uses current Vercel recommendations
✅ **Fallback Support**: Text alternatives when components fail

This implementation follows Vercel's current AI SDK UI patterns and provides a solid foundation for generative UI in ExpenseAI.