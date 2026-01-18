import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { authenticate } from '@/lib/middleware/auth';
import connectDB from '@/lib/db/mongodb';
import ChatSession from '@/lib/db/models/ChatSession';
import { tools } from '@/lib/services/aiService';
import { z } from 'zod';

/**
 * POST /api/ai/chat
 * Main AI chat endpoint with tool calling using AWS Bedrock Claude
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 });
    }

    // Get or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await ChatSession.findOne({
        _id: sessionId,
        userId: authResult.userId,
      });
    }

    if (!chatSession) {
      chatSession = await ChatSession.create({
        userId: authResult.userId,
        messages: [],
      });
    }

    // Add user message to session
    const userMessage = messages[messages.length - 1];
    chatSession.messages.push({
      role: 'user',
      content: userMessage.content,
      timestamp: new Date(),
    });
    await chatSession.save();

    // Define tools with proper typing
    const aiTools = {
      getTransactions: {
        description: tools.getTransactions.description,
        inputSchema: tools.getTransactions.parameters,
        execute: async (params: z.infer<typeof tools.getTransactions.parameters>) =>
          tools.getTransactions.execute(params, authResult.userId!),
      },
      createTransaction: {
        description: tools.createTransaction.description,
        inputSchema: tools.createTransaction.parameters,
        execute: async (params: z.infer<typeof tools.createTransaction.parameters>) =>
          tools.createTransaction.execute(params, authResult.userId!),
      },
      getSpendingSummary: {
        description: tools.getSpendingSummary.description,
        inputSchema: tools.getSpendingSummary.parameters,
        execute: async (params: z.infer<typeof tools.getSpendingSummary.parameters>) =>
          tools.getSpendingSummary.execute(params, authResult.userId!),
      },
      getCategoryBreakdown: {
        description: tools.getCategoryBreakdown.description,
        inputSchema: tools.getCategoryBreakdown.parameters,
        execute: async (params: z.infer<typeof tools.getCategoryBreakdown.parameters>) =>
          tools.getCategoryBreakdown.execute(params, authResult.userId!),
      },
      getBudgetStatus: {
        description: tools.getBudgetStatus.description,
        inputSchema: tools.getBudgetStatus.parameters,
        execute: async (params: z.infer<typeof tools.getBudgetStatus.parameters>) =>
          tools.getBudgetStatus.execute(params, authResult.userId!),
      },
    };

    // Call Vercel AI SDK with AWS Bedrock Claude
    const result = await streamText({
      model: bedrock('anthropic.claude-3-sonnet-20240229-v1:0'),
      messages,
      system: `You are a helpful AI assistant for ExpenseAI, an expense tracking application.
You help users log expenses, track spending, analyze budgets, and answer financial questions.

When users mention spending money, always use the createTransaction tool to log it.
When users ask about their spending, use the appropriate tools to fetch and analyze data.
Be conversational, friendly, and provide actionable insights.

Current date: ${new Date().toISOString().split('T')[0]}`,
      tools: aiTools,
      onFinish: async ({ text }) => {
        // Save assistant response to chat session
        try {
          // Only save if there's actual content
          if (text && text.trim()) {
            const session = await ChatSession.findById(chatSession._id);
            if (session) {
              session.messages.push({
                role: 'assistant',
                content: text,
                timestamp: new Date(),
              });
              await session.save();
            }
          }
        } catch (error) {
          console.error('Error saving assistant message:', error);
        }
      },
    });

    // Stream response back to client
    return result.toTextStreamResponse({
      headers: {
        'X-Session-Id': chatSession._id.toString(),
      },
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * GET /api/ai/chat
 * Get chat session history
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated || !authResult.userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session
      const session = await ChatSession.findOne({
        _id: sessionId,
        userId: authResult.userId,
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
        userId: authResult.userId,
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
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch chat sessions',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
