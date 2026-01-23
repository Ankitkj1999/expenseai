# Error Handling Guide

## Overview

This document describes the improved error handling system implemented to ensure symmetric error handling between backend and frontend.

## Architecture

### Backend Error Response Format

All backend errors follow a consistent format:

```typescript
{
  success: false,
  error: string,        // Human-readable error message
  details?: Array<{     // Optional validation details
    field: string,
    message: string
  }>
}
```

### HTTP Status Codes

- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **413 Payload Too Large**: Request body exceeds size limit
- **500 Internal Server Error**: Unexpected server errors

## Frontend Error Handling

### API Client (`lib/api/client.ts`)

The Axios interceptor automatically:

1. **Extracts error messages** from `error` or `message` fields
2. **Attaches validation details** to the error object
3. **Adds status code** for easy error type checking
4. **Redirects to login** on 401 errors (except when already on auth pages)

```typescript
export interface ApiError extends Error {
  statusCode?: number;
  validationErrors?: Array<{ field: string; message: string }>;
}
```

### Error Handling Utilities (`lib/utils/errorHandling.ts`)

#### `handleApiError(error, fallbackMessage)`

Displays appropriate toast notifications based on error type:

```typescript
import { handleApiError } from '@/lib/utils/errorHandling';

try {
  await api.createTransaction(data);
} catch (error) {
  handleApiError(error, 'Failed to create transaction');
}
```

**Features:**
- Shows field-specific validation errors
- Displays up to 3 validation errors individually
- Shows summary for additional errors
- Falls back to general error message

#### `getErrorMessage(error, fallbackMessage)`

Extracts error message without displaying toast:

```typescript
import { getErrorMessage } from '@/lib/utils/errorHandling';

try {
  await api.login(email, password);
} catch (error) {
  const message = getErrorMessage(error, 'Login failed');
  setErrorMessage(message);
}
```

#### `isErrorStatus(error, statusCode)`

Checks if error matches specific HTTP status:

```typescript
import { isErrorStatus } from '@/lib/utils/errorHandling';

try {
  await api.deleteAccount(id);
} catch (error) {
  if (isErrorStatus(error, 404)) {
    console.log('Account not found');
  }
}
```

#### `isValidationError(error)`

Checks if error contains validation details:

```typescript
import { isValidationError } from '@/lib/utils/errorHandling';

try {
  await api.createBudget(data);
} catch (error) {
  if (isValidationError(error)) {
    // Handle validation errors specially
  }
}
```

#### `getValidationErrors(error)`

Extracts all validation errors:

```typescript
import { getValidationErrors } from '@/lib/utils/errorHandling';

try {
  await api.updateProfile(data);
} catch (error) {
  const errors = getValidationErrors(error);
  errors.forEach(({ field, message }) => {
    setFieldError(field, message);
  });
}
```

## Usage in React Query Hooks

### Example: Transaction Hook

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/lib/utils/errorHandling';
import { toast } from 'sonner';

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
      handleApiError(error, 'Failed to create transaction');
    },
  });
}
```

## Common Error Scenarios

### 1. Validation Errors

**Backend Response:**
```json
{
  "success": false,
  "error": "Amount must be positive",
  "details": [
    { "field": "amount", "message": "Amount must be positive" },
    { "field": "description", "message": "Description is required" }
  ]
}
```

**Frontend Handling:**
```typescript
// Automatically shows:
// Toast 1: "amount: Amount must be positive"
// Toast 2: "description: Description is required"
```

### 2. Authentication Errors

**Backend Response:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Frontend Handling:**
- Automatically redirects to `/login`
- Shows error toast if on auth page

### 3. Not Found Errors

**Backend Response:**
```json
{
  "success": false,
  "error": "Transaction not found"
}
```

**Frontend Handling:**
```typescript
// Shows toast: "Transaction not found"
```

### 4. Conflict Errors

**Backend Response:**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

**Frontend Handling:**
```typescript
// Shows toast: "User with this email already exists"
```

## Best Practices

### 1. Always Use Error Handling Utilities

❌ **Don't:**
```typescript
catch (error) {
  toast.error('Failed to create transaction');
}
```

✅ **Do:**
```typescript
catch (error) {
  handleApiError(error, 'Failed to create transaction');
}
```

### 2. Log Errors for Debugging

```typescript
catch (error) {
  console.error('Operation failed:', error);
  handleApiError(error, 'Operation failed');
}
```

### 3. Provide Contextual Fallback Messages

```typescript
// Specific to the operation
handleApiError(error, 'Failed to update budget');

// Not generic
handleApiError(error, 'An error occurred');
```

### 4. Handle Specific Error Types When Needed

```typescript
catch (error) {
  if (isErrorStatus(error, 409)) {
    // Handle conflict specially
    toast.error('This item already exists. Please use a different name.');
  } else {
    handleApiError(error, 'Failed to create item');
  }
}
```

## Testing Error Handling

### Manual Testing Checklist

- [ ] Validation errors display field-specific messages
- [ ] 401 errors redirect to login (except on auth pages)
- [ ] 404 errors show "not found" messages
- [ ] 409 errors show conflict messages
- [ ] Network errors show connection message
- [ ] Multiple validation errors display correctly
- [ ] Error messages are user-friendly

### Example Test Scenarios

1. **Invalid Email Format**
   - Enter invalid email in login form
   - Expected: "Invalid email address" toast

2. **Duplicate Resource**
   - Create category with existing name
   - Expected: "Category with this name already exists" toast

3. **Missing Required Fields**
   - Submit transaction form without amount
   - Expected: "amount: Amount is required" toast

4. **Unauthorized Access**
   - Access protected route without login
   - Expected: Redirect to `/login`

## Migration Guide

### Updating Existing Hooks

**Before:**
```typescript
onError: (error: Error) => {
  console.error('Failed:', error);
  toast.error('Failed to perform operation');
}
```

**After:**
```typescript
onError: (error) => {
  console.error('Failed:', error);
  handleApiError(error, 'Failed to perform operation');
}
```

### Updating Auth Pages

**Before:**
```typescript
catch (error) {
  const message = error instanceof Error ? error.message : 'Operation failed';
  toast.error(message);
}
```

**After:**
```typescript
catch (error) {
  const message = getErrorMessage(error, 'Operation failed');
  toast.error(message);
}
```

## Future Improvements

1. **Error Tracking Integration**
   - Send errors to Sentry/LogRocket
   - Track error rates and patterns

2. **Retry Logic**
   - Automatic retry for network errors
   - Exponential backoff

3. **Offline Support**
   - Queue operations when offline
   - Sync when connection restored

4. **User Feedback**
   - Allow users to report errors
   - Collect context for debugging

5. **Error Recovery**
   - Suggest actions to fix errors
   - Provide help links
