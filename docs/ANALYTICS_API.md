# Analytics API Documentation

## Overview
The Analytics API provides insights into spending patterns, income trends, category breakdowns, and period comparisons. All endpoints require authentication and return aggregated data based on user transactions.

---

## Endpoints

### 1. Get Summary
**GET** `/api/analytics/summary`

Get expense/income summary for a specified period.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `month` | Period: `today`, `week`, `month`, `year`, `custom` |
| `startDate` | string (ISO 8601) | Conditional | - | Required for `custom` period |
| `endDate` | string (ISO 8601) | Conditional | - | Required for `custom` period |

#### Response
```json
{
  "success": true,
  "data": {
    "totalIncome": 50000,
    "totalExpense": 35000,
    "netBalance": 15000,
    "transactionCount": 45,
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

#### Examples
```bash
# Get monthly summary
curl -X GET "http://localhost:3000/api/analytics/summary?period=month" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get summary for today
curl -X GET "http://localhost:3000/api/analytics/summary?period=today" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get custom period summary
curl -X GET "http://localhost:3000/api/analytics/summary?period=custom&startDate=2024-01-01&endDate=2024-01-15" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

### 2. Get Trends
**GET** `/api/analytics/trends`

Get spending trends over time, grouped by day, week, or month.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `month` | Period: `week`, `month`, `year` |
| `groupBy` | string | No | `day` | Grouping: `day`, `week`, `month` |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "income": 5000,
      "expense": 2500,
      "net": 2500
    },
    {
      "date": "2024-01-02",
      "income": 0,
      "expense": 1200,
      "net": -1200
    }
  ],
  "count": 31
}
```

#### Examples
```bash
# Get daily trends for the month
curl -X GET "http://localhost:3000/api/analytics/trends?period=month&groupBy=day" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get weekly trends for the year
curl -X GET "http://localhost:3000/api/analytics/trends?period=year&groupBy=week" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get monthly trends for the year
curl -X GET "http://localhost:3000/api/analytics/trends?period=year&groupBy=month" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

### 3. Get Category Breakdown
**GET** `/api/analytics/category-breakdown`

Get category-wise breakdown of expenses or income with percentages.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | No | `expense` | Transaction type: `expense` or `income` |
| `period` | string | No | `month` | Period: `today`, `week`, `month`, `year`, `custom` |
| `startDate` | string (ISO 8601) | Conditional | - | Required for `custom` period |
| `endDate` | string (ISO 8601) | Conditional | - | Required for `custom` period |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "categoryId": "507f1f77bcf86cd799439011",
      "categoryName": "Food & Dining",
      "amount": 12000,
      "percentage": 34.29,
      "transactionCount": 15,
      "icon": "🍽️",
      "color": "#FF6B6B"
    },
    {
      "categoryId": "507f1f77bcf86cd799439012",
      "categoryName": "Transportation",
      "amount": 8000,
      "percentage": 22.86,
      "transactionCount": 8,
      "icon": "🚗",
      "color": "#4ECDC4"
    },
    {
      "categoryId": "uncategorized",
      "categoryName": "Uncategorized",
      "amount": 5000,
      "percentage": 14.29,
      "transactionCount": 5
    }
  ],
  "count": 3
}
```

#### Examples
```bash
# Get expense breakdown for the month
curl -X GET "http://localhost:3000/api/analytics/category-breakdown?type=expense&period=month" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get income breakdown for the year
curl -X GET "http://localhost:3000/api/analytics/category-breakdown?type=income&period=year" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get expense breakdown for custom period
curl -X GET "http://localhost:3000/api/analytics/category-breakdown?type=expense&period=custom&startDate=2024-01-01&endDate=2024-01-15" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

### 4. Get Comparison
**GET** `/api/analytics/comparison`

Compare spending between current and previous periods.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `currentPeriod` | string | No | `month` | Current period: `today`, `week`, `month`, `year` |
| `previousPeriod` | string | No | Same as current | Previous period: `today`, `week`, `month`, `year` |

