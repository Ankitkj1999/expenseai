'use client';

import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import type { TransactionResponse } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionCardProps {
  transaction: TransactionResponse;
  onEdit?: (transaction: TransactionResponse) => void;
  onDelete?: (id: string) => void;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const getIcon = () => {
    if (isExpense) return <ArrowUpRight className="h-4 w-4" />;
    if (isIncome) return <ArrowDownRight className="h-4 w-4" />;
    return <ArrowRightLeft className="h-4 w-4" />;
  };

  const getAmountColor = () => {
    if (isExpense) return 'text-red-500';
    if (isIncome) return 'text-green-500';
    return 'text-blue-500';
  };

  const getTypeColor = () => {
    if (isExpense) return 'bg-red-50 text-red-700 border-red-200';
    if (isIncome) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const accountName = typeof transaction.accountId === 'string' 
    ? 'Unknown Account' 
    : transaction.accountId.name;

  const categoryName = transaction.categoryId && typeof transaction.categoryId !== 'string'
    ? transaction.categoryId.name
    : undefined;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className={cn(
              'p-2 rounded-full',
              getTypeColor()
            )}>
              {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{transaction.description}</h3>
                <Badge variant="outline" className={cn('text-xs', getTypeColor())}>
                  {transaction.type}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{accountName}</span>
                {categoryName && (
                  <>
                    <span>•</span>
                    <span>{categoryName}</span>
                  </>
                )}
                <span>•</span>
                <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
              </div>

              {transaction.metadata?.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {transaction.metadata.notes}
                </p>
              )}
            </div>
          </div>

          {/* Amount and Actions */}
          <div className="flex items-start gap-2 ml-4">
            <div className="text-right">
              <p className={cn('font-semibold text-lg', getAmountColor())}>
                {isExpense && '-'}
                {isIncome && '+'}
                ${transaction.amount.toFixed(2)}
              </p>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(transaction)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(transaction._id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
