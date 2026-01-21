#!/bin/bash

# Test script to verify cron endpoints are accessible
# This simulates what Vercel does when validating cron jobs

echo "Testing cron endpoints..."
echo ""

# Start dev server in background
echo "Starting dev server..."
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to start
sleep 5

# Test recurring transactions endpoint
echo "Testing /api/recurring-transactions/process..."
RESPONSE1=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/recurring-transactions/process)
if [ "$RESPONSE1" = "401" ] || [ "$RESPONSE1" = "200" ]; then
  echo "✓ Endpoint accessible (HTTP $RESPONSE1)"
else
  echo "✗ Endpoint failed (HTTP $RESPONSE1)"
fi

# Test insights endpoint
echo "Testing /api/insights/process..."
RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/insights/process)
if [ "$RESPONSE2" = "401" ] || [ "$RESPONSE2" = "200" ]; then
  echo "✓ Endpoint accessible (HTTP $RESPONSE2)"
else
  echo "✗ Endpoint failed (HTTP $RESPONSE2)"
fi

# Kill dev server
kill $DEV_PID 2>/dev/null

echo ""
echo "Test complete. Both endpoints should return 401 (Unauthorized) or 200 (OK)."
echo "If they return 404, the routes don't exist."
