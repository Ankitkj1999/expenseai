import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, validateQueryParams, ValidationSchemas } from '@/lib/utils/validation';
import budgetService from '@/lib/services/budgetService';

/**
 * GET /api/budgets
 * List all budgets for the authenticated user
 */
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Validate query parameters
  const validation = validateQueryParams(request, ValidationSchemas.budget.query);
  if (!validation.success) return validation.response;
  
  const { isActive, categoryId, period } = validation.data;
  
  const filters: {
    isActive?: boolean;
    categoryId?: string;
    period?: string;
  } = {};
  
  if (isActive !== undefined) {
    filters.isActive = isActive === 'true';
  }
  
  if (categoryId) {
    filters.categoryId = categoryId;
  }
  
  if (period) {
    filters.period = period;
  }
  
  const budgets = await budgetService.getBudgets(request.userId, filters);
  
  return ApiResponse.success({ data: budgets, count: budgets.length });
});

/**
 * POST /api/budgets
 * Create a new budget
 */
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequest(ValidationSchemas.budget.create, body);
  if (!validation.success) return validation.response;
  
  const data = validation.data;
  
  const budget = await budgetService.createBudget({
    userId: request.userId,
    name: data.name,
    categoryId: data.categoryId,
    amount: data.amount,
    period: data.period,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    alertThreshold: data.alertThreshold,
  });
  
  return ApiResponse.created(budget, 'Budget created successfully');
});
