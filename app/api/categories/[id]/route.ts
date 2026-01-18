import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Category from '@/lib/db/models/Category';
import { authenticate } from '@/lib/middleware/auth';

// PUT /api/categories/[id] - Update a custom category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params;
    
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Connect to database
    await connectDB();

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
    if (category.userId?.toString() !== auth.userId) {
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
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a custom category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params;
    
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

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
    if (category.userId?.toString() !== auth.userId) {
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
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
