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
  const Icon = isExpense ? TrendingDown : TrendingUp;

  return (
    <Card className="group relative transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-transform group-hover:scale-105">
              <Icon className="h-5 w-5" style={{ color: categoryColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{transaction.description}</CardTitle>
                {!transaction.isActive && (
                  <Badge variant="secondary" className="text-xs">Paused</Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                {categoryName} • {accountName}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Amount */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Amount</p>
            <p className={`text-xl font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
              {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Frequency & Next Occurrence */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                Frequency
              </p>
              <p className="text-sm font-medium">{getFrequencyLabel()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Next Date
              </p>
              <p className="text-sm font-medium">{formatDate(transaction.nextOccurrence)}</p>
            </div>
          </div>

          {/* Date Range */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <span>Started: {formatDate(transaction.startDate)}</span>
            {transaction.endDate ? (
              <span> • Ends: {formatDate(transaction.endDate)}</span>
            ) : (
              <span> • No end date</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8"
              onClick={() => onEdit(transaction)}
              disabled={isLoading}
            >
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            {transaction.isActive ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={() => onPause(transaction._id)}
                disabled={isLoading}
              >
                <Pause className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={() => onResume(transaction._id)}
                disabled={isLoading}
              >
                <Play className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => onDelete(transaction._id, transaction.description)}
              disabled={isLoading}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
