import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, ValidationSchemas } from '@/lib/utils/validation';
import budgetService from '@/lib/services/budgetService';

/**
 * GET /api/budgets/[id]
 * Get a single budget by ID
 */
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const budget = await budgetService.getBudgetById(id, request.userId);
  if (!budget) return ApiResponse.notFound('Budget');
  
  return ApiResponse.success(budget);
});

/**
 * PUT /api/budgets/[id]
 * Update a budget
 */
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequest(ValidationSchemas.budget.update, body);
  if (!validation.success) return validation.response;
  
  // Convert date strings to Date objects
  const updateData: Record<string, unknown> = { ...validation.data };
  if (validation.data.startDate) {
    updateData.startDate = new Date(validation.data.startDate);
  }
  if (validation.data.endDate) {
    updateData.endDate = new Date(validation.data.endDate);
  }
  
  const budget = await budgetService.updateBudget(id, request.userId, updateData);
  if (!budget) return ApiResponse.notFound('Budget');
  
  return ApiResponse.successWithMessage(budget, 'Budget updated successfully');
});

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
 */
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const deleted = await budgetService.deleteBudget(id, request.userId);
  if (!deleted) return ApiResponse.notFound('Budget');
  
  return ApiResponse.successWithMessage({}, 'Budget deleted successfully');
});
