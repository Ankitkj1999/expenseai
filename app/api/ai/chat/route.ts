import { streamText, generateText, stepCountIs } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import ChatSession from '@/lib/db/models/ChatSession';
import { tools } from '@/lib/services/aiService';
import { z } from 'zod';

/**
 * POST /api/ai/chat
 * Main AI chat endpoint with tool calling using AWS Bedrock Claude
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  console.log('\n========== AI CHAT REQUEST START ==========');
  const body = await request.json();
  const { messages, sessionId } = body;
  
  console.log('[AI Chat] Request received');
  console.log('[AI Chat] userId:', request.userId);
  console.log('[AI Chat] sessionId:', sessionId);
  console.log('[AI Chat] messages count:', messages?.length);
  console.log('[AI Chat] last message:', messages?.[messages.length - 1]);

  if (!messages || !Array.isArray(messages)) {
    console.log('[AI Chat] ERROR: Invalid messages array');
    return new Response('Messages array is required', { status: 400 });
  }

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

  // Call Vercel AI SDK with AWS Bedrock Claude
  console.log('[AI Chat] Calling Bedrock Claude with generateText (non-streaming)...');
  
  try {
    // Use generateText to handle tool calls properly, then stream the result
    const result = await generateText({
      model: bedrock('anthropic.claude-3-sonnet-20240229-v1:0'),
      messages,
      system: `You are a helpful AI assistant for ExpenseAI, an expense tracking application.
You help users log expenses, track spending, analyze budgets, and answer financial questions.

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

GENERAL TOOL USAGE:
- ALWAYS use tools to fetch real data before responding
- NEVER assume data doesn't exist - check first using appropriate tools
- After using a tool, explain the results in natural language
- Be conversational, friendly, and provide actionable insights
- Present numbers with proper formatting (currency, percentages)

Current date: ${new Date().toISOString().split('T')[0]}`,
      tools: aiTools,
      stopWhen: stepCountIs(5), // Enable automatic multi-step tool execution (up to 5 steps)
    });

    console.log('[AI Chat] generateText completed');
    console.log('[AI Chat] Tool calls made:', result.toolCalls?.length || 0);
    if (result.toolCalls && result.toolCalls.length > 0) {
      result.toolCalls.forEach((call: { toolName?: string; args?: unknown }, index: number) => {
        console.log(`[AI Chat] Tool Call ${index + 1}:`, {
          name: call.toolName,
          args: JSON.stringify(call.args || {})
        });
      });
    }
    console.log('[AI Chat] Tool results:', result.toolResults?.length || 0);
    if (result.toolResults && result.toolResults.length > 0) {
      result.toolResults.forEach((toolResult: { toolName?: string; result?: unknown }, index: number) => {
        console.log(`[AI Chat] Tool Result ${index + 1}:`, {
          toolName: toolResult.toolName,
          result: JSON.stringify(toolResult.result || {}).substring(0, 500)
        });
      });
    }
    console.log('[AI Chat] Response text length:', result.text?.length || 0);
    console.log('[AI Chat] Response text:', result.text);
    console.log('[AI Chat] Finish reason:', result.finishReason);
    
    const responseText = result.text;
    
    // Save assistant response to chat session
    try {
      if (responseText && responseText.trim()) {
        const session = await ChatSession.findById(chatSession._id);
        if (session) {
          session.messages.push({
            role: 'assistant',
            content: responseText,
            timestamp: new Date(),
          });
          await session.save();
          console.log('[AI Chat] Assistant message saved to session');
        }
      }
    } catch (error) {
      console.error('[AI Chat] Error saving assistant message:', error);
    }

    console.log('========== AI CHAT REQUEST END ==========\n');
    
    // Return the response as JSON (since we're not streaming anymore)
    return new Response(
      JSON.stringify({
        success: true,
        message: responseText,
        sessionId: chatSession._id.toString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': chatSession._id.toString(),
        },
      }
    );
  } catch (error) {
    console.error('[AI Chat] ERROR in generateText:', error);
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
