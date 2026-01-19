import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/queryKeys';
import {
  analyticsApi,
  type SummaryParams,
  type TrendsParams,
  type CategoryBreakdownParams,
  type ComparisonParams,
} from '@/lib/api/analytics';

/**
 * Hook to fetch analytics summary
 */
export function useAnalyticsSummary(params?: SummaryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(params?.period),
    queryFn: () => analyticsApi.getSummary(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch spending trends
 */
export function useAnalyticsTrends(params?: TrendsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.trends(params?.period, params?.groupBy),
    queryFn: () => analyticsApi.getTrends(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch category breakdown
 */
export function useCategoryBreakdown(params?: CategoryBreakdownParams) {
  return useQuery({
    queryKey: queryKeys.analytics.categoryBreakdown(params?.type),
    queryFn: () => analyticsApi.getCategoryBreakdown(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch period comparison
 */
export function useAnalyticsComparison(params?: ComparisonParams) {
  return useQuery({
    queryKey: queryKeys.analytics.comparison(params?.currentPeriod),
    queryFn: () => analyticsApi.getComparison(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
