import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/client';

/**
 * Handles API errors with appropriate user feedback
 * Displays validation errors field-by-field or a general error message
 * 
 * @param error - The error object from the API
 * @param fallbackMessage - Default message if no specific error is available
 * @returns The error message that was displayed
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = 'An error occurred'
): string {
  const apiError = error as ApiError;
  
  // Handle validation errors with field details
  if (apiError.validationErrors && apiError.validationErrors.length > 0) {
    // Show the first validation error as the primary message
    const firstError = apiError.validationErrors[0];
    const message = firstError.field 
      ? `${firstError.field}: ${firstError.message}`
      : firstError.message;
    
    toast.error(message);
    
    // If there are multiple validation errors, show them as additional toasts
    if (apiError.validationErrors.length > 1) {
      apiError.validationErrors.slice(1, 3).forEach((err) => {
        const msg = err.field ? `${err.field}: ${err.message}` : err.message;
        toast.error(msg);
      });
      
      // If there are more than 3 errors, show a summary
      if (apiError.validationErrors.length > 3) {
        toast.error(`...and ${apiError.validationErrors.length - 3} more validation errors`);
      }
    }
    
    return message;
  }
  
  // Handle general API errors
  const message = apiError.message || fallbackMessage;
  toast.error(message);
  
  return message;
}

/**
 * Gets a user-friendly error message from an error object
 * Does not display a toast - useful when you want to handle display yourself
 * 
 * @param error - The error object
 * @param fallbackMessage - Default message if no specific error is available
 * @returns The error message
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'An error occurred'
): string {
  const apiError = error as ApiError;
  
  // Return first validation error if available
  if (apiError.validationErrors && apiError.validationErrors.length > 0) {
    const firstError = apiError.validationErrors[0];
    return firstError.field 
      ? `${firstError.field}: ${firstError.message}`
      : firstError.message;
  }
  
  // Return general error message
  return apiError.message || fallbackMessage;
}

/**
 * Checks if an error is a specific HTTP status code
 * 
 * @param error - The error object
 * @param statusCode - The status code to check for
 * @returns True if the error matches the status code
 */
export function isErrorStatus(error: unknown, statusCode: number): boolean {
  const apiError = error as ApiError;
  return apiError.statusCode === statusCode;
}

/**
 * Checks if an error is a validation error
 * 
 * @param error - The error object
 * @returns True if the error has validation details
 */
export function isValidationError(error: unknown): boolean {
  const apiError = error as ApiError;
  return !!(apiError.validationErrors && apiError.validationErrors.length > 0);
}

/**
 * Gets all validation errors from an error object
 * 
 * @param error - The error object
 * @returns Array of validation errors or empty array
 */
export function getValidationErrors(
  error: unknown
): Array<{ field: string; message: string }> {
  const apiError = error as ApiError;
  return apiError.validationErrors || [];
}
