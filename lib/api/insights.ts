import { api } from './client';
import { IAIInsight } from '@/lib/db/models/AIInsight';

/**
 * API response types
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

/**
 * Insights API functions
 */
export const insightsApi = {
  /**
   * Get current cached insights for the authenticated user
   */
  list: async (): Promise<IAIInsight[]> => {
    const response = await api.get<ApiResponse<{ data: IAIInsight[]; count: number }>>('insights');
    return response.data.data.data;
  },

  /**
   * Manually trigger insight generation (rate-limited)
   */
  generate: async (): Promise<IAIInsight> => {
    const response = await api.post<ApiResponse<IAIInsight>>('insights');
    return response.data.data;
  },

  /**
   * Mark a specific insight as read
   */
  markAsRead: async (insightId: string, insightIndex: number): Promise<IAIInsight> => {
    const response = await api.put<ApiResponse<IAIInsight>>(`insights/${insightId}`, {
      json: { insightIndex },
    });
    return response.data.data;
  },

  /**
   * Delete an insight
   */
  delete: async (insightId: string): Promise<void> => {
    await api.delete(`insights/${insightId}`);
  },
};
