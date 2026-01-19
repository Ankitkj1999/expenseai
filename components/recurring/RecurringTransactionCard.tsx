'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, Repeat, Play, Pause, TrendingDown, TrendingUp } from 'lucide-react';
import type { RecurringTransaction } from '@/lib/api/recurring';

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (id: string, description: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  isLoading?: boolean;
}

export function RecurringTransactionCard({
  transaction,
  onEdit,
  onDelete,
  onPause,
  onResume,
  isLoading,
}: RecurringTransactionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFrequencyLabel = () => {
    const { frequency, interval } = transaction;
    if (interval === 1) {
      return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
    return `Every ${interval} ${frequency === 'daily' ? 'days' : frequency === 'weekly' ? 'weeks' : frequency === 'monthly' ? 'months' : 'years'}`;
  };

  const accountName = typeof transaction.accountId !== 'string'
    ? transaction.accountId.name
    : 'Unknown Account';

  const categoryName = typeof transaction.categoryId !== 'string'
    ? transaction.categoryId.name
    : 'Unknown Category';

  const categoryColor = typeof transaction.categoryId !== 'string'
    ? transaction.categoryId.color
    : '#3B82F6';

  const isExpense = transaction.type === 'expense';

  return (
    <Card 
      className="hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${categoryColor}` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{transaction.description}</CardTitle>
              {!transaction.isActive && (
                <Badge variant="secondary">Paused</Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-2">
              <div
                className="p-1 rounded"
                style={{ backgroundColor: `${categoryColor}20` }}
              >
                {isExpense ? (
                  <TrendingDown className="h-3 w-3" style={{ color: categoryColor }} />
                ) : (
                  <TrendingUp className="h-3 w-3" style={{ color: categoryColor }} />
                )}
              </div>
              {categoryName} • {accountName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Amount */}
          <div>
            <p className={`text-2xl font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
              {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Frequency Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Repeat className="h-4 w-4" />
              <span>{getFrequencyLabel()}</span>
            </div>
          </div>

          {/* Next Occurrence */}
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Next occurrence:</span>
            <div className="flex items-center gap-1 font-medium">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(transaction.nextOccurrence)}</span>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Started: {formatDate(transaction.startDate)}</span>
            {transaction.endDate && (
              <>
                <span>•</span>
                <span>Ends: {formatDate(transaction.endDate)}</span>
              </>
            )}
            {!transaction.endDate && (
              <>
                <span>•</span>
                <span>No end date</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(transaction)}
              disabled={isLoading}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {transaction.isActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPause(transaction._id)}
                disabled={isLoading}
              >
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResume(transaction._id)}
                disabled={isLoading}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(transaction._id, transaction.description)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
