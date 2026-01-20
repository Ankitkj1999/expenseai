'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useFormatting } from '@/lib/hooks/useFormatting';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TransactionResponse, CategoryResponse, AccountResponse } from '@/types';

interface RecentTransactionsTableProps {
  transactions: TransactionResponse[];
  isLoading?: boolean;
  onEdit?: (transaction: TransactionResponse) => void;
  onDelete?: (id: string) => void;
  limit?: number;
}

export function RecentTransactionsTable({
  transactions,
  isLoading = false,
  onEdit,
  onDelete,
  limit = 10,
}: RecentTransactionsTableProps) {
  const { formatCurrency, formatDate } = useFormatting();
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'date', desc: true }]);

  // Limit to recent transactions
  const recentTransactions = React.useMemo(() => {
    return transactions.slice(0, limit);
  }, [transactions, limit]);

  const columns: ColumnDef<TransactionResponse>[] = [
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {formatDate(row.original.date)}
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        return (
          <div className="max-w-[200px] md:max-w-[300px]">
            <div className="font-medium truncate">{row.original.description}</div>
            {row.original.metadata?.notes && (
              <div className="text-xs text-muted-foreground truncate">
                {row.original.metadata.notes}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'categoryId',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.categoryId as CategoryResponse | undefined;
        if (!category || typeof category === 'string') {
          return <span className="text-xs text-muted-foreground">Uncategorized</span>;
        }
        return (
          <Badge variant="outline" className="font-normal text-xs">
            {category.name}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'accountId',
      header: 'Account',
      cell: ({ row }) => {
        const account = row.original.accountId as AccountResponse | undefined;
        if (!account || typeof account === 'string') {
          return <span className="text-xs text-muted-foreground">Unknown</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: account.color }}
            />
            <span className="text-sm truncate max-w-[100px]">{account.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.original.amount;
        const type = row.original.type;
        const account = row.original.accountId as AccountResponse | undefined;
        const currency = typeof account === 'object' && account.currency ? account.currency : undefined;

        let colorClass = '';
        let sign = '';
        
        if (type === 'income') {
          colorClass = 'text-green-600 dark:text-green-400';
          sign = '+';
        } else if (type === 'expense') {
          colorClass = 'text-red-600 dark:text-red-400';
          sign = '-';
        } else if (type === 'transfer') {
          colorClass = 'text-blue-600 dark:text-blue-400';
          sign = '→';
        }

        const formattedAmount = formatCurrency(Math.abs(amount), currency);

        return (
          <div className={cn('font-semibold text-right', colorClass)}>
            {sign}{formattedAmount}
          </div>
        );
      },
    },
  ];

  // Add actions column only if handlers are provided
  if (onEdit || onDelete) {
    columns.push({
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onEdit && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original._id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  const table = useReactTable({
    data: recentTransactions,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/transactions')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No transactions yet. Start tracking your finances by adding your first transaction.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="h-10 px-4">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
