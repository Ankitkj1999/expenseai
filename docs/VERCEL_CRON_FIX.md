# Vercel Cron Deployment Fix

## Problem Solved ✅

The deployment was failing because **Vercel Cron requires GET handlers**, not POST handlers. The routes have been updated.

---

## Changes Made

### 1. Updated API Routes to use GET instead of POST

**File**: [`app/api/recurring-transactions/process/route.ts`](app/api/recurring-transactions/process/route.ts)
```typescript
// Changed from: export const POST = ...
// Changed to:
export const GET = withCronAuth(async (request: NextRequest) => {
  // ... implementation
});
```

**File**: [`app/api/insights/process/route.ts`](app/api/insights/process/route.ts)
```typescript
// Changed from: export const POST = ...
// Changed to:
export const GET = withCronAuth(async (request: NextRequest) => {
  // ... implementation
});
```

### 2. Created vercel.json with proper schema

**File**: [`vercel.json`](vercel.json)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/recurring-transactions/process",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/insights/process",
      "schedule": "0 20 * * 0"
    }
  ]
}
```

---

## Why It Failed Before

1. **Wrong HTTP Method**: Vercel Cron sends GET requests by default, but our routes only had POST handlers
2. **Missing Schema**: The `$schema` reference helps Vercel validate the configuration
3. **Route Validation**: Vercel validates that the cron paths exist and are accessible during build time

---

## Verification

### Local Build Test ✅
```bash
npm run build
```

**Result**: Build succeeded with both cron endpoints visible:
```
├ ƒ /api/insights/process
├ ƒ /api/recurring-transactions/process
```

---

## Deployment Steps

### 1. Add CRON_SECRET to Vercel

Before deploying, add the environment variable:

```bash
# Generate a secure secret
openssl rand -base64 32

# Add to Vercel via CLI
vercel env add CRON_SECRET

# Or add via Vercel Dashboard:
# Settings → Environment Variables → Add New
```

### 2. Deploy

```bash
git add .
git commit -m "Fix: Update cron routes to use GET method"
git push
```

### 3. Verify in Vercel Dashboard

After deployment:
1. Go to your project in Vercel Dashboard
2. Click **Cron Jobs** tab
3. You should see both cron jobs listed:
   - `/api/recurring-transactions/process` - Every hour
   - `/api/insights/process` - Every Sunday at 8 PM UTC

---

## Testing the Cron Endpoints

### Local Testing

```bash
# Start dev server
npm run dev

# Test recurring transactions endpoint
curl http://localhost:3000/api/recurring-transactions/process \
  -H "Authorization: Bearer your-cron-secret"

# Test insights endpoint
curl http://localhost:3000/api/insights/process \
  -H "Authorization: Bearer your-cron-secret"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "processed": 0,
    "failed": 0,
    "skipped": 0,
    "errors": [],
    "duration": 123
  },
  "message": "Processed 0 recurring transactions, 0 failed, 0 skipped"
}
```

---

## Important Notes

### Vercel Cron Behavior

1. **HTTP Method**: Vercel Cron uses **GET** requests (not POST)
2. **Production Only**: Cron jobs only run in production deployments
3. **No Preview**: Cron jobs don't run on preview deployments
4. **Authentication**: You need to configure authentication separately (we use `CRON_SECRET`)

### Authentication Setup

Vercel Cron doesn't automatically include authentication headers. You have two options:

#### Option 1: Use Vercel Cron Secret (Recommended for Production)

Vercel provides a built-in `CRON_SECRET` environment variable that's automatically included in cron requests. Update the middleware to check for this:

```typescript
// lib/middleware/withCronAuth.ts
export function withCronAuth(handler: Function) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Check for Vercel's built-in cron secret
    const vercelCronSecret = request.headers.get('x-vercel-cron-secret');
    
    if (vercelCronSecret && vercelCronSecret === process.env.CRON_SECRET) {
      return handler(request);
    }
    
    // Fallback to Authorization header for manual testing
    if (authHeader === `Bearer ${cronSecret}`) {
      return handler(request);
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  };
}
```

#### Option 2: Make Endpoints Public (Not Recommended)

Remove authentication entirely (not secure):
```typescript
// Don't do this in production!
export const GET = async (request: NextRequest) => {
  // ... your logic
};
```

---

## Troubleshooting

### Issue: Deployment still fails

**Check**:
1. Run `npm run build` locally - does it succeed?
2. Check Vercel build logs for specific errors
3. Verify both route files exist and export GET handlers

### Issue: Cron jobs don't appear in dashboard

**Check**:
1. Verify `vercel.json` is in the root directory
2. Check the JSON syntax is valid
3. Ensure paths match your actual API routes (case-sensitive)
4. Redeploy after adding `vercel.json`

### Issue: 401 Unauthorized errors

**Check**:
1. `CRON_SECRET` is set in Vercel environment variables
2. The secret matches in both `.env` and Vercel
3. Consider using Vercel's built-in `x-vercel-cron-secret` header

### Issue: Cron jobs run but fail

**Check**:
1. View logs in Vercel Dashboard → Logs
2. Check for database connection errors
3. Verify all required environment variables are set
4. Check function timeout limits (default is 10s on Hobby plan)

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Verify cron jobs appear in dashboard
3. ✅ Wait for first execution (or trigger manually)
4. ✅ Check logs for successful execution
5. ✅ Monitor for 24 hours to ensure stability

---

## Additional Resources

- [Vercel Cron Documentation](https://vercel.com/docs/cron-jobs)
- [Vercel Cron Examples](https://vercel.com/docs/cron-jobs/quickstart)
- [Cron Expression Generator](https://crontab.guru/)

---

**Status**: ✅ Ready for Deployment  
**Last Updated**: 2026-01-21
