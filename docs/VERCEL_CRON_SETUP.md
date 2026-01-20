# Vercel Cron Jobs Setup Guide

This project uses Vercel Cron to automatically process recurring transactions and generate AI insights.

## Configured Cron Jobs

### 1. Recurring Transactions Processing
- **Endpoint**: `/api/recurring-transactions/process`
- **Schedule**: Every hour (`0 * * * *`)
- **Purpose**: Creates actual transactions from recurring templates when they're due
- **What it does**:
  - Queries all active recurring transactions where `nextOccurrence <= now`
  - Creates actual transactions for each due recurring transaction
  - Updates the `nextOccurrence` date for the next cycle
  - Deactivates recurring transactions that have passed their end date

### 2. AI Insights Generation
- **Endpoint**: `/api/insights/process`
- **Schedule**: Every Sunday at 8 PM UTC (`0 20 * * 0`)
- **Purpose**: Generates weekly AI-powered spending insights for all users
- **What it does**:
  - Analyzes spending patterns for all users
  - Generates personalized insights, alerts, and advice
  - Caches results for quick retrieval
  - Marks old insights as stale

## Setup Instructions

### 1. Local Development

For local testing, you'll need to manually trigger the cron endpoints:

```bash
# Generate a secure CRON_SECRET
openssl rand -base64 32

# Add to your .env file
CRON_SECRET=your-generated-secret-here
```

Test the endpoints locally:

```bash
# Test recurring transactions processing
curl -X POST http://localhost:3000/api/recurring-transactions/process \
  -H "Authorization: Bearer your-cron-secret-here"

# Test insights processing
curl -X POST http://localhost:3000/api/insights/process \
  -H "Authorization: Bearer your-cron-secret-here"
```

### 2. Vercel Deployment

#### Step 1: Add Environment Variable

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate a secure random string (use `openssl rand -base64 32`)
   - **Environments**: Select all (Production, Preview, Development)
3. Click **Save**

#### Step 2: Deploy

The `vercel.json` file is already configured with the cron schedules. Simply deploy:

```bash
git add .
git commit -m "Add Vercel Cron configuration"
git push
```

Vercel will automatically detect the cron configuration and set up the scheduled jobs.

#### Step 3: Verify

After deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Cron Jobs** tab
3. You should see both cron jobs listed with their schedules
4. Check the **Logs** tab to monitor cron job executions

## Cron Schedule Format

The cron schedules use standard POSIX cron syntax:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sunday = 0)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Examples:
- `0 * * * *` - Every hour at minute 0
- `0 20 * * 0` - Every Sunday at 8 PM UTC
- `0 0 1 * *` - First day of every month at midnight
- `*/15 * * * *` - Every 15 minutes

## Monitoring

### View Cron Logs

In Vercel Dashboard:
1. Go to your project
2. Click **Logs** tab
3. Filter by the cron endpoint paths

### Check Execution Status

The cron endpoints return detailed JSON responses:

```json
{
  "success": true,
  "data": {
    "processed": 5,
    "failed": 0,
    "errors": [],
    "duration": 1234
  },
  "message": "Processed 5 recurring transactions, 0 failed"
}
```

## Security

- All cron endpoints are protected by the `CRON_SECRET` environment variable
- Requests without valid authorization will receive a 401 Unauthorized response
- The secret is never exposed in logs or client-side code
- Vercel automatically includes the authorization header in cron requests

## Troubleshooting

### Cron job not executing

1. Check that `CRON_SECRET` is set in Vercel environment variables
2. Verify the cron schedule syntax in `vercel.json`
3. Check Vercel logs for error messages
4. Ensure your Vercel plan supports cron jobs (available on all plans)

### 401 Unauthorized errors

1. Verify `CRON_SECRET` is correctly set in environment variables
2. Redeploy after adding/changing environment variables
3. Check that the secret matches in both `.env` and Vercel settings

### Cron job timing out

1. Optimize database queries (check indexes)
2. Consider processing in batches for large datasets
3. Increase function timeout in `vercel.json` if needed:

```json
{
  "functions": {
    "api/recurring-transactions/process.ts": {
      "maxDuration": 60
    }
  }
}
```

## Adjusting Schedules

To change cron schedules, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/recurring-transactions/process",
      "schedule": "*/30 * * * *"  // Every 30 minutes instead of hourly
    }
  ]
}
```

Then redeploy to apply changes.

## Cost Considerations

- Vercel Cron is included in all plans (Hobby, Pro, Enterprise)
- Each cron execution counts toward your function invocation quota
- Monitor usage in Vercel Dashboard → Usage tab
- Consider adjusting schedules if hitting limits

## Additional Resources

- [Vercel Cron Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)
- [Vercel Function Limits](https://vercel.com/docs/functions/limits)
