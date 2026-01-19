'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsightCardProps {
  type: 'alert' | 'advice';
  title: string;
  description: string;
}

function InsightCard({ type, title, description }: InsightCardProps) {
  const isAlert = type === 'alert';
  
  return (
    <div className={`group relative p-4 rounded-lg border overflow-hidden transition-all duration-300 cursor-pointer
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

export function AIInsights() {
  // Hardcoded insights for now
  const insights = [
    {
      type: 'alert' as const,
      title: 'Spending increased by 12% last week',
      description: 'Your expenses are higher than usual',
    },
    {
      type: 'advice' as const,
      title: 'Cash allocation reached $9M this month',
      description: 'Consider diversifying your portfolio',
    },
  ];

  return (
    <Card className="h-full relative overflow-hidden">
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
                Weekly AI Insight
              </CardTitle>
              <CardDescription className="mt-1">
                Generated insights from your finance
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 hover:bg-primary/10 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            type={insight.type}
            title={insight.title}
            description={insight.description}
          />
        ))}
      </CardContent>
    </Card>
  );
}
