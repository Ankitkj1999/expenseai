import { NextResponse } from 'next/server';
import Category from '@/lib/db/models/Category';
import { withAuthAndDb, AuthenticatedRequest } from '@/lib/middleware/withAuthAndDb';
import { getUserCategories, initializeSystemCategories } from '@/lib/services/categoryService';

// GET /api/categories - List all categories (system + user's custom)
export const GET = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Get type filter from query params
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'expense' | 'income' | null;

  // Ensure system categories are initialized
  await initializeSystemCategories();

  // Get all categories for user
  const categories = await getUserCategories(request.userId, type || undefined);

  return NextResponse.json({
    categories,
    count: categories.length,
  });
});

// POST /api/categories - Create a custom category
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Parse request body
  const body = await request.json();
  const { name, type, icon, color } = body;

  // Validate required fields
  if (!name || !type) {
    return NextResponse.json(
      { error: 'Name and type are required' },
      { status: 400 }
    );
  }

  // Validate type
  if (type !== 'expense' && type !== 'income') {
    return NextResponse.json(
      { error: 'Type must be either "expense" or "income"' },
      { status: 400 }
    );
  }

  // Check if category with same name already exists for this user
  const existingCategory = await Category.findOne({
    userId: request.userId,
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    type,
  });

  if (existingCategory) {
    return NextResponse.json(
      { error: 'Category with this name already exists' },
      { status: 409 }
    );
  }

  // Create category
  const category = await Category.create({
    userId: request.userId,
    name,
    type,
    icon: icon || 'category',
    color: color || '#6B7280',
    isSystem: false,
  });

  return NextResponse.json(
    {
      message: 'Category created successfully',
      category,
    },
    { status: 201 }
  );
});
