import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, ValidationSchemas } from '@/lib/utils/validation';
import accountService from '@/lib/services/accountService';

// GET /api/accounts - List all accounts for the authenticated user
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const result = await accountService.getAll(request.userId);
  return ApiResponse.success(result);
});

// POST /api/accounts - Create a new account
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequest(ValidationSchemas.account.create, body);
  if (!validation.success) return validation.response;
  
  // Create account
  const account = await accountService.create(request.userId, validation.data);
  
  return ApiResponse.created(account, 'Account created successfully');
});
