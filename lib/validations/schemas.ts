import { z } from 'zod';

/**
 * Frontend validation schemas matching backend validation
 * These schemas should be kept in sync with lib/utils/validation.ts on the backend
 */

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  /**
   * Email validation - matches backend
   */
  email: z.string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim()
    .max(255, 'Email cannot exceed 255 characters'),
  
  /**
   * Strong password validation - matches backend
   * - Minimum 12 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  /**
   * Hex color validation
   */
  hexColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
    .transform(val => val.toUpperCase()),
  
  /**
   * MongoDB ObjectId validation
   */
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
};

/**
 * Auth validation schemas
 */
export const AuthSchemas = {
  /**
   * Login schema
   */
  login: z.object({
    email: CommonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),
  
  /**
   * Registration schema
   */
  register: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: CommonSchemas.email,
    password: CommonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
  
  /**
   * Change password schema
   */
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: CommonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
};

/**
 * Account validation schemas
 */
export const AccountSchemas = {
  /**
   * Create account schema
   */
  create: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(50, 'Name cannot exceed 50 characters'),
    type: z.enum(['cash', 'bank', 'credit_card', 'investment', 'loan', 'other']),
    balance: z.number().default(0),
    currency: z.string().length(3).default('INR'),
    icon: z.string().optional(),
    color: CommonSchemas.hexColor.optional(),
  }),
  
  /**
   * Update account schema
   */
  update: z.object({
    name: z.string()
      .min(1)
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    type: z.enum(['cash', 'bank', 'credit_card', 'investment', 'loan', 'other']).optional(),
    balance: z.number().optional(),
    currency: z.string().length(3).optional(),
    icon: z.string().optional(),
    color: CommonSchemas.hexColor.optional(),
    isActive: z.boolean().optional(),
  }),
};

/**
 * Transaction validation schemas
 */
export const TransactionSchemas = {
  /**
   * Create transaction schema
   */
  create: z.object({
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z.number().positive('Amount must be positive'),
    description: z.string()
      .min(1, 'Description is required')
      .max(500, 'Description cannot exceed 500 characters'),
    accountId: z.string().min(1, 'Account is required'),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.string().datetime().optional(),
    attachments: z.array(z.string()).default([]),
    metadata: z.record(z.string(), z.unknown()).default({}),
  }).refine(
    (data) => data.type !== 'transfer' || data.toAccountId,
    { message: 'Destination account is required for transfers', path: ['toAccountId'] }
  ).refine(
    (data) => data.type === 'transfer' || data.categoryId,
    { message: 'Category is required for income and expenses', path: ['categoryId'] }
  ),
  
  /**
   * Update transaction schema
   */
  update: z.object({
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    amount: z.number().positive().optional(),
    description: z.string()
      .min(1)
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    accountId: z.string().optional(),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    date: z.string().datetime().optional(),
    attachments: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
};

/**
 * Budget validation schemas
 */
export const BudgetSchemas = {
  /**
   * Create budget schema
   */
  create: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name cannot exceed 100 characters'),
    categoryId: z.string().optional(),
    amount: z.number().positive('Amount must be greater than 0'),
    period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    alertThreshold: z.number().min(0).max(100).optional(),
  }).refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    { message: 'End date must be after start date', path: ['endDate'] }
  ),
  
  /**
   * Update budget schema
   */
  update: z.object({
    name: z.string()
      .min(1)
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    categoryId: z.string().optional(),
    amount: z.number().positive().optional(),
    period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    alertThreshold: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
};

/**
 * Category validation schemas
 */
export const CategorySchemas = {
  /**
   * Create category schema
   */
  create: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(50, 'Name cannot exceed 50 characters'),
    type: z.enum(['income', 'expense']),
    icon: z.string().default('category'),
    color: CommonSchemas.hexColor.default('#6B7280'),
  }),
  
  /**
   * Update category schema
   */
  update: z.object({
    name: z.string()
      .min(1)
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    type: z.enum(['income', 'expense']).optional(),
    icon: z.string().optional(),
    color: CommonSchemas.hexColor.optional(),
  }),
};

/**
 * Recurring transaction validation schemas
 */
export const RecurringTransactionSchemas = {
  /**
   * Create recurring transaction schema
   */
  create: z.object({
    type: z.enum(['income', 'expense']),
    amount: z.number().positive('Amount must be greater than 0'),
    description: z.string()
      .min(1, 'Description is required')
      .max(500, 'Description cannot exceed 500 characters'),
    accountId: z.string().min(1, 'Account is required'),
    categoryId: z.string().min(1, 'Category is required'),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1, 'Interval must be at least 1').default(1),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  }),
  
  /**
   * Update recurring transaction schema
   */
  update: z.object({
    type: z.enum(['income', 'expense']).optional(),
    amount: z.number().positive().optional(),
    description: z.string()
      .min(1)
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    accountId: z.string().optional(),
    categoryId: z.string().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    interval: z.number().min(1).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    isActive: z.boolean().optional(),
  }),
};
