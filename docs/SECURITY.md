# Security Implementation Guide

This document outlines the security measures implemented in the ExpenseAI application.

## 🔐 Security Features Implemented

### 1. Strong Password Requirements

**Location**: [`lib/utils/validation.ts`](lib/utils/validation.ts)

Passwords must meet the following criteria:
- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*, etc.)

**Implementation**:
```typescript
password: z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
```

### 2. NoSQL Injection Prevention

**Location**: [`lib/utils/sanitize.ts`](lib/utils/sanitize.ts)

All request inputs are sanitized to prevent NoSQL injection attacks:
- Rejects keys starting with `$` (MongoDB operators)
- Rejects keys containing `.` (nested field operators)
- Recursively sanitizes nested objects and arrays
- Validates strings for dangerous patterns

**Implementation**:
```typescript
export function sanitizeInput<T>(obj: T): T {
  // Recursively removes MongoDB operators and dangerous patterns
  // Throws error if malicious patterns detected
}
```

**Integration**: Automatically applied in [`validateRequest()`](lib/utils/validation.ts) function.

### 3. Request Size Limits

**Locations**: 
- [`next.config.ts`](next.config.ts) - Global configuration
- [`lib/middleware/withSizeLimit.ts`](lib/middleware/withSizeLimit.ts) - Middleware implementation
- [`lib/middleware/withAuthAndDb.ts`](lib/middleware/withAuthAndDb.ts) - Integration

**Limits**:
- Auth routes: 100KB (login, register)
- API routes: 1MB (default)
- Upload routes: 10MB (for future file uploads)

**Purpose**: Prevents DoS attacks via large payloads.

### 4. Security Headers

**Location**: [`next.config.ts`](next.config.ts)

Implemented security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer info |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unnecessary features |
| `Content-Security-Policy` | See config | Prevents XSS and injection attacks |

### 5. Content Security Policy (CSP)

**Location**: [`next.config.ts`](next.config.ts)

CSP directives:
- `default-src 'self'` - Only load resources from same origin
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'` - Allow scripts (Next.js requirement)
- `style-src 'self' 'unsafe-inline'` - Allow styles (required for CSS-in-JS)
- `img-src 'self' data: https:` - Allow images from self, data URIs, and HTTPS
- `connect-src 'self' https://bedrock-runtime.*.amazonaws.com` - Allow API calls to AWS Bedrock
- `frame-ancestors 'none'` - Prevent embedding in iframes
- `base-uri 'self'` - Restrict base tag
- `form-action 'self'` - Restrict form submissions

## 🔒 Existing Security Features

### Authentication & Authorization
- JWT tokens with 7-day expiration
- HTTP-only cookies with `secure` flag in production
- `SameSite: lax` for CSRF protection
- bcrypt password hashing (10 salt rounds)
- User ownership verification on all data access

### Input Validation
- Zod schema validation on all inputs
- MongoDB ObjectId format validation
- Email validation with regex and normalization
- Enum constraints for transaction types, account types, etc.

### Database Security
- User isolation (all queries include userId filter)
- MongoDB transactions for atomic operations
- Proper indexes with userId for performance and security
- Schema-level validation

### API Security
- Cron job authentication with secret tokens
- Dual auth methods (Vercel header + Bearer token)
- Resource ownership verification
- System category protection

## 🚨 Remaining Security Recommendations

### High Priority
1. **Rate Limiting**: Implement rate limiting on all endpoints
   - Auth endpoints: 5 attempts per 15 minutes
   - API endpoints: 100 requests per 15 minutes per user
   - AI endpoints: 10 requests per minute per user
   
2. **Account Lockout**: Lock accounts after 5 failed login attempts

3. **Session Management**: Invalidate tokens on password change

### Medium Priority
4. **Audit Logging**: Log critical operations (login, password change, large transactions)

5. **Password History**: Prevent reuse of last 5 passwords

6. **CORS Configuration**: Explicitly configure CORS for production

### Low Priority
7. **Environment Validation**: Validate all required environment variables at startup

8. **Error Sanitization**: Ensure production errors don't leak sensitive information

## 📝 Usage Examples

### Using Strong Password Validation

```typescript
import { CommonSchemas } from '@/lib/utils/validation';

const schema = z.object({
  password: CommonSchemas.password,
});
```

### Using Input Sanitization

```typescript
import { sanitizeInput } from '@/lib/utils/sanitize';

// Automatically applied in validateRequest()
const validation = validateRequest(schema, body);
```

### Using Size Limits

```typescript
import { withSizeLimit, SIZE_LIMITS } from '@/lib/middleware/withSizeLimit';

// For custom size limits
export const POST = withSizeLimit(async (request) => {
  // Handler code
}, SIZE_LIMITS.auth);
```

## 🔍 Testing Security

### Test Password Requirements
```bash
# Should fail - too short
curl -X POST /api/auth/register -d '{"password": "Short1!"}'

# Should fail - no uppercase
curl -X POST /api/auth/register -d '{"password": "longpassword123!"}'

# Should succeed
curl -X POST /api/auth/register -d '{"password": "SecurePass123!"}'
```

### Test NoSQL Injection Prevention
```bash
# Should fail - MongoDB operator
curl -X POST /api/auth/login -d '{"email": {"$ne": null}, "password": "test"}'

# Should fail - nested operator
curl -X POST /api/transactions -d '{"amount": {"$gt": 0}}'
```

### Test Request Size Limits
```bash
# Should fail - payload too large
curl -X POST /api/auth/login -d "$(python -c 'print("a" * 200000)')"
```

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 🔄 Version History

- **v1.0.0** (2026-01-22): Initial security implementation
  - Strong password requirements
  - NoSQL injection prevention
  - Request size limits
  - Security headers and CSP
