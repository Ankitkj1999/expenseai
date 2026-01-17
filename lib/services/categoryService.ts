import Category, { DEFAULT_CATEGORIES } from '@/lib/db/models/Category';
import connectDB from '@/lib/db/mongodb';

/**
 * Initialize default system categories
 * Called once during app setup or when needed
 */
export async function initializeSystemCategories(): Promise<void> {
  try {
    await connectDB();

    // Check if system categories already exist
    const existingSystemCategories = await Category.countDocuments({ isSystem: true });
    
    if (existingSystemCategories > 0) {
      console.log('System categories already initialized');
      return;
    }

    // Create expense categories
    const expenseCategories = DEFAULT_CATEGORIES.expense.map((cat) => ({
      userId: null,
      name: cat.name,
      type: 'expense' as const,
      icon: cat.icon,
      color: cat.color,
      isSystem: true,
    }));

    // Create income categories
    const incomeCategories = DEFAULT_CATEGORIES.income.map((cat) => ({
      userId: null,
      name: cat.name,
      type: 'income' as const,
      icon: cat.icon,
      color: cat.color,
      isSystem: true,
    }));

    // Insert all categories
    await Category.insertMany([...expenseCategories, ...incomeCategories]);

    console.log('System categories initialized successfully');
  } catch (error) {
    console.error('Error initializing system categories:', error);
    throw error;
  }
}

/**
 * Get all categories for a user (system + user's custom categories)
 */
export async function getUserCategories(userId: string, type?: 'expense' | 'income') {
  await connectDB();

  interface CategoryFilter {
    $or: Array<{ isSystem: boolean } | { userId: string }>;
    type?: 'expense' | 'income';
  }

  const filter: CategoryFilter = {
    $or: [
      { isSystem: true },
      { userId },
    ],
  };

  if (type) {
    filter.type = type;
  }

  return Category.find(filter).sort({ isSystem: -1, name: 1 });
}
