'use client';

import { useUserPreferences } from '@/lib/contexts/UserPreferencesContext';
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/constants/currencies';
import { formatDate as formatDateUtil } from '@/lib/constants/dateFormats';

/**
 * Hook to format currency based on user preferences
 * Waits for preferences to load before formatting
 */
export function useCurrency() {
  const { preferences, isLoading } = useUserPreferences();

  const formatCurrency = (amount: number, currencyOverride?: string): string => {
    // Use override if provided, otherwise use loaded preferences
    const currency = currencyOverride || preferences.currency;
    return formatCurrencyUtil(amount, currency);
  };

  const getSymbol = (currencyOverride?: string): string => {
    const currency = currencyOverride || preferences.currency;
    return getCurrencySymbol(currency);
  };

  return {
    formatCurrency,
    getSymbol,
    currency: preferences.currency,
    isLoading, // Expose loading state so components can wait
  };
}

/**
 * Hook to format dates based on user preferences
 * Waits for preferences to load before formatting
 */
export function useDate() {
  const { preferences, isLoading } = useUserPreferences();

  const formatDate = (date: Date | string, formatOverride?: string): string => {
    const format = formatOverride || preferences.dateFormat;
    return formatDateUtil(date, format);
  };

  return {
    formatDate,
    dateFormat: preferences.dateFormat,
    isLoading, // Expose loading state so components can wait
  };
}

/**
 * Combined hook for both currency and date formatting
 */
export function useFormatting() {
  const currency = useCurrency();
  const date = useDate();

  return {
    ...currency,
    ...date,
  };
}
