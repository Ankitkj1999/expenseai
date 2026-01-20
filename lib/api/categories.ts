import { api } from './client';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types';

export const categoriesApi = {
  /**
   * Get all categories (system + user custom)
   */
  list: async (): Promise<CategoryResponse[]> => {
    const response = await api.get<{ data: { categories: CategoryResponse[]; count: number } }>('categories');
    return response.data.data.categories;
  },

  /**
   * Create a new custom category
   */
  create: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await api.post<{ data: CategoryResponse }>('categories', data);
    return response.data.data;
  },

  /**
   * Update an existing custom category
   */
  update: async (id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
    const response = await api.put<{ data: CategoryResponse }>(`categories/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a custom category
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`categories/${id}`);
  },
};
