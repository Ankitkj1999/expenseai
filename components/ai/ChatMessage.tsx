'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2 mb-3 sm:gap-3 sm:mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <Card
        className={cn(
          'max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
          {content}
          {isStreaming && (
            <span className="inline-block w-0.5 h-3 sm:h-4 ml-1 bg-current animate-pulse" />
          )}
        </div>
      </Card>

      {isUser && (
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
          <AvatarFallback className="bg-muted">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
