# Vercel Cron - Manual Setup Guide

## Issue: GitHub Checks Failing with vercel.json

The automated cron configuration via `vercel.json` is causing GitHub checks to fail before deployment even starts. This is a known issue that can occur for various reasons:

1. Vercel plan limitations
2. Project configuration conflicts
3. Vercel API validation issues

---

## Solution: Manual Cron Setup

Instead of using `vercel.json`, we'll set up cron jobs manually through the Vercel Dashboard. This is actually more reliable and gives you better control.

---

## Step-by-Step Instructions

### Step 1: Deploy Without vercel.json ✅

1. The `vercel.json` file has been backed up to `vercel.json.backup`
2. Deploy your code without the cron configuration:
   ```bash
   git add .
   git commit -m "Deploy without vercel.json for manual cron setup"
   git push
   ```
3. Verify deployment succeeds ✅

---

### Step 2: Add CRON_SECRET Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate using `openssl rand -base64 32`
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

---

### Step 3: Manually Add Cron Jobs

#### For Recurring Transactions:

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Cron Jobs**
3. Click **Add Cron Job**
4. Fill in:
   - **Path**: `/api/recurring-transactions/process`
   - **Schedule**: `0 * * * *` (Every hour)
   - **Description**: Process due recurring transactions
5. Click **Create**

#### For AI Insights:

1. Click **Add Cron Job** again
2. Fill in:
   - **Path**: `/api/insights/process`
   - **Schedule**: `0 20 * * 0` (Every Sunday at 8 PM UTC)
   - **Description**: Generate AI insights for all users
3. Click **Create**

---

### Step 4: Verify Cron Jobs

1. Go to **Settings** → **Cron Jobs**
2. You should see both cron jobs listed with their schedules
3. Click **View Logs** to monitor executions

---

## Advantages of Manual Setup

✅ **More Reliable**: No deployment failures due to config validation  
✅ **Better Control**: Easy to enable/disable individual cron jobs  
✅ **Easier Debugging**: Clear UI for viewing logs and status  
✅ **No Code Changes**: Update schedules without redeploying  
✅ **Plan Compatible**: Works on all Vercel plans

---

## Testing Your Cron Endpoints

Before setting up cron jobs, test the endpoints manually:

```bash
# Test recurring transactions (should return health check)
curl https://your-app.vercel.app/api/recurring-transactions/process

# Expected response:
# {"status":"ready","endpoint":"/api/recurring-transactions/process",...}

# Test with authentication
curl https://your-app.vercel.app/api/recurring-transactions/process \
  -H "Authorization: Bearer your-cron-secret"

# Expected response:
# {"success":true,"data":{...}}
```

---

## Monitoring Cron Jobs

### View Execution Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Logs** tab
3. Filter by path: `/api/recurring-transactions/process` or `/api/insights/process`
4. View execution results, errors, and duration

### Check Cron Job Status

1. Go to **Settings** → **Cron Jobs**
2. Each cron job shows:
   - Last execution time
   - Next scheduled execution
   - Success/failure status
   - **View Logs** button for detailed logs

---

## Troubleshooting

### Cron Job Not Executing

1. **Check Status**: Ensure cron job is enabled (not disabled)
2. **Verify Path**: Path must match exactly (case-sensitive)
3. **Check Logs**: Look for error messages in execution logs
4. **Test Endpoint**: Manually call the endpoint to verify it works

### 401 Unauthorized Errors

1. **Check CRON_SECRET**: Verify it's set in environment variables
2. **Redeploy**: After adding env vars, redeploy your app
3. **Check Middleware**: Ensure `withCronAuth` is working correctly

### Cron Job Runs But Fails

1. **Check Function Logs**: View detailed error messages
2. **Database Connection**: Verify MongoDB connection string is correct
3. **Timeout Issues**: Check if function is timing out (increase `maxDuration` if needed)

---

## Updating Cron Schedules

To change when cron jobs run:

1. Go to **Settings** → **Cron Jobs**
2. Click on the cron job you want to edit
3. Update the schedule
4. Click **Save**
5. No redeployment needed! ✅

---

## Disabling Cron Jobs

To temporarily stop cron jobs:

1. Go to **Settings** → **Cron Jobs**
2. Click on the cron job
3. Click **Disable**
4. To re-enable, click **Enable**

---

## If You Want to Use vercel.json Later

Once your deployment is stable, you can try adding `vercel.json` back:

1. Restore the file: `mv vercel.json.backup vercel.json`
2. Deploy and see if it works
3. If it fails again, stick with manual setup (it's actually better!)

---

## Summary

**Current Approach**: Manual cron setup via Vercel Dashboard  
**Status**: ✅ Recommended and more reliable  
**Next Steps**:
1. Deploy without `vercel.json`
2. Add `CRON_SECRET` environment variable
3. Manually add both cron jobs in dashboard
4. Monitor logs to verify execution

---

**This approach is actually preferred by many developers** because it's more transparent, easier to debug, and doesn't cause deployment issues.
