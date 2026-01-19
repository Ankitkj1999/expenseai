'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelect } from './shared/CategorySelect';
import { DatePicker } from './shared/DatePicker';
import { useCreateBudget, useUpdateBudget } from '@/lib/hooks/useBudgets';
import type { CreateBudgetRequest, Budget } from '@/lib/api/budgets';
import { Calendar, Loader2, Target } from 'lucide-react';

interface BudgetFormProps {
  mode: 'create' | 'edit';
  initialData?: Budget;
  onSuccess?: () => void;
}

const periods = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

const alertThresholds = [
  { value: 50, label: '50% - Early Warning' },
  { value: 75, label: '75% - Standard' },
  { value: 80, label: '80% - Recommended' },
  { value: 90, label: '90% - Late Warning' },
  { value: 100, label: '100% - At Limit' },
];

export function BudgetForm({ mode, initialData, onSuccess }: BudgetFormProps) {
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateBudgetRequest>({
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId 
        ? (typeof initialData.categoryId === 'string' ? initialData.categoryId : initialData.categoryId._id)
        : undefined,
      amount: initialData?.amount || 0,
      period: initialData?.period || 'monthly',
      startDate: initialData?.startDate || new Date().toISOString(),
      endDate: initialData?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      alertThreshold: initialData?.alertThreshold || 80,
    },
  });

  const onSubmit = async (data: CreateBudgetRequest) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else if (initialData) {
        await updateMutation.mutateAsync({
          id: initialData._id,
          data,
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
        {/* Budget Name */}
        <Field>
          <FieldLabel htmlFor="name">Budget Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Monthly Groceries, Entertainment"
            {...register('name', {
              required: 'Budget name is required',
            })}
            disabled={isLoading}
          />
          {errors.name && (
            <FieldDescription className="text-destructive">
              {errors.name.message}
            </FieldDescription>
          )}
        </Field>

        {/* Category (Optional) */}
        <Field>
          <FieldLabel htmlFor="categoryId">Category (Optional)</FieldLabel>
          <CategorySelect
            value={watch('categoryId')}
            onValueChange={(value) => setValue('categoryId', value)}
            type="expense"
            placeholder="Select category or leave empty for all"
            disabled={isLoading}
          />
          <FieldDescription>
            Leave empty to track all expenses, or select a specific category
          </FieldDescription>
        </Field>

        {/* Amount */}
        <Field>
          <FieldLabel htmlFor="amount">Budget Amount</FieldLabel>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount', {
              required: 'Amount is required',
              valueAsNumber: true,
              min: {
                value: 0.01,
                message: 'Amount must be greater than 0',
              },
            })}
            disabled={isLoading}
          />
          {errors.amount && (
            <FieldDescription className="text-destructive">
              {errors.amount.message}
            </FieldDescription>
          )}
          <FieldDescription>
            Maximum amount you want to spend in this period
          </FieldDescription>
        </Field>

        {/* Period */}
        <Field>
          <FieldLabel htmlFor="period">Budget Period</FieldLabel>
          <Select
            value={watch('period')}
            onValueChange={(value) => setValue('period', value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
            disabled={isLoading}
          >
            <SelectTrigger id="period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{period.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            How often this budget resets
          </FieldDescription>
        </Field>

        {/* Start Date */}
        <Field>
          <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
          <DatePicker
            value={watch('startDate') ? new Date(watch('startDate')) : new Date()}
            onChange={(date) => date && setValue('startDate', date.toISOString())}
            disabled={isLoading}
          />
          {errors.startDate && (
            <FieldDescription className="text-destructive">
              {errors.startDate.message}
            </FieldDescription>
          )}
        </Field>

        {/* End Date */}
        <Field>
          <FieldLabel htmlFor="endDate">End Date</FieldLabel>
          <DatePicker
            value={watch('endDate') ? new Date(watch('endDate')) : new Date()}
            onChange={(date) => date && setValue('endDate', date.toISOString())}
            disabled={isLoading}
          />
          {errors.endDate && (
            <FieldDescription className="text-destructive">
              {errors.endDate.message}
            </FieldDescription>
          )}
          <FieldDescription>
            When this budget period ends
          </FieldDescription>
        </Field>

        {/* Alert Threshold */}
        <Field>
          <FieldLabel htmlFor="alertThreshold">Alert Threshold</FieldLabel>
          <Select
            value={watch('alertThreshold')?.toString()}
            onValueChange={(value) => setValue('alertThreshold', parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger id="alertThreshold">
              <SelectValue placeholder="Select threshold" />
            </SelectTrigger>
            <SelectContent>
              {alertThresholds.map((threshold) => (
                <SelectItem key={threshold.value} value={threshold.value.toString()}>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{threshold.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Get notified when you reach this percentage of your budget
          </FieldDescription>
        </Field>

        {/* Submit Button */}
        <Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Budget' : 'Update Budget'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
