# Recurring Transactions Cron Job Setup

## Overview
The recurring transactions feature requires a cron job to automatically process due transactions and create actual transaction records.

## Endpoint
`POST /api/recurring-transactions/process`

## Recommended Schedule
Run daily at a specific time (e.g., 2:00 AM server time)

## Setup Options

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployment)

1. Create `vercel.json` in project root:
```json
{
  "crons": [{
    "path": "/api/recurring-transactions/process",
    "schedule": "0 2 * * *"
  }]
}
```

2. Deploy to Vercel - cron jobs will run automatically

### Option 2: External Cron Service (e.g., cron-job.org, EasyCron)

1. Sign up for a cron service
2. Create a new cron job with:
   - URL: `https://your-domain.com/api/recurring-transactions/process`
   - Method: POST
   - Schedule: Daily at 2:00 AM (cron: `0 2 * * *`)
   - Headers:
     ```
     Authorization: Bearer YOUR_JWT_TOKEN
     Content-Type: application/json
     ```

### Option 3: GitHub Actions (For GitHub-hosted projects)

1. Create `.github/workflows/recurring-transactions.yml`:
```yaml
name: Process Recurring Transactions

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2:00 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Call API endpoint
        run: |
          curl -X POST https://your-domain.com/api/recurring-transactions/process \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            -H "Content-Type: application/json"
```

2. Add `API_TOKEN` to GitHub repository secrets

### Option 4: Node.js Cron (For self-hosted servers)

1. Install node-cron:
```bash
npm install node-cron
```

2. Create `lib/cron/recurringTransactions.ts`:
```typescript
import cron from 'node-cron';
import { processDueRecurringTransactions } from '@/lib/services/recurringTransactionService';

// Run daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Processing recurring transactions...');
  try {
    const results = await processDueRecurringTransactions();
    console.log(`Processed: ${results.processed}, Failed: ${results.failed}`);
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
  }
});
```

3. Import in your server startup file

## Security Considerations

### Option A: Add API Key Authentication
Update `/api/recurring-transactions/process/route.ts`:
```typescript
export const POST = withAuthAndDb(async (request: AuthenticatedRequest) => {
  // Check for cron secret
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return ApiResponse.unauthorized('Invalid cron secret');
  }
  
  // ... rest of the code
});
```

Add to `.env`:
```
CRON_SECRET=your-secure-random-string
```

### Option B: IP Whitelist
Configure your hosting provider to only allow requests from your cron service's IP addresses.

## Monitoring

### Check Cron Job Execution
- Monitor your hosting provider's logs
- Set up alerts for failed cron jobs
- Track the response from the `/process` endpoint

### Manual Trigger
You can manually trigger the cron job for testing:
```bash
curl -X POST https://your-domain.com/api/recurring-transactions/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Cron job not running
- Check cron service configuration
- Verify endpoint URL is correct
- Check authentication headers
- Review server logs for errors

### Transactions not being created
- Check `nextOccurrence` dates in database
- Verify `isActive` is true
- Check account and category IDs are valid
- Review error logs in the response

## Testing

### Test the process endpoint manually:
```bash
# Replace with your actual token
curl -X POST http://localhost:3000/api/recurring-transactions/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "processed": 5,
    "failed": 0,
    "errors": [],
    "message": "Processed 5 recurring transactions, 0 failed"
  }
}
```

## Best Practices

1. **Run during low-traffic hours** (e.g., 2:00 AM)
2. **Monitor execution** - Set up alerts for failures
3. **Test thoroughly** - Use manual triggers before automating
4. **Secure the endpoint** - Use API keys or IP whitelisting
5. **Log everything** - Track successes and failures
6. **Handle failures gracefully** - Don't stop on first error
7. **Set up retries** - Configure cron service to retry on failure

## Next Steps

1. Choose a cron solution based on your hosting environment
2. Configure the cron job with proper authentication
3. Test manually first
4. Monitor the first few automated runs
5. Set up alerts for failures
