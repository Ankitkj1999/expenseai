import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { ApiResponse } from '@/lib/utils/responses';
import { validateRequest, ValidationSchemas } from '@/lib/utils/validation';
import categoryService from '@/lib/services/categoryService';

// PUT /api/categories/[id] - Update a custom category
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequest(ValidationSchemas.category.update, body);
  if (!validation.success) return validation.response;
  
  // Update category
  const category = await categoryService.update(request.userId, id, validation.data);
  
  if (!category) {
    // Could be: not found, system category, or not owner
    const existing = await categoryService.getById(id);
    if (!existing) return ApiResponse.notFound('Category');
    if (existing.isSystem) return ApiResponse.forbidden('Cannot edit system categories');
    return ApiResponse.forbidden('Unauthorized to edit this category');
  }
  
  return ApiResponse.successWithMessage({ category }, 'Category updated successfully');
});

// DELETE /api/categories/[id] - Delete a custom category
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  const { id } = await context!.params;
  
  // Delete category
  const deleted = await categoryService.delete(request.userId, id);
  
  if (!deleted) {
    // Could be: not found, system category, or not owner
    const existing = await categoryService.getById(id);
    if (!existing) return ApiResponse.notFound('Category');
    if (existing.isSystem) return ApiResponse.forbidden('Cannot delete system categories');
    return ApiResponse.forbidden('Unauthorized to delete this category');
  }
  
  return ApiResponse.successWithMessage({}, 'Category deleted successfully');
});
