'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatSession {
  _id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryProps {
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export function ChatHistory({ 
  currentSessionId, 
  onSelectSession,
  onNewChat 
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai/chat');
      if (!response.ok) throw new Error('Failed to load sessions');
      
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ai/chat?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete session');
      
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      setDeleteSessionId(null);
      
      // If deleting current session, start new chat
      if (sessionId === currentSessionId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const getSessionPreview = (session: ChatSession): string => {
    const firstUserMessage = session.messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'New conversation';
    
    const preview = firstUserMessage.content.slice(0, 50);
    return preview.length < firstUserMessage.content.length 
      ? `${preview}...` 
      : preview;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffMs = now.getTime() - sessionDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return sessionDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <div className="flex flex-col h-full border-r bg-muted/30">
        {/* Header */}
        <div className="p-3 border-b">
          <Button
            onClick={onNewChat}
            className="w-full gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full mb-2" />
                ))}
              </>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No chat history yet
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  className={cn(
                    'group relative rounded-lg p-3 cursor-pointer transition-colors',
                    'hover:bg-muted',
                    currentSessionId === session._id && 'bg-muted'
                  )}
                  onClick={() => onSelectSession(session._id)}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getSessionPreview(session)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteSessionId(session._id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSessionId && handleDeleteSession(deleteSessionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
