'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CategorySelect } from './shared/CategorySelect';
import { AccountSelect } from './shared/AccountSelect';
import { DatePicker } from './shared/DatePicker';
import { Button } from '@/components/ui/button';
import { useCreateTransaction, useUpdateTransaction } from '@/lib/hooks/useTransactions';
import { TrendingDown, TrendingUp, ArrowRightLeft, Loader2 } from 'lucide-react';
import type { TransactionResponse, TransactionType } from '@/types';

// Validation schema
const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500),
  accountId: z.string().min(1, 'Account is required'),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.date(),
  notes: z.string().max(1000).optional(),
}).refine((data) => {
  if (data.type === 'transfer') {
    return !!data.toAccountId;
  }
  return true;
}, {
  message: 'Destination account is required for transfers',
  path: ['toAccountId'],
}).refine((data) => {
  if (data.type !== 'transfer') {
    return !!data.categoryId;
  }
  return true;
}, {
  message: 'Category is required',
  path: ['categoryId'],
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  mode: 'create' | 'edit';
  initialData?: TransactionResponse;
  onSuccess: (data: TransactionResponse) => void;
  onCancel?: () => void;
}

export function TransactionForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData
      ? {
          type: initialData.type,
          amount: initialData.amount,
          description: initialData.description,
          accountId: typeof initialData.accountId === 'string' 
            ? initialData.accountId 
            : initialData.accountId._id,
          toAccountId: initialData.toAccountId 
            ? (typeof initialData.toAccountId === 'string' 
                ? initialData.toAccountId 
                : initialData.toAccountId._id)
            : undefined,
          categoryId: initialData.categoryId
            ? (typeof initialData.categoryId === 'string'
                ? initialData.categoryId
                : initialData.categoryId._id)
            : undefined,
          date: new Date(initialData.date),
          notes: initialData.metadata?.notes || '',
        }
      : {
          type: 'expense',
          amount: 0,
          description: '',
          accountId: '',
          date: new Date(),
          notes: '',
        },
  });

  const transactionType = form.watch('type');
  const accountId = form.watch('accountId');

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const onSubmit = async (data: TransactionFormData) => {
    const payload = {
      type: data.type,
      amount: data.amount,
      description: data.description,
      accountId: data.accountId,
      toAccountId: data.toAccountId,
      categoryId: data.categoryId,
      date: data.date.toISOString(),
      metadata: {
        notes: data.notes || undefined,
      },
    };

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: (result) => onSuccess(result),
      });
    } else {
      updateMutation.mutate(
        { id: initialData!._id, data: payload },
        {
          onSuccess: (result) => onSuccess(result),
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Transaction Type</FormLabel>
              <FormControl>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) field.onChange(value as TransactionType);
                  }}
                  className="grid grid-cols-3 gap-3"
                >
                  <ToggleGroupItem
                    value="expense"
                    className="flex flex-col gap-2 h-auto py-4 px-4 data-[state=on]:bg-red-500/10 data-[state=on]:text-red-600 data-[state=on]:border-red-500 border-2"
                  >
                    <TrendingDown className="h-5 w-5" />
                    <span className="text-sm font-medium">Expense</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="income"
                    className="flex flex-col gap-2 h-auto py-4 px-4 data-[state=on]:bg-green-500/10 data-[state=on]:text-green-600 data-[state=on]:border-green-500 border-2"
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">Income</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="transfer"
                    className="flex flex-col gap-2 h-auto py-4 px-4 data-[state=on]:bg-blue-500/10 data-[state=on]:text-blue-600 data-[state=on]:border-blue-500 border-2"
                  >
                    <ArrowRightLeft className="h-5 w-5" />
                    <span className="text-sm font-medium">Transfer</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  className="text-3xl font-bold h-16 px-4"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Date</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Description</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Grocery shopping" 
                  className="h-11"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Selection */}
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">
                {transactionType === 'transfer' ? 'From Account' : 'Account'}
              </FormLabel>
              <FormControl>
                <AccountSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select account"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transfer: To Account */}
        {transactionType === 'transfer' && (
          <FormField
            control={form.control}
            name="toAccountId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium">To Account</FormLabel>
                <FormControl>
                  <AccountSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select destination account"
                    excludeAccountId={accountId}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Category (not for transfers) */}
        {transactionType !== 'transfer' && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium">Category</FormLabel>
                <FormControl>
                  <CategorySelect
                    value={field.value}
                    onValueChange={field.onChange}
                    type={transactionType}
                    placeholder="Select category"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Notes (Optional) */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-sm">
                Add any additional details about this transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Transaction' : 'Update Transaction')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
