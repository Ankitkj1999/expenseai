import { NextResponse } from 'next/server';
import Category from '@/lib/db/models/Category';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';

// PUT /api/categories/[id] - Update a custom category
export const PUT = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  // Parse request body
  const body = await request.json();
  const { name, type, icon, color } = body;

  // Validate type if provided
  if (type && type !== 'expense' && type !== 'income') {
    return NextResponse.json(
      { error: 'Type must be either "expense" or "income"' },
      { status: 400 }
    );
  }

  // Find category and check ownership
  const category = await Category.findById(id);

  if (!category) {
    return NextResponse.json(
      { error: 'Category not found' },
      { status: 404 }
    );
  }

  // Prevent editing system categories
  if (category.isSystem) {
    return NextResponse.json(
      { error: 'Cannot edit system categories' },
      { status: 403 }
    );
  }

  // Verify ownership
  if (category.userId?.toString() !== request.userId) {
    return NextResponse.json(
      { error: 'Unauthorized to edit this category' },
      { status: 403 }
    );
  }

  // Update category
  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    {
      ...(name && { name }),
      ...(type && { type }),
      ...(icon && { icon }),
      ...(color && { color }),
    },
    { new: true, runValidators: true }
  );

  return NextResponse.json({
    message: 'Category updated successfully',
    category: updatedCategory,
  });
});

// DELETE /api/categories/[id] - Delete a custom category
export const DELETE = withAuthAndDb(async (
  request: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  // Await params (Next.js 15 requirement)
  const { id } = await context!.params;

  // Find category and check ownership
  const category = await Category.findById(id);

  if (!category) {
    return NextResponse.json(
      { error: 'Category not found' },
      { status: 404 }
    );
  }

  // Prevent deleting system categories
  if (category.isSystem) {
    return NextResponse.json(
      { error: 'Cannot delete system categories' },
      { status: 403 }
    );
  }

  // Verify ownership
  if (category.userId?.toString() !== request.userId) {
    return NextResponse.json(
      { error: 'Unauthorized to delete this category' },
      { status: 403 }
    );
  }

  // Delete category
  await Category.findByIdAndDelete(id);

  return NextResponse.json({
    message: 'Category deleted successfully',
  });
});
