'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { insightsApi } from '@/lib/api/insights';
import { IAIInsight, IInsight } from '@/lib/db/models/AIInsight';
import { toast } from 'sonner';

interface InsightCardProps {
  type: 'alert' | 'advice';
  title: string;
  description: string;
}

function InsightCard({ type, title, description }: InsightCardProps) {
  const isAlert = type === 'alert';
  
  return (
    <div className={`group relative p-4 rounded-lg border overflow-hidden transition-all duration-300 cursor-pointer flex-1
      ${isAlert 
        ? 'bg-gradient-to-br from-red-50/50 via-background to-background dark:from-red-950/20 dark:via-background dark:to-background hover:from-red-50 dark:hover:from-red-950/30' 
        : 'bg-gradient-to-br from-blue-50/50 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background hover:from-blue-50 dark:hover:from-blue-950/30'
      }
      hover:shadow-md hover:border-primary/20`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
        ${isAlert 
          ? 'bg-gradient-to-r from-red-500/5 to-transparent' 
          : 'bg-gradient-to-r from-blue-500/5 to-transparent'
        }`} 
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-medium uppercase tracking-wide
            ${isAlert 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {type === 'alert' ? 'Money alert' : 'Advice'}
          </span>
          <ArrowUpRight className={`h-4 w-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5
            ${isAlert 
              ? 'text-red-400 group-hover:text-red-600 dark:text-red-500 dark:group-hover:text-red-400' 
              : 'text-blue-400 group-hover:text-blue-600 dark:text-blue-500 dark:group-hover:text-blue-400'
            }`} 
          />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AIInsightsHorizontal() {
  const [insights, setInsights] = useState<IInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch insights on mount
  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      const data = await insightsApi.list();
      
      // Handle different response structures
      let allInsights: IInsight[] = [];
      
      if (Array.isArray(data)) {
        // If data is an array of insight documents
        allInsights = data.flatMap(doc => doc.insights || []);
      } else if (data && typeof data === 'object' && 'insights' in data) {
        // If data is a single insight document
        allInsights = (data as IAIInsight).insights || [];
      }
      
      // Filter unread insights and sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const sortedInsights = allInsights
        .filter(insight => !insight.isRead)
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        .slice(0, 2); // Show top 2 insights
      
      setInsights(sortedInsights);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      toast.error('Failed to load insights');
      // Set empty insights on error
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setIsGenerating(true);
      await insightsApi.generate();
      toast.success('New insights generated!');
      await fetchInsights();
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Skeleton className="h-24 flex-1 rounded-lg" />
          <Skeleton className="h-24 flex-1 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
              {/* Animated sparkle effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent animate-pulse" />
              <Sparkles className="h-5 w-5 text-primary relative z-10" />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                AI Insights
              </CardTitle>
              <CardDescription className="mt-1">
                Generated insights from your finances
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 hover:bg-primary/10 transition-colors"
            onClick={handleGenerateInsights}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex gap-3 relative z-10">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground w-full">
            <p className="text-sm">No insights available yet.</p>
            <p className="text-xs mt-1">Click the refresh button to generate insights.</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <InsightCard
              key={index}
              type={insight.category === 'alert' ? 'alert' : 'advice'}
              title={insight.title}
              description={insight.description}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
