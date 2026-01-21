# Vercel Cron Deployment Debugging Guide

## Current Status

**Issue**: GitHub checks failing with "Deployment failed" before build starts  
**Root Cause**: Vercel validates `vercel.json` and cron endpoints before building

---

## Diagnostic Steps

### 1. Verify Local Build ✅

```bash
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
├ ƒ /api/insights/process
├ ƒ /api/recurring-transactions/process
```

**Status**: ✅ PASSING

---

### 2. Verify vercel.json Syntax ✅

Current configuration:
```json
{
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

**Status**: ✅ VALID

---

### 3. Verify Routes Exist ✅

- ✅ [`app/api/recurring-transactions/process/route.ts`](app/api/recurring-transactions/process/route.ts) exists
- ✅ [`app/api/insights/process/route.ts`](app/api/insights/process/route.ts) exists
- ✅ Both export `GET` handlers (required by Vercel Cron)

---

## Possible Causes of GitHub Check Failure

### Cause 1: Vercel Cannot Reach Endpoints During Validation

**Hypothesis**: Vercel tries to validate cron endpoints are accessible, but authentication blocks them.

**Solution**: Temporarily make endpoints public for deployment validation, then secure them after.

#### Option A: Add Public Health Check Endpoint

Create a simple health check that Vercel can validate:

```typescript
// app/api/recurring-transactions/process/route.ts
export async function GET(request: NextRequest) {
  // Check if this is a health check (no auth headers)
  const authHeader = request.headers.get('authorization');
  const vercelCronSecret = request.headers.get('x-vercel-cron-secret');
  
  // If no auth provided, return 200 OK for Vercel validation
  if (!authHeader && !vercelCronSecret) {
    return NextResponse.json({ status: 'ready' }, { status: 200 });
  }
  
  // Otherwise, require authentication
  return withCronAuth(actualHandler)(request);
}
```

#### Option B: Temporarily Disable Authentication

For initial deployment only:

1. Comment out authentication in both route files
2. Deploy to Vercel
3. Verify cron jobs appear in dashboard
4. Re-enable authentication
5. Redeploy

---

### Cause 2: Environment Variables Not Set

**Check**: Ensure `CRON_SECRET` is set in Vercel

```bash
# Via CLI
vercel env ls

# Or check Vercel Dashboard:
# Settings → Environment Variables
```

**Fix**: Add if missing:
```bash
vercel env add CRON_SECRET
# Enter your secret when prompted
```

---

### Cause 3: Build Output API Issue

Vercel might be having issues with the build output format.

**Test**: Try deploying without `vercel.json` first:

```bash
# Rename vercel.json temporarily
mv vercel.json vercel.json.backup

# Deploy
git add .
git commit -m "Test: Deploy without cron config"
git push

# If successful, restore vercel.json
mv vercel.json.backup vercel.json
```

---

### Cause 4: Vercel Project Configuration

**Check**: Vercel project settings might have conflicting configuration.

**Fix**:
1. Go to Vercel Dashboard → Your Project → Settings
2. Check "General" tab for any conflicting settings
3. Check "Functions" tab for any overrides
4. Check "Environment Variables" tab

---

## Recommended Approach

### Step 1: Deploy Without Cron First

```bash
# Remove vercel.json
rm vercel.json

# Deploy
git add .
git commit -m "Deploy without cron config"
git push
```

**Expected**: Deployment should succeed ✅

---

### Step 2: Add Cron Config Gradually

Once base deployment works, add cron config:

```bash
# Restore vercel.json
git checkout vercel.json

# Deploy
git add .
git commit -m "Add cron configuration"
git push
```

---

### Step 3: Check Vercel Dashboard

After deployment:
1. Go to Vercel Dashboard → Your Project
2. Click "Cron Jobs" tab
3. Verify both cron jobs appear

---

## Alternative: Use Vercel CLI for Debugging

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link project
vercel link

# Deploy with verbose output
vercel --prod --debug
```

This will show detailed logs of what Vercel is doing during deployment.

---

## Workaround: Manual Cron Setup

If automated cron setup continues to fail, you can set up cron jobs manually:

1. Deploy without `vercel.json`
2. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
3. Click "Add Cron Job"
4. Enter path and schedule manually
5. Save

This bypasses the `vercel.json` validation.

---

## Testing Checklist

Before deploying:

- [ ] Local build succeeds (`npm run build`)
- [ ] Both route files exist and export GET handlers
- [ ] `vercel.json` syntax is valid (use JSON validator)
- [ ] Environment variables are set in Vercel
- [ ] No TypeScript errors (`npm run build` shows no errors)
- [ ] Routes are accessible locally (test with curl)

---

## Next Steps

1. **Try deploying without vercel.json first** to confirm base deployment works
2. **Check Vercel build logs** for specific error messages
3. **Contact Vercel support** if issue persists with logs

---

## Support Resources

- [Vercel Cron Documentation](https://vercel.com/docs/cron-jobs)
- [Vercel Support](https://vercel.com/support)
- [Vercel Community Discord](https://vercel.com/discord)

---

**Last Updated**: 2026-01-21  
**Status**: Investigating GitHub check failures
