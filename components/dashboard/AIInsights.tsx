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
  return (
    <div className="group relative p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {type === 'alert' ? 'Money alert' : 'Advice'}
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold leading-tight">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
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
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Weekly AI Insight</CardTitle>
              <CardDescription className="mt-1">
                Generated insights from your finance
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
