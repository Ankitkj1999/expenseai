import { z } from 'zod';
import { ApiResponse } from './responses';
import { sanitizeInput } from './sanitize';
import type { NextResponse } from 'next/server';
import type { ApiErrorResponse } from './responses';
import {
  ACCOUNT_TYPES,
  TRANSACTION_TYPES,
  CATEGORY_TYPES,
  BUDGET_PERIODS,
} from '@/lib/constants/enums';

/**
 * Validation result types
 */
export type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export type ValidationFailure = {
  success: false;
  response: NextResponse<ApiErrorResponse>;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Validates request data against a Zod schema
 * Returns either validated data or an error response
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with either data or error response
 * 
 * @example
 * const result = validateRequest(createAccountSchema, body);
 * if (!result.success) return result.response;
 * const { name, type } = result.data;
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  // First, sanitize the input to prevent NoSQL injection
  try {
    const sanitizedData = sanitizeInput(data);
    const result = schema.safeParse(sanitizedData);
    
    if (!result.success) {
      const errors = result.error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return {
        success: false,
        response: ApiResponse.badRequest(
          errors[0].message,
          errors
        ),
      };
    }
    
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    // Handle sanitization errors
    return {
      success: false,
      response: ApiResponse.badRequest(
        error instanceof Error ? error.message : 'Invalid input detected',
        []
      ),
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 * Automatically parses URL search params
 * 
 * @param request - Request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with either data or error response
 * 
 * @example
 * const result = validateQueryParams(request, querySchema);
 * if (!result.success) return result.response;
 * const { type, startDate } = result.data;
 */
export function validateQueryParams<T>(
  request: Request,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  
  return validateRequest(schema, params);
}

/**
 * Common validation schemas for reuse
 */
export const CommonSchemas = {
  /**
   * MongoDB ObjectId validation
   */
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  
  /**
   * Email validation with comprehensive rules
   */
  email: z.string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim()
    .max(255, 'Email cannot exceed 255 characters'),
  
  /**
   * Strong password validation
   * - Minimum 12 characters
   * - Maximum 128 characters (prevents DoS via bcrypt resource exhaustion)
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password cannot exceed 128 characters')
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
   * Pagination parameters
   */
  pagination: z.object({
    limit: z.coerce.number().min(1).max(100).default(50),
    skip: z.coerce.number().min(0).default(0),
  }),
  
  /**
   * Date range parameters
   */
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  
  /**
   * Transaction type enum
   */
  transactionType: z.enum(TRANSACTION_TYPES),
  
  /**
   * Budget period enum
   */
  budgetPeriod: z.enum(BUDGET_PERIODS),
  
  /**
   * Account type enum
   */
  accountType: z.enum(ACCOUNT_TYPES),
  
  /**
   * Category type enum
   */
  categoryType: z.enum(CATEGORY_TYPES),
};

/**
 * Validation schemas for API routes
 */
export const ValidationSchemas = {
  /**
   * Account schemas
   */
  account: {
    create: z.object({
      name: z.string().min(1, 'Name is required').max(50, 'Name cannot exceed 50 characters'),
      type: CommonSchemas.accountType,
      balance: z.number().default(0),
      currency: z.string().length(3).default('INR'),
      icon: z.string().optional(),
      color: CommonSchemas.hexColor.optional(),
    }),
    
    update: z.object({
      name: z.string().min(1).max(50, 'Name cannot exceed 50 characters').optional(),
      type: CommonSchemas.accountType.optional(),
      balance: z.number().optional(),
      currency: z.string().length(3).optional(),
      icon: z.string().optional(),
      color: CommonSchemas.hexColor.optional(),
      isActive: z.boolean().optional(),
    }),
  },
  
  /**
   * Transaction schemas
   */
  transaction: {
    create: z.object({
      type: CommonSchemas.transactionType,
      amount: z.number().positive('Amount must be positive'),
      description: z.string().min(1, 'Description is required').max(500),
      accountId: CommonSchemas.objectId,
      toAccountId: CommonSchemas.objectId.optional(),
      categoryId: CommonSchemas.objectId.optional(),
      tags: z.array(z.string()).default([]),
      date: z.string().datetime().optional(),
      attachments: z.array(z.string()).default([]),
      aiGenerated: z.boolean().default(false),
      metadata: z.record(z.string(), z.unknown()).default({}),
    }).refine(
      (data) => data.type !== 'transfer' || data.toAccountId,
      { message: 'toAccountId is required for transfers', path: ['toAccountId'] }
    ).refine(
      (data) => data.type === 'transfer' || data.categoryId,
      { message: 'categoryId is required for expense and income', path: ['categoryId'] }
    ),
    
    update: z.object({
      type: CommonSchemas.transactionType.optional(),
      amount: z.number().positive().optional(),
      description: z.string().min(1).max(500).optional(),
      accountId: CommonSchemas.objectId.optional(),
      toAccountId: CommonSchemas.objectId.optional(),
      categoryId: CommonSchemas.objectId.optional(),
      tags: z.array(z.string()).optional(),
      date: z.string().datetime().optional(),
      attachments: z.array(z.string()).optional(),
      aiGenerated: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }),
    
    query: z.object({
      type: CommonSchemas.transactionType.optional(),
      accountId: CommonSchemas.objectId.optional(),
      categoryId: CommonSchemas.objectId.optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.coerce.number().min(1).max(100).default(50),
      skip: z.coerce.number().min(0).default(0),
    }),
  },
  
  /**
   * Category schemas
   */
  category: {
    create: z.object({
      name: z.string().min(1, 'Name is required').max(50, 'Name cannot exceed 50 characters'),
      type: CommonSchemas.categoryType,
      icon: z.string().default('category'),
      color: CommonSchemas.hexColor.default('#6B7280'),
    }),
    
    update: z.object({
      name: z.string().min(1).max(50, 'Name cannot exceed 50 characters').optional(),
      type: CommonSchemas.categoryType.optional(),
      icon: z.string().optional(),
      color: CommonSchemas.hexColor.optional(),
    }),
    
    query: z.object({
      type: CommonSchemas.categoryType.optional(),
    }),
  },
  
  /**
   * Budget schemas
   */
  budget: {
    create: z.object({
      name: z.string().min(1, 'Name is required').max(100),
      categoryId: CommonSchemas.objectId.optional(),
      amount: z.number().positive('Amount must be greater than 0'),
      period: CommonSchemas.budgetPeriod,
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      alertThreshold: z.number().min(0).max(100).optional(),
    }).refine(
      (data) => new Date(data.endDate) > new Date(data.startDate),
      { message: 'End date must be after start date', path: ['endDate'] }
    ),
    
    update: z.object({
      name: z.string().min(1).max(100).optional(),
      categoryId: CommonSchemas.objectId.optional(),
      amount: z.number().positive().optional(),
      period: CommonSchemas.budgetPeriod.optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      alertThreshold: z.number().min(0).max(100).optional(),
      isActive: z.boolean().optional(),
    }),
    
    query: z.object({
      isActive: z.enum(['true', 'false']).optional(),
      categoryId: CommonSchemas.objectId.optional(),
      period: CommonSchemas.budgetPeriod.optional(),
    }),
  },
  
  /**
   * Analytics schemas
   */
  analytics: {
    summary: z.object({
      period: z.enum(['today', 'week', 'month', 'year', 'custom']).default('month'),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).refine(
      (data) => data.period !== 'custom' || (data.startDate && data.endDate),
      { message: 'Custom period requires startDate and endDate', path: ['period'] }
    ),
    
    categoryBreakdown: z.object({
      type: CommonSchemas.categoryType.default('expense'),
      period: z.enum(['today', 'week', 'month', 'year', 'custom']).default('month'),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    
    trends: z.object({
      period: z.enum(['week', 'month', 'year']).default('month'),
      groupBy: z.enum(['day', 'week', 'month']).default('day'),
    }),
    
    comparison: z.object({
      currentPeriod: z.enum(['today', 'week', 'month', 'year']).default('month'),
      previousPeriod: z.enum(['today', 'week', 'month', 'year']).optional(),
    }),
  },
};
