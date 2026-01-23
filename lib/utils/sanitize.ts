/**
 * Input sanitization utilities to prevent NoSQL injection and other attacks
 */

/**
 * Sanitizes input to prevent NoSQL injection attacks
 * Recursively removes any keys starting with '$' or containing '.'
 * which could be used for MongoDB operator injection
 * 
 * @param obj - The object to sanitize
 * @returns Sanitized object
 * @throws Error if malicious patterns are detected
 * 
 * @example
 * sanitizeInput({ name: 'John', $where: 'malicious' }) // throws Error
 * sanitizeInput({ name: 'John', age: 25 }) // returns { name: 'John', age: 25 }
 */
export function sanitizeInput<T>(obj: T): T {
  // Handle null, undefined, or non-objects
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeInput(item)) as T;
  }

  // Handle objects
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Reject keys starting with '$' (MongoDB operators)
    if (key.startsWith('$')) {
      throw new Error(`Invalid input: Keys starting with '$' are not allowed`);
    }
    
    // Reject keys containing '.' (MongoDB nested field operators)
    if (key.includes('.')) {
      throw new Error(`Invalid input: Keys containing '.' are not allowed`);
    }
    
    // Recursively sanitize nested objects and arrays
    sanitized[key] = sanitizeInput(value);
  }
  
  return sanitized as T;
}

/**
 * Validates that a string doesn't contain potential injection patterns
 * 
 * @param str - String to validate
 * @returns True if safe, throws error if malicious patterns detected
 */
export function validateStringInput(str: string): boolean {
  // Check for common injection patterns
  const dangerousPatterns = [
    /\$where/i,
    /\$regex/i,
    /javascript:/i,
    /<script/i,
    /eval\(/i,
    /new\s+Function/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(str)) {
      throw new Error('Invalid input: Potentially malicious pattern detected');
    }
  }
  
  return true;
}

/**
 * Sanitizes and validates request body
 * Combines sanitization with validation
 * 
 * @param body - Request body to sanitize
 * @returns Sanitized body
 */
export function sanitizeRequestBody<T>(body: T): T {
  try {
    return sanitizeInput(body);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Request validation failed: ${error.message}`);
    }
    throw new Error('Request validation failed: Unknown error');
  }
}
