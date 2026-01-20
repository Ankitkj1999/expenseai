/**
 * Currency Configuration
 * 
 * Centralized list of supported currencies for the application.
 * Used in user preferences, account creation, and transaction displays.
 */

export interface Currency {
  value: string;
  label: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$', name: 'US Dollar' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€', name: 'Euro' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£', name: 'British Pound' },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹', name: 'Indian Rupee' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥', name: 'Japanese Yen' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$', name: 'Australian Dollar' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$', name: 'Canadian Dollar' },
  { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF', name: 'Swiss Franc' },
  { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥', name: 'Chinese Yuan' },
  { value: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$', name: 'Singapore Dollar' },
  { value: 'HKD', label: 'Hong Kong Dollar (HK$)', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { value: 'NZD', label: 'New Zealand Dollar (NZ$)', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { value: 'SEK', label: 'Swedish Krona (kr)', symbol: 'kr', name: 'Swedish Krona' },
  { value: 'NOK', label: 'Norwegian Krone (kr)', symbol: 'kr', name: 'Norwegian Krone' },
  { value: 'DKK', label: 'Danish Krone (kr)', symbol: 'kr', name: 'Danish Krone' },
  { value: 'MXN', label: 'Mexican Peso ($)', symbol: '$', name: 'Mexican Peso' },
  { value: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$', name: 'Brazilian Real' },
  { value: 'ZAR', label: 'South African Rand (R)', symbol: 'R', name: 'South African Rand' },
  { value: 'KRW', label: 'South Korean Won (₩)', symbol: '₩', name: 'South Korean Won' },
  { value: 'THB', label: 'Thai Baht (฿)', symbol: '฿', name: 'Thai Baht' },
];

/**
 * Get currency by code
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.value === code);
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  return getCurrencyByCode(code)?.symbol || code;
}

/**
 * Format amount with currency
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount}`;
  
  // Format with proper decimal places
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${currency.symbol}${formatted}`;
}

/**
 * Get list of currency codes for validation
 */
export const CURRENCY_CODES = CURRENCIES.map(c => c.value) as [string, ...string[]];
