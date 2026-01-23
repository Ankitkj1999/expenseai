import { NextRequest, NextResponse } from 'next/server';

/**
 * Request size limit configuration
 */
const SIZE_LIMITS = {
  // Default limit for most API routes (1MB)
  default: 1 * 1024 * 1024, // 1MB
  
  // Larger limit for file uploads if needed in future (10MB)
  upload: 10 * 1024 * 1024, // 10MB
  
  // Smaller limit for auth routes (100KB)
  auth: 100 * 1024, // 100KB
};

/**
 * Validates request body size to prevent DoS attacks
 * 
 * @param request - Next.js request object
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if valid, throws error if too large
 */
export async function validateRequestSize(
  request: NextRequest,
  maxSize: number = SIZE_LIMITS.default
): Promise<boolean> {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    
    if (size > maxSize) {
      throw new Error(
        `Request body too large. Maximum size is ${maxSize / 1024}KB, received ${size / 1024}KB`
      );
    }
  }
  
  return true;
}

/**
 * Middleware wrapper to enforce request size limits
 * 
 * @param handler - Route handler function
 * @param maxSize - Maximum allowed size in bytes
 * @returns Wrapped handler with size validation
 * 
 * @example
 * export const POST = withSizeLimit(async (request) => {
 *   // Handler code
 * }, SIZE_LIMITS.auth);
 */
export function withSizeLimit<T = unknown>(
  handler: (request: NextRequest, context?: T) => Promise<Response>,
  maxSize: number = SIZE_LIMITS.default
) {
  return async (request: NextRequest, context?: T): Promise<Response> => {
    try {
      await validateRequestSize(request, maxSize);
      return await handler(request, context);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Request too large',
        },
        { status: 413 } // 413 Payload Too Large
      );
    }
  };
}

export { SIZE_LIMITS };