#### Response
```json
{
  "success": true,
  "data": {
    "current": {
      "totalIncome": 50000,
      "totalExpense": 35000,
      "netBalance": 15000,
      "transactionCount": 45,
      "period": {
        "start": "2024-01-01T00:00:00.000Z",
        "end": "2024-01-31T23:59:59.999Z"
      }
    },
    "previous": {
      "totalIncome": 45000,
      "totalExpense": 32000,
      "netBalance": 13000,
      "transactionCount": 42,
      "period": {
        "start": "2023-12-01T00:00:00.000Z",
        "end": "2023-12-31T23:59:59.999Z"
      }
    },
    "change": {
      "income": {
        "amount": 5000,
        "percentage": 11.11
      },
      "expense": {
        "amount": 3000,
        "percentage": 9.38
      },
      "net": {
        "amount": 2000,
        "percentage": 15.38
      }
    }
  }
}
```

#### Examples
```bash
# Compare this month with last month
curl -X GET "http://localhost:3000/api/analytics/comparison?currentPeriod=month" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Compare this week with last week
curl -X GET "http://localhost:3000/api/analytics/comparison?currentPeriod=week" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Compare this year with last year
curl -X GET "http://localhost:3000/api/analytics/comparison?currentPeriod=year" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Custom period requires startDate and endDate parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch summary"
}
```

---

## Period Options

| Period | Description | Date Range |
|--------|-------------|------------|
| `today` | Current day | 00:00:00 to 23:59:59 today |
| `week` | Last 7 days | 7 days ago to now |
| `month` | Last 30 days | 30 days ago to now |
| `year` | Last 365 days | 365 days ago to now |
| `custom` | Custom range | Specified by startDate and endDate |

---

## Use Cases

### 1. Dashboard Summary
Get quick overview of current month:
```bash
GET /api/analytics/summary?period=month
```

### 2. Spending Trends Chart
Get daily spending for the last month:
```bash
GET /api/analytics/trends?period=month&groupBy=day
```

### 3. Category Pie Chart
Get expense breakdown by category:
```bash
GET /api/analytics/category-breakdown?type=expense&period=month
```

### 4. Month-over-Month Comparison
Compare current month with previous:
```bash
GET /api/analytics/comparison?currentPeriod=month
```

### 5. Year-to-Date Analysis
Get summary for the entire year:
```bash
GET /api/analytics/summary?period=year
```

### 6. Custom Date Range
Analyze specific period:
```bash
GET /api/analytics/summary?period=custom&startDate=2024-01-01&endDate=2024-03-31
```

---

## Data Aggregation Logic

### Summary Calculation
- **totalIncome**: Sum of all `income` transactions in period
- **totalExpense**: Sum of all `expense` transactions in period
- **netBalance**: totalIncome - totalExpense
- **transactionCount**: Total number of transactions (excluding transfers)

### Trends Calculation
- Groups transactions by specified period (day/week/month)
- Calculates income, expense, and net for each group
- Returns chronologically sorted data points

### Category Breakdown
- Groups transactions by category
- Calculates total amount per category
- Computes percentage of total spending
- Includes transaction count per category
- Handles uncategorized transactions

### Comparison Logic
- Calculates metrics for current period
- Determines equivalent previous period (same duration)
- Computes absolute and percentage changes
- Positive percentage = increase, Negative = decrease

---

## Notes

1. **Authentication Required**: All endpoints require valid auth token
2. **User Isolation**: Users only see their own data
3. **Transfer Exclusion**: Transfer transactions are excluded from income/expense calculations
4. **Real-time Data**: All analytics are calculated in real-time from transactions
5. **Date Handling**: All dates should be in ISO 8601 format
6. **Timezone**: Server uses UTC; client should handle timezone conversion
7. **Performance**: Large date ranges may take longer to process
8. **Caching**: Consider implementing caching for frequently accessed periods

---

## Integration with AI

These analytics endpoints will be called by AI tools:

- `getSpendingSummary` → calls `/api/analytics/summary`
- `getCategoryBreakdown` → calls `/api/analytics/category-breakdown`
- `getSpendingTrends` → calls `/api/analytics/trends`

This allows both traditional API access and AI-powered queries to use the same underlying logic.
