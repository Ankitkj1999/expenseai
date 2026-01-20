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
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatInterface({ open, onOpenChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'No response received',
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 h-full">
        <SheetHeader className="px-4 pt-4 pb-3 border-b sm:px-6 sm:pt-6 sm:pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-lg sm:text-xl">AI Assistant</SheetTitle>
              <SheetDescription className="text-xs truncate">
                Ask me anything about your finances
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

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
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSend("What did I spend this month?")}
                >
                  Monthly spending
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSend("Show my budget status")}
                >
                  Budget status
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSend("I spent $50 on lunch")}
                >
                  Log expense
                </Badge>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  isStreaming={isLoading && message.id === messages[messages.length - 1]?.id}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 mb-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                  </div>
                  <div className="text-sm text-muted-foreground">Thinking...</div>
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
      </SheetContent>
    </Sheet>
  );
}
