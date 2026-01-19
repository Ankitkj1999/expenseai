'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import type { CategoryResponse, CategoryType } from '@/types';
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
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const response = await api.get<{ data: { categories: CategoryResponse[] } }>(
          'categories'
        );
        let cats = response.data.data.categories;
        
        // Filter by type if specified
        if (type) {
          cats = cats.filter(cat => cat.type === type);
        }
        
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, [type]);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => {
          const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS];
          
          return (
            <SelectItem key={category._id} value={category._id}>
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-4 w-4" style={{ color: category.color }} />}
                <span>{category.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
