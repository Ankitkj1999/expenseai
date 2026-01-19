import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as goalService from '@/lib/services/goalService';

/**
 * GET /api/goals/[id]
 * Get a specific goal
 */
export const GET = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  const goal = await goalService.getGoalById(request.userId, id);
  
  if (!goal) {
    return ApiResponse.notFound('Goal');
  }
  
  return ApiResponse.success(goal);
});

/**
 * PUT /api/goals/[id]
 * Update a goal
 */
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  const body = await request.json();
  
  // Validate type if provided
  if (body.type && !['savings', 'debt_payoff', 'purchase'].includes(body.type)) {
    return ApiResponse.badRequest('Type must be savings, debt_payoff, or purchase');
  }
  
  // Validate amounts if provided
  if (body.targetAmount !== undefined && body.targetAmount <= 0) {
    return ApiResponse.badRequest('Target amount must be greater than 0');
  }
  
  if (body.currentAmount !== undefined && body.currentAmount < 0) {
    return ApiResponse.badRequest('Current amount cannot be negative');
  }
  
  // Validate priority if provided
  if (body.priority && !['high', 'medium', 'low'].includes(body.priority)) {
    return ApiResponse.badRequest('Priority must be high, medium, or low');
  }
  
  // Validate status if provided
  if (body.status && !['active', 'completed', 'paused'].includes(body.status)) {
    return ApiResponse.badRequest('Status must be active, completed, or paused');
  }
  
  const updates: Record<string, unknown> = {};
  
  if (body.name) updates.name = body.name;
  if (body.type) updates.type = body.type;
  if (body.targetAmount !== undefined) updates.targetAmount = body.targetAmount;
  if (body.currentAmount !== undefined) updates.currentAmount = body.currentAmount;
  if (body.deadline !== undefined) updates.deadline = body.deadline ? new Date(body.deadline) : null;
  if (body.linkedAccountId !== undefined) updates.linkedAccountId = body.linkedAccountId || null;
  if (body.linkedCategoryId !== undefined) updates.linkedCategoryId = body.linkedCategoryId || null;
  if (body.priority) updates.priority = body.priority;
  if (body.status) updates.status = body.status;
  if (body.metadata) updates.metadata = body.metadata;
  
  const goal = await goalService.updateGoal(request.userId, id, updates);
  
  if (!goal) {
    return ApiResponse.notFound('Goal');
  }
  
  return ApiResponse.successWithMessage(goal, 'Goal updated successfully');
});

/**
 * DELETE /api/goals/[id]
 * Delete a goal
 */
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  await goalService.deleteGoal(request.userId, id);
  
  return ApiResponse.successWithMessage({}, 'Goal deleted successfully');
});
