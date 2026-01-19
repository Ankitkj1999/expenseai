import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import * as goalService from '@/lib/services/goalService';

/**
 * GET /api/goals
 * List all goals for the authenticated user
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  
  const filters: {
    type?: string;
    status?: string;
    priority?: string;
  } = {};
  
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  
  if (type) filters.type = type;
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  
  const goals = await goalService.getGoals(request.userId, filters);
  
  return ApiResponse.success({
    data: goals,
    count: goals.length,
  });
});

/**
 * POST /api/goals
 * Create a new goal
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const body = await request.json();
  
  // Validate required fields
  if (!body.name || !body.type || !body.targetAmount) {
    return ApiResponse.badRequest('Missing required fields: name, type, targetAmount');
  }
  
  if (!['savings', 'debt_payoff', 'purchase'].includes(body.type)) {
    return ApiResponse.badRequest('Type must be savings, debt_payoff, or purchase');
  }
  
  if (body.targetAmount <= 0) {
    return ApiResponse.badRequest('Target amount must be greater than 0');
  }
  
  if (body.currentAmount && body.currentAmount < 0) {
    return ApiResponse.badRequest('Current amount cannot be negative');
  }
  
  if (body.priority && !['high', 'medium', 'low'].includes(body.priority)) {
    return ApiResponse.badRequest('Priority must be high, medium, or low');
  }
  
  const goal = await goalService.createGoal(request.userId, {
    name: body.name,
    type: body.type,
    targetAmount: body.targetAmount,
    currentAmount: body.currentAmount || 0,
    deadline: body.deadline ? new Date(body.deadline) : undefined,
    linkedAccountId: body.linkedAccountId,
    linkedCategoryId: body.linkedCategoryId,
    priority: body.priority || 'medium',
    metadata: body.metadata || {},
  });
  
  return ApiResponse.created(goal, 'Goal created successfully');
});
