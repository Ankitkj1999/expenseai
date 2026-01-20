'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table';
import { TableCell, TableRow } from '@/components/ui/table';
import type { TransactionResponse } from '@/types';

interface GroupedTransactionRowProps {
  transaction: TransactionResponse;
  columns: ColumnDef<TransactionResponse>[];
  columnVisibility: VisibilityState;
}

export function GroupedTransactionRow({
  transaction,
  columns,
  columnVisibility,
}: GroupedTransactionRowProps) {
  const miniTable = useReactTable({
    data: [transaction],
    columns,
    state: {
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const row = miniTable.getRowModel().rows[0];

  return (
    <TableRow className="group">
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-4 px-6">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
