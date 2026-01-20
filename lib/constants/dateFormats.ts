/**
 * Date Format Configuration
 * 
 * Centralized list of supported date formats for the application.
 * Used in user preferences and date display throughout the app.
 */

export interface DateFormatOption {
  value: string;
  label: string;
  example: string;
}

export const DATE_FORMATS: DateFormatOption[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)', example: '01/20/2026' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)', example: '20/01/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)', example: '2026-01-20' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '20 Jan 2026' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY', example: 'Jan 20, 2026' },
];

/**
 * Get date format by value
 */
export function getDateFormatByValue(value: string): DateFormatOption | undefined {
  return DATE_FORMATS.find(f => f.value === value);
}

/**
 * Get list of date format values for validation
 */
export const DATE_FORMAT_VALUES = DATE_FORMATS.map(f => f.value) as [string, ...string[]];

/**
 * Format a date according to the specified format
 * This is a placeholder - actual implementation should use date-fns
 */
export function formatDate(date: Date, format: string): string {
  // TODO: Implement with date-fns when needed
  // For now, return ISO format
  return date.toISOString().split('T')[0];
}
