'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAccount, useUpdateAccount } from '@/lib/hooks/useAccounts';
import type { CreateAccountRequest, Account } from '@/lib/api/accounts';
import { Wallet, Building2, CreditCard, Loader2 } from 'lucide-react';

interface AccountFormProps {
  mode: 'create' | 'edit';
  initialData?: Account;
  onSuccess?: () => void;
}

const accountTypes = [
  { value: 'cash', label: 'Cash', icon: Wallet },
  { value: 'bank', label: 'Bank Account', icon: Building2 },
  { value: 'credit', label: 'Credit Card', icon: CreditCard },
  { value: 'wallet', label: 'Digital Wallet', icon: Wallet },
] as const;

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const currencies = [
  { value: 'INR', label: '₹ INR - Indian Rupee' },
  { value: 'USD', label: '$ USD - US Dollar' },
  { value: 'EUR', label: '€ EUR - Euro' },
  { value: 'GBP', label: '£ GBP - British Pound' },
  { value: 'JPY', label: '¥ JPY - Japanese Yen' },
];

export function AccountForm({ mode, initialData, onSuccess }: AccountFormProps) {
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const [selectedColor, setSelectedColor] = useState(initialData?.color || predefinedColors[0]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountRequest>({
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'bank',
      balance: initialData?.balance || 0,
      currency: initialData?.currency || 'INR',
      color: initialData?.color || predefinedColors[0],
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: CreateAccountRequest) => {
    try {
      const payload = {
        ...data,
        color: selectedColor,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        {/* Account Name */}
        <Field>
          <FieldLabel htmlFor="name">Account Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Main Checking, Cash Wallet"
            {...register('name', {
              required: 'Account name is required',
              maxLength: {
                value: 50,
                message: 'Account name must be less than 50 characters',
              },
            })}
            disabled={isLoading}
          />
          {errors.name && (
            <FieldDescription className="text-destructive">
              {errors.name.message}
            </FieldDescription>
          )}
        </Field>

        {/* Account Type */}
        <Field>
          <FieldLabel htmlFor="type">Account Type</FieldLabel>
          <Select
            value={selectedType}
            onValueChange={(value) => setValue('type', value as 'cash' | 'bank' | 'credit' | 'wallet')}
            disabled={isLoading}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              {accountTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FieldDescription>
            Choose the type that best describes this account
          </FieldDescription>
        </Field>

        {/* Initial Balance */}
        <Field>
          <FieldLabel htmlFor="balance">
            {mode === 'create' ? 'Initial Balance' : 'Current Balance'}
          </FieldLabel>
          <Input
            id="balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('balance', {
              required: 'Balance is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Balance cannot be negative',
              },
            })}
            disabled={isLoading}
          />
          {errors.balance && (
            <FieldDescription className="text-destructive">
              {errors.balance.message}
            </FieldDescription>
          )}
          {mode === 'create' && (
            <FieldDescription>
              Enter the current balance in this account
            </FieldDescription>
          )}
        </Field>

        {/* Currency */}
        <Field>
          <FieldLabel htmlFor="currency">Currency</FieldLabel>
          <Select
            value={watch('currency')}
            onValueChange={(value) => setValue('currency', value)}
            disabled={isLoading}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            The currency for this account
          </FieldDescription>
        </Field>

        {/* Color Picker */}
        <Field>
          <FieldLabel>Account Color</FieldLabel>
          <div className="flex flex-wrap gap-3">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-10 w-10 rounded-full transition-all hover:scale-110 ${
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                    : 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-background hover:ring-muted-foreground'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
                disabled={isLoading}
              />
            ))}
          </div>
          <FieldDescription>
            Choose a color to identify this account
          </FieldDescription>
        </Field>

        {/* Submit Button */}
        <Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Account' : 'Update Account'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
