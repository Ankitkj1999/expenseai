'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategorySelect } from './shared/CategorySelect';
import { AccountSelect } from './shared/AccountSelect';
import { DatePicker } from './shared/DatePicker';
import { useCreateRecurringTransaction, useUpdateRecurringTransaction } from '@/lib/hooks/useRecurringTransactions';
import type { CreateRecurringTransactionRequest, RecurringTransaction } from '@/lib/api/recurring';
import { TrendingDown, TrendingUp, Repeat, Loader2, Calendar } from 'lucide-react';

interface RecurringTransactionFormProps {
  mode: 'create' | 'edit';
  initialData?: RecurringTransaction;
  onSuccess?: () => void;
}

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function RecurringTransactionForm({ mode, initialData, onSuccess }: RecurringTransactionFormProps) {
  const createMutation = useCreateRecurringTransaction();
  const updateMutation = useUpdateRecurringTransaction();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateRecurringTransactionRequest>({
    defaultValues: {
      type: initialData?.type || 'expense',
      amount: initialData?.amount || 0,
      description: initialData?.description || '',
      accountId: initialData?.accountId 
        ? (typeof initialData.accountId === 'string' ? initialData.accountId : initialData.accountId._id)
        : '',
      categoryId: initialData?.categoryId
        ? (typeof initialData.categoryId === 'string' ? initialData.categoryId : initialData.categoryId._id)
        : '',
      frequency: initialData?.frequency || 'monthly',
      interval: initialData?.interval || 1,
      startDate: initialData?.startDate || new Date().toISOString(),
      endDate: initialData?.endDate || undefined,
      metadata: {
        dayOfMonth: initialData?.metadata?.dayOfMonth,
        dayOfWeek: initialData?.metadata?.dayOfWeek,
        notes: initialData?.metadata?.notes || '',
      },
    },
  });

  const transactionType = watch('type');
  const frequency = watch('frequency');

  const onSubmit = async (data: CreateRecurringTransactionRequest) => {
    try {
      const payload = {
        ...data,
        metadata: {
          ...data.metadata,
          notes: data.metadata?.notes || undefined,
        },
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
      } else if (initialData) {
        await updateMutation.mutateAsync({
          id: initialData._id,
          data: payload,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* Transaction Type */}
        <Field>
          <FieldLabel>Transaction Type</FieldLabel>
          <Tabs
            value={transactionType}
            onValueChange={(value) => setValue('type', value as 'expense' | 'income')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="expense"
                disabled={isLoading}
                className="data-[state=active]:text-red-600"
              >
                <TrendingDown className="h-4 w-4" />
                Expense
              </TabsTrigger>
              <TabsTrigger
                value="income"
                disabled={isLoading}
                className="data-[state=active]:text-green-600"
              >
                <TrendingUp className="h-4 w-4" />
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            {...register('amount', {
              required: 'Amount is required',
              valueAsNumber: true,
              min: {
                value: 0.01,
                message: 'Amount must be greater than 0',
              },
            })}
            disabled={isLoading}
            onWheel={(e) => e.currentTarget.blur()}
          />
          {errors.amount && (
            <FieldDescription className="text-destructive">
              {errors.amount.message}
            </FieldDescription>
          )}
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Input
            id="description"
            type="text"
            placeholder="e.g., Netflix Subscription, Monthly Salary"
            {...register('description', {
              required: 'Description is required',
              maxLength: {
                value: 500,
                message: 'Description must be less than 500 characters',
              },
            })}
            disabled={isLoading}
          />
          {errors.description && (
            <FieldDescription className="text-destructive">
              {errors.description.message}
            </FieldDescription>
          )}
        </Field>

        {/* Account */}
        <Field>
          <FieldLabel htmlFor="accountId">Account</FieldLabel>
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

        {/* Category */}
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

        {/* Frequency */}
        <Field>
          <FieldLabel htmlFor="frequency">Frequency</FieldLabel>
          <Select
            value={frequency}
            onValueChange={(value) => setValue('frequency', value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
            disabled={isLoading}
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    <span>{freq.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            How often this transaction repeats
          </FieldDescription>
        </Field>

        {/* Interval */}
        <Field>
          <FieldLabel htmlFor="interval">Repeat Every</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="interval"
              type="number"
              min="1"
              placeholder="1"
              className="w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              {...register('interval', {
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: 'Interval must be at least 1',
                },
              })}
              disabled={isLoading}
              onWheel={(e) => e.currentTarget.blur()}
            />
            <span className="text-sm text-muted-foreground">
              {frequency === 'daily' && 'day(s)'}
              {frequency === 'weekly' && 'week(s)'}
              {frequency === 'monthly' && 'month(s)'}
              {frequency === 'yearly' && 'year(s)'}
            </span>
          </div>
          {errors.interval && (
            <FieldDescription className="text-destructive">
              {errors.interval.message}
            </FieldDescription>
          )}
          <FieldDescription>
            E.g., &quot;2&quot; for every 2 {frequency === 'monthly' ? 'months' : frequency === 'weekly' ? 'weeks' : frequency === 'yearly' ? 'years' : 'days'}
          </FieldDescription>
        </Field>

        {/* Day of Week (for weekly) */}
        {frequency === 'weekly' && (
          <Field>
            <FieldLabel htmlFor="dayOfWeek">Day of Week</FieldLabel>
            <Select
              value={watch('metadata.dayOfWeek')?.toString()}
              onValueChange={(value) => setValue('metadata.dayOfWeek', parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger id="dayOfWeek">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Which day of the week to repeat on
            </FieldDescription>
          </Field>
        )}

        {/* Day of Month (for monthly) */}
        {frequency === 'monthly' && (
          <Field>
            <FieldLabel htmlFor="dayOfMonth">Day of Month</FieldLabel>
            <Input
              id="dayOfMonth"
              type="number"
              min="1"
              max="31"
              placeholder="1"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              {...register('metadata.dayOfMonth', {
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: 'Day must be between 1 and 31',
                },
                max: {
                  value: 31,
                  message: 'Day must be between 1 and 31',
                },
              })}
              disabled={isLoading}
              onWheel={(e) => e.currentTarget.blur()}
            />
            <FieldDescription>
              Which day of the month to repeat on (1-31)
            </FieldDescription>
          </Field>
        )}

        {/* Start Date */}
        <Field>
          <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
          <DatePicker
            value={watch('startDate') ? new Date(watch('startDate')!) : new Date()}
            onChange={(date) => date && setValue('startDate', date.toISOString())}
            disabled={isLoading}
          />
          <FieldDescription>
            When to start creating transactions
          </FieldDescription>
        </Field>

        {/* End Date (Optional) */}
        <Field>
          <FieldLabel htmlFor="endDate">End Date (Optional)</FieldLabel>
          <DatePicker
            value={watch('endDate') ? new Date(watch('endDate')!) : undefined}
            onChange={(date) => setValue('endDate', date?.toISOString())}
            disabled={isLoading}
          />
          <FieldDescription>
            Leave empty for recurring indefinitely
          </FieldDescription>
        </Field>

        {/* Notes (Optional) */}
        <Field>
          <FieldLabel htmlFor="notes">Notes (Optional)</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Add any additional notes..."
            className="resize-none min-h-[80px]"
            {...register('metadata.notes')}
            disabled={isLoading}
          />
          <FieldDescription>
            Additional information about this recurring transaction
          </FieldDescription>
        </Field>

        {/* Submit Button */}
        <Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Recurring Transaction' : 'Update Recurring Transaction'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
