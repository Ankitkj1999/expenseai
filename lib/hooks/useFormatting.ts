'use client';

import { useUserPreferences } from '@/lib/contexts/UserPreferencesContext';
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/constants/currencies';
import { formatDate as formatDateUtil } from '@/lib/constants/dateFormats';

/**
 * Hook to format currency based on user preferences
 */
export function useCurrency() {
  const { preferences } = useUserPreferences();

  const formatCurrency = (amount: number, currencyOverride?: string): string => {
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
  };
}

/**
 * Hook to format dates based on user preferences
 */
export function useDate() {
  const { preferences } = useUserPreferences();

  const formatDate = (date: Date | string, formatOverride?: string): string => {
    const format = formatOverride || preferences.dateFormat;
    return formatDateUtil(date, format);
  };

  return {
    formatDate,
    dateFormat: preferences.dateFormat,
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
