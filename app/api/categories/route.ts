import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Category from '@/lib/db/models/Category';
import { authenticate } from '@/lib/middleware/auth';
import { getUserCategories, initializeSystemCategories } from '@/lib/services/categoryService';

// GET /api/categories - List all categories (system + user's custom)
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get type filter from query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'expense' | 'income' | null;

    // Ensure system categories are initialized
    await initializeSystemCategories();

    // Get all categories for user
    const categories = await getUserCategories(auth.userId, type || undefined);

    return NextResponse.json({
      categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a custom category
export async function POST(request: NextRequest) {
  try {
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

    // Connect to database
    await connectDB();

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      userId: auth.userId,
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
      userId: auth.userId,
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
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
