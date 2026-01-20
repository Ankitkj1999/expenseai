'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, Calendar, Target, TrendingUp } from 'lucide-react';
import { useFormatting } from '@/lib/hooks/useFormatting';
import type { Budget } from '@/lib/api/budgets';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting?: boolean;
}

export function BudgetCard({ budget, onEdit, onDelete, isDeleting }: BudgetCardProps) {
  const { formatCurrency, formatDate } = useFormatting();
  
  // Calculate progress (mock for now - would come from API)
  const spent = 0; // TODO: Get from API
  const progress = (spent / budget.amount) * 100;
  const isOverBudget = progress > 100;
  const isNearLimit = progress >= budget.alertThreshold && !isOverBudget;

  const getPeriodLabel = (period: string) => {
    return period.charAt(0).toUpperCase() + period.slice(1);
  };

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const categoryName = budget.categoryId && typeof budget.categoryId !== 'string'
    ? budget.categoryId.name
    : 'All Categories';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{budget.name}</CardTitle>
              {!budget.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-2">
              <Target className="h-3 w-3" />
              {categoryName} • {getPeriodLabel(budget.period)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(spent)} spent
              </span>
              <span className="font-medium">
                {formatCurrency(budget.amount)} limit
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(progress, 100)} 
                className="h-2"
              />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${
                isOverBudget ? 'text-red-600' : 
                isNearLimit ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {progress.toFixed(1)}% used
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(budget.amount - spent)} remaining
              </span>
            </div>
          </div>

          {/* Period Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(budget.startDate)}</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(budget.endDate)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(budget)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(budget._id, budget.name)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
