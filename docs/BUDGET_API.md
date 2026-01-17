# Budget API Documentation

## Overview
The Budget API allows users to create, manage, and track spending budgets. Budgets can be set for specific categories or overall spending, with configurable periods and alert thresholds.

---

## Endpoints

### 1. List All Budgets
**GET** `/api/budgets`

Get all budgets for the authenticated user with optional filters.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | boolean | No | Filter by active/inactive budgets |
| `categoryId` | string | No | Filter by category ID |
| `period` | string | No | Filter by period (daily, weekly, monthly, yearly) |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "name": "Monthly Groceries",
      "categoryId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Groceries",
        "icon": "🛒",
        "color": "#4CAF50"
      },
      "amount": 10000,
      "period": "monthly",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "alertThreshold": 80,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Example
```bash
# Get all active budgets
curl -X GET "http://localhost:3000/api/budgets?isActive=true" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get budgets for a specific category
curl -X GET "http://localhost:3000/api/budgets?categoryId=507f1f77bcf86cd799439013" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get monthly budgets
curl -X GET "http://localhost:3000/api/budgets?period=monthly" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

### 2. Create Budget
**POST** `/api/budgets`

Create a new budget for the authenticated user.

#### Request Body
```json
{
  "name": "Monthly Groceries",
  "categoryId": "507f1f77bcf86cd799439013",
  "amount": 10000,
  "period": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z",
  "alertThreshold": 80
}
```

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Budget name |
| `categoryId` | string | No | Category ID (null for overall budget) |
| `amount` | number | Yes | Budget amount (must be > 0) |
| `period` | string | Yes | Period: daily, weekly, monthly, yearly |
| `startDate` | string (ISO 8601) | Yes | Budget start date |
| `endDate` | string (ISO 8601) | Yes | Budget end date (must be after startDate) |
| `alertThreshold` | number | No | Alert threshold percentage (0-100, default: 80) |

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Monthly Groceries",
    "categoryId": "507f1f77bcf86cd799439013",
    "amount": 10000,
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "alertThreshold": 80,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Budget created successfully"
}
```

#### Example
```bash
curl -X POST "http://localhost:3000/api/budgets" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "name": "Monthly Groceries",
    "categoryId": "507f1f77bcf86cd799439013",
    "amount": 10000,
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "alertThreshold": 80
  }'
```

---

### 3. Get Budget by ID
**GET** `/api/budgets/:id`

Get a specific budget by ID.

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Monthly Groceries",
    "categoryId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Groceries",
      "icon": "🛒",
      "color": "#4CAF50"
    },
    "amount": 10000,
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "alertThreshold": 80,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Example
```bash
curl -X GET "http://localhost:3000/api/budgets/507f1f77bcf86cd799439011" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

### 4. Update Budget
**PUT** `/api/budgets/:id`

Update a budget. Only provided fields will be updated.

#### Request Body
```json
{
  "name": "Updated Budget Name",
  "amount": 12000,
  "alertThreshold": 90,
  "isActive": true
}
```

#### Fields (All Optional)
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Budget name |
| `categoryId` | string | Category ID |
| `amount` | number | Budget amount (must be > 0) |
| `period` | string | Period: daily, weekly, monthly, yearly |
| `startDate` | string (ISO 8601) | Budget start date |
| `endDate` | string (ISO 8601) | Budget end date |
| `alertThreshold` | number | Alert threshold percentage (0-100) |
| `isActive` | boolean | Active status |

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Updated Budget Name",
    "amount": 12000,
    "alertThreshold": 90,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Budget updated successfully"
}
```

#### Example
```bash
curl -X PUT "http://localhost:3000/api/budgets/507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "name": "Updated Budget Name",
    "amount": 12000,
    "alertThreshold": 90
  }'
```

---

### 5. Delete Budget
**DELETE** `/api/budgets/:id`

Delete a budget.

#### Response
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

#### Example
```bash
curl -X DELETE "http://localhost:3000/api/budgets/507f1f77bcf86cd799439011" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

### 6. Get Budget Status
**GET** `/api/budgets/:id/status`

Get detailed budget status including spending information, remaining amount, and alert status.

#### Response
```json
{
  "success": true,
  "data": {
    "budget": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "name": "Monthly Groceries",
      "categoryId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Groceries",
        "icon": "🛒",
        "color": "#4CAF50"
      },
      "amount": 10000,
      "period": "monthly",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "alertThreshold": 80,
      "isActive": true
    },
    "spent": 7500,
    "remaining": 2500,
    "percentage": 75.0,
    "isOverBudget": false,
    "shouldAlert": false
  }
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `budget` | object | Complete budget object |
| `spent` | number | Total amount spent in budget period |
| `remaining` | number | Remaining budget amount |
| `percentage` | number | Percentage of budget used |
| `isOverBudget` | boolean | Whether spending exceeds budget |
| `shouldAlert` | boolean | Whether alert threshold is reached |

#### Example
```bash
curl -X GET "http://localhost:3000/api/budgets/507f1f77bcf86cd799439011/status" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: name, amount, period, startDate, endDate"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Budget not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create budget"
}
```

---

## Budget Periods

| Period | Description |
|--------|-------------|
| `daily` | Budget resets daily |
| `weekly` | Budget resets weekly |
| `monthly` | Budget resets monthly |
| `yearly` | Budget resets yearly |

---

## Use Cases

### 1. Category-Specific Budget
Create a budget for a specific category (e.g., Groceries):
```json
{
  "name": "Monthly Groceries",
  "categoryId": "507f1f77bcf86cd799439013",
  "amount": 10000,
  "period": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z"
}
```

### 2. Overall Budget
Create an overall spending budget (no category):
```json
{
  "name": "Monthly Spending Limit",
  "amount": 50000,
  "period": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z"
}
```

### 3. Weekly Budget
Create a weekly budget:
```json
{
  "name": "Weekly Entertainment",
  "categoryId": "507f1f77bcf86cd799439014",
  "amount": 2000,
  "period": "weekly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-07T23:59:59.999Z"
}
```

---

## Notes

1. **Authentication Required**: All endpoints require authentication via HTTP-only cookie
2. **User Isolation**: Users can only access their own budgets
3. **Date Validation**: End date must be after start date
4. **Amount Validation**: Budget amount must be greater than 0
5. **Alert Threshold**: Default is 80%, can be set between 0-100%
6. **Category Optional**: Budgets can be category-specific or overall
7. **Status Calculation**: Budget status is calculated in real-time based on transactions
8. **Populated Data**: Category information is automatically populated in responses
