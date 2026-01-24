import { streamText, generateText, stepCountIs } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import ChatSession from '@/lib/db/models/ChatSession';
import { tools } from '@/lib/services/aiService';
import { getCurrencySymbol } from '@/lib/constants/currencies';
import { z } from 'zod';

// Validation schema for chat request
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1, 'Message content is required').max(10000, 'Message too long'),
    })
  ).min(1, 'At least one message is required').max(50, 'Too many messages in request'),
  sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid session ID format').optional(),
});

/**
 * POST /api/ai/chat
 * Main AI chat endpoint with tool calling using AWS Bedrock Claude
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  console.log('\n========== AI CHAT REQUEST START ==========');
  const body = await request.json();

  // Validate request body
  const validation = chatRequestSchema.safeParse(body);
  if (!validation.success) {
    console.log('[AI Chat] ERROR: Validation failed', validation.error.issues);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const { messages, sessionId } = validation.data;

  console.log('[AI Chat] Request received');
  console.log('[AI Chat] userId:', request.userId);
  console.log('[AI Chat] sessionId:', sessionId);
  console.log('[AI Chat] messages count:', messages.length);
  console.log('[AI Chat] last message:', messages[messages.length - 1]);

  // Get user preferences for currency from middleware (no DB query needed)
  const userCurrency = request.user.preferences?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(userCurrency);
  console.log('[AI Chat] User currency:', userCurrency, 'Symbol:', currencySymbol);

  // Get or create chat session
  let chatSession;
  if (sessionId) {
    chatSession = await ChatSession.findOne({
      _id: sessionId,
      userId: request.userId,
    });
    console.log('[AI Chat] Existing session found:', !!chatSession);
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
  console.log('[AI Chat] User message saved to session');

  // Define tools with proper typing and error handling
  const aiTools = {
    getTransactions: {
      description: tools.getTransactions.description,
      inputSchema: tools.getTransactions.parameters,
      execute: async (params: z.infer<typeof tools.getTransactions.parameters>) => {
        try {
          console.log('[AI Chat] Executing getTransactions tool');
          const result = await tools.getTransactions.execute(params, request.userId);
          console.log('[AI Chat] getTransactions completed successfully');

          if (result.success && result.transactions) {
            return {
              transactions: result.transactions,
              count: result.count,
              currency: currencySymbol,
            };
          }
          return result;
        } catch (error) {
          console.error('[AI Chat] ERROR in getTransactions:', error);
          throw error;
        }
      },
    },
    createTransaction: {
      description: tools.createTransaction.description,
      inputSchema: tools.createTransaction.parameters,
      execute: async (params: z.infer<typeof tools.createTransaction.parameters>) => {
        try {
          console.log('[AI Chat] Executing createTransaction tool');
          const result = await tools.createTransaction.execute(params, request.userId);
          console.log('[AI Chat] createTransaction completed successfully');
          return result;
        } catch (error) {
          console.error('[AI Chat] ERROR in createTransaction:', error);
          // Return a helpful error message instead of throwing
          if (error instanceof Error) {
            if (error.message.includes('Account not found')) {
              return {
                success: false,
                error: 'Account not found. Please call getAccounts first to get valid account IDs, then retry with a valid accountId.',
              };
            }
            if (error.message.includes('Category not found')) {
              return {
                success: false,
                error: 'Category not found. Please call getCategories first to get valid category IDs, then retry with a valid categoryId.',
              };
            }
            return {
              success: false,
              error: error.message,
            };
          }
          throw error;
        }
      },
    },
    getSpendingSummary: {
      description: tools.getSpendingSummary.description,
      inputSchema: tools.getSpendingSummary.parameters,
      execute: async (params: z.infer<typeof tools.getSpendingSummary.parameters>) => {
        try {
          console.log('[AI Chat] Executing getSpendingSummary tool');
          const result = await tools.getSpendingSummary.execute(params, request.userId);
          console.log('[AI Chat] getSpendingSummary completed successfully');

          // Transform the result to match SpendingSummary component props
          if (result.success && result.summary) {
            return {
              totalIncome: result.summary.totalIncome || 0,
              totalExpense: result.summary.totalExpense || 0,
              netBalance: result.summary.netBalance || 0,
              transactionCount: result.summary.transactionCount || 0,
              period: result.summary.period || { start: new Date().toISOString(), end: new Date().toISOString() },
              currency: currencySymbol,
            };
          }
          return result;
        } catch (error) {
          console.error('[AI Chat] ERROR in getSpendingSummary:', error);
          throw error;
        }
      },
    },
    getCategoryBreakdown: {
      description: tools.getCategoryBreakdown.description,
      inputSchema: tools.getCategoryBreakdown.parameters,
      execute: async (params: z.infer<typeof tools.getCategoryBreakdown.parameters>) => {
        try {
          console.log('[AI Chat] Executing getCategoryBreakdown tool');
          const result = await tools.getCategoryBreakdown.execute(params, request.userId);
          console.log('[AI Chat] getCategoryBreakdown completed successfully');

          // Transform the result to match CategoryBreakdown component props
          if (result.success && result.breakdown) {
            return {
              categories: result.breakdown.map((item: { categoryName: string; amount: number; percentage: number; color?: string }) => ({
                name: item.categoryName,
                amount: item.amount,
                percentage: Math.round(item.percentage),
                color: item.color || '#8884d8',
              })),
              currency: currencySymbol,
            };
          }
          return result;
        } catch (error) {
          console.error('[AI Chat] ERROR in getCategoryBreakdown:', error);
          throw error;
        }
      },
    },
    getBudgetStatus: {
      description: tools.getBudgetStatus.description,
      inputSchema: tools.getBudgetStatus.parameters,
      execute: async (params: z.infer<typeof tools.getBudgetStatus.parameters>) => {
        try {
          console.log('[AI Chat] Executing getBudgetStatus tool');
          const result = await tools.getBudgetStatus.execute(params, request.userId);
          console.log('[AI Chat] getBudgetStatus completed successfully');

          if (result.success) {
            // If it returned a list of budgets (no budgetId param)
            if (result.budgets) {
              return {
                budgets: result.budgets,
                count: result.count,
                currency: currencySymbol,
              };
            }
            // If it returned a single budget (budgetId param)
            if (result.status) {
              return {
                budgets: [result.status],
                count: 1,
                currency: currencySymbol,
              };
            }
          }
          return result;
        } catch (error) {
          console.error('[AI Chat] ERROR in getBudgetStatus:', error);
          throw error;
        }
      },
    },
    getAccounts: {
      description: tools.getAccounts.description,
      inputSchema: tools.getAccounts.parameters,
      execute: async (params: z.infer<typeof tools.getAccounts.parameters>) => {
        try {
          console.log('[AI Chat] Executing getAccounts tool');
          const result = await tools.getAccounts.execute(params, request.userId);
          console.log('[AI Chat] getAccounts completed successfully');

          if (result.success && result.accounts) {
            return {
              accounts: result.accounts,
              count: result.count,
              currency: currencySymbol,
            };
          }
          return result;
        } catch (error) {
          console.error('[AI Chat] ERROR in getAccounts:', error);
          throw error;
        }
      },
    },
    getCategories: {
      description: tools.getCategories.description,
      inputSchema: tools.getCategories.parameters,
      execute: async (params: z.infer<typeof tools.getCategories.parameters>) => {
        try {
          console.log('[AI Chat] Executing getCategories tool');
          const result = await tools.getCategories.execute(params, request.userId);
          console.log('[AI Chat] getCategories completed successfully');
          return result;
        } catch (error) {
          console.error('[AI Chat] ERROR in getCategories:', error);
          throw error;
        }
      },
    },
  };

  console.log('[AI Chat] Tools configured:', Object.keys(aiTools));

  // Call Vercel AI SDK with AWS Bedrock Claude using streamText for Generative UI
  console.log('[AI Chat] Calling Bedrock Claude with streamText for Generative UI...');

  try {
    // Use streamText with tools for Generative UI
    const result = streamText({
      model: bedrock('anthropic.claude-3-sonnet-20240229-v1:0'),
      messages,
      system: `You are a helpful AI assistant for ExpenseAI, an expense tracking application.
You help users log expenses, track spending, analyze budgets, and answer financial questions.

USER PREFERENCES:
- User's preferred currency: ${userCurrency} (${currencySymbol})
- ALWAYS use ${currencySymbol} when displaying monetary amounts
- Format all currency values with the ${currencySymbol} symbol (e.g., ${currencySymbol}100.00)

CRITICAL BUDGET TOOL USAGE:
- When users ask about budgets or budget status, call getBudgetStatus WITHOUT any parameters
- DO NOT pass a budgetId parameter unless the user explicitly provides a specific budget ID
- DO NOT make up or guess budget IDs - only use IDs returned from previous tool calls
- If getBudgetStatus returns empty budgets array, then suggest creating budgets
- If getBudgetStatus returns budgets, present them with spending details

TRANSACTION CREATION WORKFLOW:
1. First call getAccounts to get valid account IDs (MongoDB ObjectIDs, 24-character hex strings)
2. Then call getCategories to get valid category IDs (MongoDB ObjectIDs, 24-character hex strings)
3. Then use createTransaction with valid IDs from those lists
4. Use the first available account if the user doesn't specify one
5. Match the category to the transaction type (e.g., "Food & Dining" or "Groceries" for grocery expenses)
6. NEVER make up or guess account/category IDs - only use IDs from getAccounts/getCategories

GENERATIVE UI TOOL USAGE:
- When users ask about spending summaries (e.g., "What did I spend this month?"), use getSpendingSummary
- When users ask about category breakdowns (e.g., "Show spending by category"), use getCategoryBreakdown
- These tools will render beautiful visual components automatically
- After calling these tools, provide a brief natural language summary of the key insights

GENERAL TOOL USAGE:
- ALWAYS use tools to fetch real data before responding
- NEVER assume data doesn't exist - check first using appropriate tools
- After using a tool, explain the results in natural language
- Be conversational, friendly, and provide actionable insights
- Present numbers with proper formatting using ${currencySymbol} for currency and percentages where appropriate

Current date: ${new Date().toISOString().split('T')[0]}`,
      tools: aiTools,
      stopWhen: stepCountIs(5), // Allow up to 5 steps to continue after tool calls
    });

    console.log('[AI Chat] streamText initiated');

    // Convert to UI message stream response for generative UI
    const streamResponse = result.toUIMessageStreamResponse();

    // Add session ID to headers so client can track it
    streamResponse.headers.set('X-Session-Id', chatSession._id.toString());

    // Save assistant response to session asynchronously (don't await to avoid blocking stream)
    result.text.then((responseText) => {
      if (responseText && responseText.trim()) {
        ChatSession.findById(chatSession._id).then(session => {
          if (session) {
            session.messages.push({
              role: 'assistant',
              content: responseText,
              timestamp: new Date(),
            });
            session.save().then(() => {
              console.log('[AI Chat] Assistant message saved to session');
            }).catch((error: Error) => {
              console.error('[AI Chat] Error saving assistant message:', error);
            });
          }
        }).catch((error: Error) => {
          console.error('[AI Chat] Error finding session:', error);
        });
      }
    });

    console.log('========== AI CHAT REQUEST END (STREAMING) ==========\n');

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
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

/**
 * DELETE /api/ai/chat
 * Delete a chat session
 */
export const DELETE = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Session ID is required',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const result = await ChatSession.deleteOne({
      _id: sessionId,
      userId: request.userId,
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Session not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Session deleted successfully',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[AI Chat] Error deleting session:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to delete session',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * GET /api/ai/chat
 * Get chat session history
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    // Get specific session
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: request.userId,
    });

    if (!session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Session not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        session,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } else {
    // Get all sessions for user
    const sessions = await ChatSession.find({
      userId: request.userId,
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    return new Response(
      JSON.stringify({
        success: true,
        sessions,
        count: sessions.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
