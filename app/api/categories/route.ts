import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, validateQueryParams, ValidationSchemas } from '@/lib/utils/validation';
import categoryService from '@/lib/services/categoryService';

// GET /api/categories - List all categories (system + user's custom)
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Validate query parameters
  const validation = validateQueryParams(request, ValidationSchemas.category.query);
  if (!validation.success) return validation.response;
  
  // Get all categories for user (system categories already exist in DB)
  const categories = await categoryService.getAll(request.userId, validation.data.type);
  
  return ApiResponse.success({ categories, count: categories.length });
});

// POST /api/categories - Create a custom category
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequest(ValidationSchemas.category.create, body);
  if (!validation.success) return validation.response;
  
  // Check if category with same name already exists
  const exists = await categoryService.existsByName(
    request.userId,
    validation.data.name,
    validation.data.type
  );
  
  if (exists) {
    return ApiResponse.conflict('Category with this name already exists');
  }
  
  // Create category
  const category = await categoryService.create(request.userId, validation.data);
  
  return ApiResponse.created(category, 'Category created successfully');
});
