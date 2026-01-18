import { NextResponse } from 'next/server';

/**
 * Standardized API response helpers
 * Provides consistent response format across all API routes
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  total: number;
  limit: number;
  skip: number;
  count: number;
}

/**
 * API Response utility class
 * Simplifies response creation with consistent formatting
 */
export const ApiResponse = {
  /**
   * Success response with data
   * @param data - Response data
   * @param status - HTTP status code (default: 200)
   */
  success<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    );
  },

  /**
   * Success response with data and message
   * @param data - Response data
   * @param message - Success message
   * @param status - HTTP status code (default: 200)
   */
  successWithMessage<T>(
    data: T,
    message: string,
    status = 200
  ): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
      },
      { status }
    );
  },

  /**
   * Created response (201)
   * @param data - Created resource data
   * @param message - Optional success message
   */
  created<T>(data: T, message?: string): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        ...(message && { message }),
      },
      { status: 201 }
    );
  },

  /**
   * Paginated response with metadata
   * @param data - Array of items
   * @param total - Total count
   * @param limit - Items per page
   * @param skip - Items skipped
   */
  paginated<T>(
    data: T[],
    total: number,
    limit: number,
    skip: number
  ): NextResponse<PaginatedResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      total,
      limit,
      skip,
      count: data.length,
    });
  },

  /**
   * Error response
   * @param message - Error message
   * @param status - HTTP status code (default: 400)
   * @param details - Optional error details
   */
  error(
    message: string,
    status = 400,
    details?: unknown
  ): NextResponse<ApiErrorResponse> {
    const response: ApiErrorResponse = {
      success: false,
      error: message,
    };
    
    if (details !== undefined) {
      response.details = details;
    }
    
    return NextResponse.json(response, { status });
  },

  /**
   * Bad Request (400)
   * @param message - Error message
   * @param details - Optional validation details
   */
  badRequest(message: string, details?: unknown): NextResponse<ApiErrorResponse> {
    return this.error(message, 400, details);
  },

  /**
   * Unauthorized (401)
   * @param message - Error message (default: 'Unauthorized')
   */
  unauthorized(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
    return this.error(message, 401);
  },

  /**
   * Forbidden (403)
   * @param message - Error message (default: 'Forbidden')
   */
  forbidden(message = 'Forbidden'): NextResponse<ApiErrorResponse> {
    return this.error(message, 403);
  },

  /**
   * Not Found (404)
   * @param resource - Resource name (default: 'Resource')
   */
  notFound(resource = 'Resource'): NextResponse<ApiErrorResponse> {
    return this.error(`${resource} not found`, 404);
  },

  /**
   * Conflict (409)
   * @param message - Error message
   */
  conflict(message: string): NextResponse<ApiErrorResponse> {
    return this.error(message, 409);
  },

  /**
   * Internal Server Error (500)
   * @param message - Error message (default: 'Internal server error')
   */
  serverError(message = 'Internal server error'): NextResponse<ApiErrorResponse> {
    return this.error(message, 500);
  },

  /**
   * No Content (204)
   * Used for successful DELETE operations
   */
  noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  },
};
