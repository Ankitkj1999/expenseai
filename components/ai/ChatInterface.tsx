'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHistory } from './ChatHistory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, History, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCall {
  name: string;
  status: 'pending' | 'completed' | 'error';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
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

  // Auto-scroll to bottom when new messages arrive with smooth behavior
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Load session if sessionId exists
  useEffect(() => {
    if (sessionId && open) {
      loadSession(sessionId);
    }
  }, [sessionId, open]);

  const loadSession = async (id: string) => {
    try {
      const response = await fetch(`/api/ai/chat?sessionId=${id}`);
      if (!response.ok) throw new Error('Failed to load session');
      
      const data = await response.json();
      if (data.success && data.session) {
        const loadedMessages: Message[] = data.session.messages.map((msg: { role: 'user' | 'assistant'; content: string }, index: number) => ({
          id: `${id}-${index}`,
          role: msg.role,
          content: msg.content,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

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

    // Simulate tool calls (in real implementation, these would come from the API)
    const mockToolCalls: ToolCall[] = [];
    
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

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Update session ID if new session was created
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'No response received',
        toolCalls: mockToolCalls.length > 0 ? mockToolCalls : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
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
          {/* Chat History Sidebar - Full width overlay on mobile, sidebar on desktop */}
          {showHistory && (
            <>
              {/* Backdrop for mobile */}
              <div
                className={cn(
                  "absolute inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden",
                  "animate-in fade-in-0 duration-200"
                )}
                onClick={() => setShowHistory(false)}
              />
              
              {/* Sidebar */}
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
                    I can help you track expenses, analyze spending, check budgets, and more.
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
                      onClick={() => handleSend("Show my budget status")}
                    >
                      Budget status
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
                        "active:scale-95"
                      )}
                      onClick={() => handleSend("I spent $50 on lunch")}
                    >
                      Log expense
                    </Badge>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      toolCalls={message.toolCalls}
                      isStreaming={isLoading && index === messages.length - 1}
                      onRegenerate={
                        message.role === 'assistant' && index === messages.length - 1
                          ? handleRegenerate
                          : undefined
                      }
                    />
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
