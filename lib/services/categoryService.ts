import Category from '@/lib/db/models/Category';
import type { ICategory } from '@/lib/db/models/Category';

/**
 * Category Service
 * Handles all business logic for category operations
 */

export interface CreateCategoryDto {
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  type?: 'expense' | 'income';
  icon?: string;
  color?: string;
}

export const categoryService = {
  /**
   * Get all categories for a user (system + custom)
   * @param userId - User ID
   * @param type - Optional filter by type
   * @returns List of categories
   */
  async getAll(userId: string, type?: 'expense' | 'income'): Promise<ICategory[]> {
    const filter: { $or: Array<Record<string, unknown>>; type?: string } = {
      $or: [
        { isSystem: true },
        { userId, isSystem: false },
      ],
    };

    if (type) {
      filter.type = type;
    }

    return Category.find(filter).sort({ isSystem: -1, name: 1 });
  },

  /**
   * Get a single category by ID
   * @param categoryId - Category ID
   * @returns Category or null
   */
  async getById(categoryId: string): Promise<ICategory | null> {
    return Category.findById(categoryId);
  },

  /**
   * Create a custom category
   * @param userId - User ID
   * @param data - Category data
   * @returns Created category
   */
  async create(userId: string, data: CreateCategoryDto): Promise<ICategory> {
    return Category.create({
      userId,
      name: data.name,
      type: data.type,
      icon: data.icon ?? 'category',
      color: data.color ?? '#6B7280',
      isSystem: false,
    });
  },

  /**
   * Update a custom category
   * @param userId - User ID
   * @param categoryId - Category ID
   * @param data - Update data
   * @returns Updated category or null
   */
  async update(
    userId: string,
    categoryId: string,
    data: UpdateCategoryDto
  ): Promise<ICategory | null> {
    // First check if category exists and is editable
    const category = await Category.findById(categoryId);
    
    if (!category) return null;
    if (category.isSystem) return null; // Cannot edit system categories
    if (category.userId?.toString() !== userId) return null; // Not owner
    
    return Category.findByIdAndUpdate(
      categoryId,
      data,
      { new: true, runValidators: true }
    );
  },

  /**
   * Delete a custom category
   * @param userId - User ID
   * @param categoryId - Category ID
   * @returns True if deleted, false otherwise
   */
  async delete(userId: string, categoryId: string): Promise<boolean> {
    // First check if category exists and is deletable
    const category = await Category.findById(categoryId);
    
    if (!category) return false;
    if (category.isSystem) return false; // Cannot delete system categories
    if (category.userId?.toString() !== userId) return false; // Not owner
    
    await Category.findByIdAndDelete(categoryId);
    return true;
  },

  /**
   * Check if category with same name exists for user
   * @param userId - User ID
   * @param name - Category name
   * @param type - Category type
   * @returns True if exists
   */
  async existsByName(
    userId: string,
    name: string,
    type: 'expense' | 'income'
  ): Promise<boolean> {
    const count = await Category.countDocuments({
      userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type,
    });
    return count > 0;
  },

  /**
   * Initialize system categories if they don't exist
   * @returns Number of categories created
   */
  async initializeSystemCategories(): Promise<number> {
    const systemCategories = [
      // Expense categories
      { name: 'Food & Dining', type: 'expense', icon: 'restaurant', color: '#EF4444' },
      { name: 'Transportation', type: 'expense', icon: 'directions_car', color: '#3B82F6' },
      { name: 'Shopping', type: 'expense', icon: 'shopping_cart', color: '#8B5CF6' },
      { name: 'Entertainment', type: 'expense', icon: 'movie', color: '#EC4899' },
      { name: 'Bills & Utilities', type: 'expense', icon: 'receipt', color: '#F59E0B' },
      { name: 'Healthcare', type: 'expense', icon: 'local_hospital', color: '#10B981' },
      { name: 'Education', type: 'expense', icon: 'school', color: '#6366F1' },
      { name: 'Personal Care', type: 'expense', icon: 'spa', color: '#EC4899' },
      { name: 'Travel', type: 'expense', icon: 'flight', color: '#14B8A6' },
      { name: 'Other Expenses', type: 'expense', icon: 'more_horiz', color: '#6B7280' },
      
      // Income categories
      { name: 'Salary', type: 'income', icon: 'account_balance_wallet', color: '#10B981' },
      { name: 'Business', type: 'income', icon: 'business', color: '#3B82F6' },
      { name: 'Investments', type: 'income', icon: 'trending_up', color: '#8B5CF6' },
      { name: 'Gifts', type: 'income', icon: 'card_giftcard', color: '#EC4899' },
      { name: 'Other Income', type: 'income', icon: 'attach_money', color: '#6B7280' },
    ];

    let created = 0;
    for (const cat of systemCategories) {
      const exists = await Category.findOne({
        name: cat.name,
        type: cat.type,
        isSystem: true,
      });

      if (!exists) {
        await Category.create({
          ...cat,
          isSystem: true,
          userId: null,
        });
        created++;
      }
    }

    return created;
  },
};

export default categoryService;
