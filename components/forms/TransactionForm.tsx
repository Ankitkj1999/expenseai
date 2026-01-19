'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Field, FieldLabel, FieldDescription, FieldGroup } from '@/components/ui/field';
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
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
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

  const transactionType = watch('type');
  const accountId = watch('accountId');

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

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* Transaction Type */}
        <Field>
          <FieldLabel>Transaction Type</FieldLabel>
          <ToggleGroup
            type="single"
            value={transactionType}
            onValueChange={(value) => {
              if (value) setValue('type', value as TransactionType);
            }}
            className="grid grid-cols-3 gap-3"
            disabled={isLoading}
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
          {errors.type && (
            <FieldDescription className="text-destructive">
              {errors.type.message}
            </FieldDescription>
          )}
        </Field>

        {/* Amount */}
        <Field>
          <FieldLabel htmlFor="amount">Amount</FieldLabel>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="text-3xl font-bold h-16 px-4"
            {...register('amount', { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.amount && (
            <FieldDescription className="text-destructive">
              {errors.amount.message}
            </FieldDescription>
          )}
        </Field>

        {/* Date */}
        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <DatePicker
            value={watch('date')}
            onChange={(date) => date && setValue('date', date)}
            disabled={isLoading}
          />
          {errors.date && (
            <FieldDescription className="text-destructive">
              {errors.date.message}
            </FieldDescription>
          )}
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Input 
            id="description"
            placeholder="e.g., Grocery shopping" 
            {...register('description')}
            disabled={isLoading}
          />
          {errors.description && (
            <FieldDescription className="text-destructive">
              {errors.description.message}
            </FieldDescription>
          )}
        </Field>

        {/* Account Selection */}
        <Field>
          <FieldLabel htmlFor="accountId">
            {transactionType === 'transfer' ? 'From Account' : 'Account'}
          </FieldLabel>
          <AccountSelect
            value={watch('accountId')}
            onValueChange={(value) => setValue('accountId', value)}
            placeholder="Select account"
            disabled={isLoading}
          />
          {errors.accountId && (
            <FieldDescription className="text-destructive">
              {errors.accountId.message}
            </FieldDescription>
          )}
        </Field>

        {/* Transfer: To Account */}
        {transactionType === 'transfer' && (
          <Field>
            <FieldLabel htmlFor="toAccountId">To Account</FieldLabel>
            <AccountSelect
              value={watch('toAccountId')}
              onValueChange={(value) => setValue('toAccountId', value)}
              placeholder="Select destination account"
              excludeAccountId={accountId}
              disabled={isLoading}
            />
            {errors.toAccountId && (
              <FieldDescription className="text-destructive">
                {errors.toAccountId.message}
              </FieldDescription>
            )}
          </Field>
        )}

        {/* Category (not for transfers) */}
        {transactionType !== 'transfer' && (
          <Field>
            <FieldLabel htmlFor="categoryId">Category</FieldLabel>
            <CategorySelect
              value={watch('categoryId')}
              onValueChange={(value) => setValue('categoryId', value)}
              type={transactionType}
              placeholder="Select category"
              disabled={isLoading}
            />
            {errors.categoryId && (
              <FieldDescription className="text-destructive">
                {errors.categoryId.message}
              </FieldDescription>
            )}
          </Field>
        )}

        {/* Notes (Optional) */}
        <Field>
          <FieldLabel htmlFor="notes">Notes (Optional)</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Add any additional notes..."
            className="resize-none min-h-[100px]"
            {...register('notes')}
            disabled={isLoading}
          />
          <FieldDescription>
            Add any additional details about this transaction
          </FieldDescription>
          {errors.notes && (
            <FieldDescription className="text-destructive">
              {errors.notes.message}
            </FieldDescription>
          )}
        </Field>

        {/* Form Actions */}
        <Field>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Transaction' : 'Update Transaction'}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
