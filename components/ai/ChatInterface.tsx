'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ChatInput } from './ChatInput';
import { ChatHistory } from './ChatHistory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, History, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpendingSummary } from './SpendingSummary';
import { CategoryBreakdown } from './CategoryBreakdown';
import { TransactionList } from './TransactionList';
import { BudgetOverview } from './BudgetOverview';
import { AccountsCard } from './AccountsCard';

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: unknown;
  state: 'call' | 'result' | 'error';
  result?: unknown;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ChatInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatInterface({ open, onOpenChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        toolInvocations: [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Handle different message types from the stream
              if (data.type === 'text-delta') {
                assistantMessage.content += data.delta;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              } else if (data.type === 'tool-input-available') {
                // Tool is being called
                const toolInvocation: ToolInvocation = {
                  toolCallId: data.toolCallId,
                  toolName: data.toolName,
                  args: data.input,
                  state: 'call',
                };
                assistantMessage.toolInvocations = assistantMessage.toolInvocations || [];
                assistantMessage.toolInvocations.push(toolInvocation);
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              } else if (data.type === 'tool-output-available') {
                // Tool result is available
                const invocations = assistantMessage.toolInvocations || [];
                const invocation = invocations.find(inv => inv.toolCallId === data.toolCallId);
                if (invocation) {
                  invocation.state = 'result';
                  invocation.result = data.output;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 2 || isLoading) return;

    // Remove last assistant message
    const newMessages = messages.slice(0, -1);
    setMessages(newMessages);

    // Get last user message
    const lastUserMessage = newMessages[newMessages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      await handleSend(lastUserMessage.content);
    }
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
              {showHistory ? (
                <X className="h-4 w-4" />
              ) : (
                <History className="h-4 w-4" />
              )}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Chat History Sidebar */}
          {showHistory && (
            <>
              <div
                className={cn(
                  "absolute inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden",
                  "animate-in fade-in-0 duration-200"
                )}
                onClick={() => setShowHistory(false)}
              />
              
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
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4"
            >
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
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
                        "active:scale-95"
                      )}
                      onClick={() => handleSend("Show my budget status")}
                    >
                      Budget status
                    </Badge>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
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
                        {message.role === 'user' ? (
                          <div className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                            {message.content}
                          </div>
                        ) : (
                          <>
                            {/* Render text content */}
                            {message.content && (
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>
                            )}
                            
                            {/* Render tool results */}
                            {message.toolInvocations?.map((tool, index) => {
                              // Spending Summary
                              if (tool.toolName === 'getSpendingSummary' && tool.state === 'result' && tool.result) {
                                return <SpendingSummary key={index} {...(tool.result as any)} />;
                              }
                              
                              // Category Breakdown
                              if (tool.toolName === 'getCategoryBreakdown' && tool.state === 'result' && tool.result) {
                                return <CategoryBreakdown key={index} {...(tool.result as any)} />;
                              }
                              
                              // Transaction List
                              if (tool.toolName === 'getTransactions' && tool.state === 'result' && tool.result) {
                                return <TransactionList key={index} {...(tool.result as any)} />;
                              }
                              
                              // Budget Overview
                              if (tool.toolName === 'getBudgetStatus' && tool.state === 'result' && tool.result) {
                                return <BudgetOverview key={index} {...(tool.result as any)} />;
                              }
                              
                              // Accounts Card
                              if (tool.toolName === 'getAccounts' && tool.state === 'result' && tool.result) {
                                return <AccountsCard key={index} {...(tool.result as any)} />;
                              }
                              
                              // Loading state
                              if (tool.state === 'call') {
                                return (
                                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground my-2 p-2 bg-muted/20 rounded-md">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>
                                      {tool.toolName === 'getSpendingSummary' && 'Calculating spending summary...'}
                                      {tool.toolName === 'getCategoryBreakdown' && 'Analyzing spending categories...'}
                                      {tool.toolName === 'getTransactions' && 'Fetching transactions...'}
                                      {tool.toolName === 'getBudgetStatus' && 'Checking budget status...'}
                                      {tool.toolName === 'getAccounts' && 'Retrieving account details...'}
                                      {tool.toolName === 'createTransaction' && 'Creating transaction...'}
                                      {!['getSpendingSummary', 'getCategoryBreakdown', 'getTransactions', 'getBudgetStatus', 'getAccounts', 'createTransaction'].includes(tool.toolName) && `Using ${tool.toolName}...`}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </>
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
