'use client';

import { useMemo } from 'react';
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
import * as Icons from 'lucide-react';

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
  const { data: categoriesData = [], isLoading } = useCategories(type);
  
  // Type-safe categories array
  const categories = categoriesData as Array<{
    _id: string;
    name: string;
    icon: string;
    color: string;
    type: CategoryType;
  }>;

  // Helper function to get icon component from icon name
  const getIconComponent = (iconName: string) => {
    const pascalCase = iconName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    // @ts-expect-error - Dynamic icon lookup
    return Icons[pascalCase] || Icons.Circle;
  };

  const selectedCategory = useMemo(() =>
    categories.find(cat => cat._id === value),
    [categories, value]
  );

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedCategory && (() => {
            const IconComponent = getIconComponent(selectedCategory.icon);
            return (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center h-6 w-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedCategory.color + '20' }}
                >
                  <IconComponent 
                    className="h-3.5 w-3.5" 
                    style={{ color: selectedCategory.color }} 
                  />
                </div>
                <span>{selectedCategory.name}</span>
              </div>
            );
          })()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          
          return (
            <SelectItem key={category._id} value={category._id}>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center h-6 w-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <IconComponent 
                    className="h-3.5 w-3.5" 
                    style={{ color: category.color }} 
                  />
                </div>
                <span>{category.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
