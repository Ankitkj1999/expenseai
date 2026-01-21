'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/categories';
import { queryKeys } from '@/lib/constants/queryKeys';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest, CategoryType } from '@/types';

/**
 * Hook to fetch all categories with optional type filtering
 * Categories are cached for 5 minutes since they don't change frequently
 */
export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: queryKeys.categories(type),
    queryFn: async () => {
      const categories = await categoriesApi.list();
      return type ? categories.filter(cat => cat.type === type) : categories;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

/**
 * Hook to create a new category
 * Automatically invalidates the categories cache on success
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => {
      // Invalidate all category queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    },
  });
}

/**
 * Hook to update a category
 * Automatically invalidates the categories cache on success
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    },
  });
}

/**
 * Hook to delete a category
 * Automatically invalidates the categories cache on success
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    },
  });
}
