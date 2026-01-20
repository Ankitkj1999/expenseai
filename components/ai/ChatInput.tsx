'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSend, 
  isLoading = false,
  placeholder = "Ask me anything about your finances..."
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="min-h-[48px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none text-sm"
        rows={2}
      />
      <Button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        size="icon"
        className="h-[48px] w-[48px] sm:h-[60px] sm:w-[60px] shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : (
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>
    </div>
  );
}
