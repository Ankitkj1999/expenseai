import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, ValidationSchemas } from '@/lib/utils/validation';
import accountService from '@/lib/services/accountService';

// GET /api/accounts/[id] - Get a specific account
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const account = await accountService.getById(request.userId, id);
  if (!account) return ApiResponse.notFound('Account');
  
  return ApiResponse.success({ account });
});

// PUT /api/accounts/[id] - Update an account
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequest(ValidationSchemas.account.update, body);
  if (!validation.success) return validation.response;
  
  // Update account
  const account = await accountService.update(request.userId, id, validation.data);
  if (!account) return ApiResponse.notFound('Account');
  
  return ApiResponse.successWithMessage({ account }, 'Account updated successfully');
});

// DELETE /api/accounts/[id] - Delete an account (soft delete)
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const account = await accountService.delete(request.userId, id);
  if (!account) return ApiResponse.notFound('Account');
  
  return ApiResponse.successWithMessage({}, 'Account deleted successfully');
});
