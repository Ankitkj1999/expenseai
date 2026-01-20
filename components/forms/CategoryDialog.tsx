'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreateCategory, useUpdateCategory } from '@/lib/hooks/useCategories';
import type { CategoryResponse } from '@/types';
import {
  Utensils,
  Car,
  ShoppingCart,
  Receipt,
  Heart,
  Film,
  Home,
  BookOpen,
  Briefcase,
  TrendingUp,
  Gift,
  PiggyBank,
  Zap,
  Coffee,
  Smartphone,
  Plane,
  Dumbbell,
  Music,
  Shirt,
  type LucideIcon,
} from 'lucide-react';

// Available icons for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'shopping-cart': ShoppingCart,
  receipt: Receipt,
  heart: Heart,
  film: Film,
  home: Home,
  'book-open': BookOpen,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  gift: Gift,
  'piggy-bank': PiggyBank,
  zap: Zap,
  coffee: Coffee,
  smartphone: Smartphone,
  plane: Plane,
  dumbbell: Dumbbell,
  music: Music,
  shirt: Shirt,
};

// Available colors for categories
const CATEGORY_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#22c55e', label: 'Green' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#d946ef', label: 'Fuchsia' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f43f5e', label: 'Rose' },
];

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  type: z.enum(['expense', 'income']),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryResponse | null;
  onSuccess?: () => void;
}

export function CategoryDialog({ open, onOpenChange, category, onSuccess }: CategoryDialogProps) {
  const isEditing = !!category;
  
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: 'utensils',
      color: '#ef4444',
    },
  });

  // Update form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
      });
    } else {
      form.reset({
        name: '',
        type: 'expense',
        icon: 'utensils',
        color: '#ef4444',
      });
    }
  }, [category, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: category._id, data });
        toast.success('Category updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Category created successfully');
      }
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save category';
      toast.error(message);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const selectedIcon = form.watch('icon');
  const selectedColor = form.watch('color');
  const SelectedIconComponent = CATEGORY_ICONS[selectedIcon] || Utensils;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your custom category details'
              : 'Create a new custom category for your transactions'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries, Rent, Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 p-3 border rounded-lg bg-muted/30 max-h-[240px] overflow-y-auto">
                        {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => field.onChange(key)}
                            className={`relative flex items-center justify-center p-3 rounded-md transition-all ${
                              field.value === key
                                ? 'bg-primary/10 border-2 border-primary shadow-sm'
                                : 'border border-transparent hover:bg-accent hover:border-border'
                            }`}
                            title={key.replace('-', ' ')}
                          >
                            <Icon
                              className="h-5 w-5"
                              style={{ color: field.value === key ? selectedColor : 'currentColor' }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="grid grid-cols-6 sm:grid-cols-9 gap-3 p-3 border rounded-lg bg-muted/30">
                        {CATEGORY_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => field.onChange(color.value)}
                            className={`relative h-10 w-10 rounded-full transition-all hover:scale-105 ${
                              field.value === color.value
                                ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground shadow-md scale-105'
                                : 'hover:shadow-sm'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          >
                            {field.value === color.value && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 rounded-lg border bg-gradient-to-br from-muted/50 to-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center h-12 w-12 rounded-xl shadow-sm"
                  style={{
                    backgroundColor: selectedColor + '15',
                    border: `1px solid ${selectedColor}30`
                  }}
                >
                  <SelectedIconComponent className="h-6 w-6" style={{ color: selectedColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {form.watch('name') || 'Category name'}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {form.watch('type')} category
                  </p>
                </div>
              </div>
            </div>

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
