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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategorySelect } from './shared/CategorySelect';
import { AccountSelect } from './shared/AccountSelect';
import { DatePicker } from './shared/DatePicker';
import { FormActions } from './shared/FormActions';
import { useCreateTransaction, useUpdateTransaction } from '@/lib/hooks/useTransactions';
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
  // For transfers, toAccountId is required
  if (data.type === 'transfer') {
    return !!data.toAccountId;
  }
  return true;
}, {
  message: 'Destination account is required for transfers',
  path: ['toAccountId'],
}).refine((data) => {
  // For expense/income, categoryId is required
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Transaction Type Tabs */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <Tabs
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as TransactionType)}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="expense">Expense</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount and Date (2-column on desktop) */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Grocery shopping" {...field} />
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
            <FormItem>
              <FormLabel>
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
              <FormItem>
                <FormLabel>To Account</FormLabel>
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
              <FormItem>
                <FormLabel>Category</FormLabel>
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
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add any additional details about this transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <FormActions
          isSubmitting={form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending}
          onCancel={onCancel}
          submitLabel={mode === 'create' ? 'Create Transaction' : 'Update Transaction'}
        />
      </form>
    </Form>
  );
}
