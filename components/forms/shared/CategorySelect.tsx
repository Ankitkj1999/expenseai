'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/lib/hooks/useCategories';
import type { CategoryType } from '@/types';
import { 
  Utensils, Car, ShoppingCart, Receipt, Heart, Film, 
  Home, BookOpen, Briefcase, TrendingUp, Gift 
} from 'lucide-react';

// Icon mapping for categories
const CATEGORY_ICONS = {
  Utensils, Car, ShoppingCart, Receipt, Heart, Film,
  Home, BookOpen, Briefcase, TrendingUp, Gift,
} as const;

interface CategorySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  type?: CategoryType;
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onValueChange,
  type,
  placeholder = 'Select category',
  disabled = false,
}: CategorySelectProps) {
  const { data: categories = [], isLoading } = useCategories(type);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const selectedCategory = categories.find(cat => cat._id === value);
  const SelectedIcon = selectedCategory
    ? CATEGORY_ICONS[selectedCategory.icon as keyof typeof CATEGORY_ICONS]
    : null;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedCategory && (
            <div className="flex items-center gap-2">
              {SelectedIcon && (
                <SelectedIcon
                  className="h-4 w-4"
                  style={{ color: selectedCategory.color }}
                />
              )}
              <span>{selectedCategory.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => {
          const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS];
          
          return (
            <SelectItem key={category._id} value={category._id}>
              <div className="flex items-center gap-2">
                {IconComponent && (
                  <IconComponent
                    className="h-4 w-4"
                    style={{ color: category.color }}
                  />
                )}
                <span>{category.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
