'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, User, Copy, Check, RefreshCw, Database, Search, Calculator } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ToolCall {
  name: string;
  status: 'pending' | 'completed' | 'error';
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  onRegenerate?: () => void;
}

const toolIcons: Record<string, typeof Database> = {
  getTransactions: Search,
  createTransaction: Database,
  getSpendingSummary: Calculator,
  getCategoryBreakdown: Calculator,
  getBudgetStatus: Calculator,
  getAccounts: Database,
  getCategories: Database,
};

export function ChatMessage({ 
  role, 
  content, 
  isStreaming,
  toolCalls,
  onRegenerate 
}: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Tool Call Indicators */}
      {!isUser && toolCalls && toolCalls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 ml-11">
          {toolCalls.map((tool, index) => {
            const Icon = toolIcons[tool.name] || Database;
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={tool.status === 'error' ? 'destructive' : 'secondary'}
                      className={cn(
                        'gap-1.5 text-xs transition-all duration-200',
                        'animate-in fade-in-0 slide-in-from-left-2',
                        tool.status === 'pending' && 'animate-pulse',
                        tool.status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Icon className="h-3 w-3" />
                      {tool.name.replace(/([A-Z])/g, ' $1').trim()}
                      {tool.status === 'completed' && (
                        <Check className="h-3 w-3" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {tool.status === 'pending' && 'Querying data...'}
                      {tool.status === 'completed' && 'Query completed'}
                      {tool.status === 'error' && 'Query failed'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}

      {/* Message */}
      <div
        className={cn(
          'group flex gap-2 sm:gap-3',
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

        <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
          <Card
            className={cn(
              'max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3',
              'border-0 shadow-sm transition-shadow duration-200',
              isUser
                ? 'bg-primary text-primary-foreground shadow-primary/20'
                : 'bg-muted hover:shadow-md'
            )}
          >
            <div className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
              {content}
              {isStreaming && (
                <span className="inline-block w-0.5 h-3 sm:h-4 ml-1 bg-current animate-pulse" />
              )}
            </div>
          </Card>

          {/* Message Actions */}
          {!isStreaming && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6",
                        "transition-all duration-200",
                        "hover:bg-muted hover:scale-110",
                        "active:scale-95"
                      )}
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{copied ? 'Copied!' : 'Copy message'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {!isUser && onRegenerate && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6",
                          "transition-all duration-200",
                          "hover:bg-muted hover:scale-110",
                          "active:scale-95"
                        )}
                        onClick={onRegenerate}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Regenerate response</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>

        {isUser && (
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
            <AvatarFallback className="bg-muted">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
