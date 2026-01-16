# Account API Documentation

## Overview
Manage user accounts (cash, bank, credit card, wallet) for expense tracking.

## API Endpoints

### 1. List All Accounts
**GET** `/api/accounts`

Get all active accounts for the authenticated user.

**Authentication:**
- Requires HTTP-only cookie authentication

**Success Response (200):**
```json
{
  "accounts": [
    {
      "_id": "account_id",
      "userId": "user_id",
      "name": "Cash",
      "type": "cash",
      "balance": 5000,
      "currency": "INR",
      "icon": "wallet",
      "color": "#3B82F6",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalBalance": 5000,
  "count": 1
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Create Account
**POST** `/api/accounts`

Create a new account for the authenticated user.

**Authentication:**
- Requires HTTP-only cookie authentication

**Request Body:**
```json
{
  "name": "HDFC Bank",
  "type": "bank",
  "balance": 10000,
  "currency": "INR",
  "icon": "bank",
  "color": "#10B981"
}
```

**Request Fields:**
- `name` (string, required): Account name (max 50 characters)
- `type` (string, required): Account type - one of: `cash`, `bank`, `credit`, `wallet`
- `balance` (number, optional): Initial balance (default: 0)
- `currency` (string, optional): Currency code (default: "INR", max 3 characters)
- `icon` (string, optional): Icon identifier (default: "wallet")
- `color` (string, optional): Hex color code (default: "#3B82F6")

**Success Response (201):**
```json
{
  "message": "Account created successfully",
  "account": {
    "_id": "account_id",
    "userId": "user_id",
    "name": "HDFC Bank",
    "type": "bank",
    "balance": 10000,
    "currency": "INR",
    "icon": "bank",
    "color": "#10B981",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed (missing required fields or invalid type)
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Get Account by ID
**GET** `/api/accounts/:id`

Get details of a specific account.

**Authentication:**
- Requires HTTP-only cookie authentication

**URL Parameters:**
- `id` (string, required): Account ID

**Success Response (200):**
```json
{
  "account": {
    "_id": "account_id",
    "userId": "user_id",
    "name": "Cash",
    "type": "cash",
    "balance": 5000,
    "currency": "INR",
    "icon": "wallet",
    "color": "#3B82F6",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Account not found
- `500` - Internal server error

---

### 4. Update Account
**PUT** `/api/accounts/:id`

Update an existing account.

**Authentication:**
- Requires HTTP-only cookie authentication

**URL Parameters:**
- `id` (string, required): Account ID

**Request Body:**
```json
{
  "name": "Updated Cash Account",
  "balance": 7500,
  "color": "#EF4444"
}
```

**Request Fields (all optional):**
- `name` (string): Account name
- `type` (string): Account type - one of: `cash`, `bank`, `credit`, `wallet`
- `balance` (number): Current balance
- `currency` (string): Currency code
- `icon` (string): Icon identifier
- `color` (string): Hex color code
- `isActive` (boolean): Account active status

**Success Response (200):**
```json
{
  "message": "Account updated successfully",
  "account": {
    "_id": "account_id",
    "userId": "user_id",
    "name": "Updated Cash Account",
    "type": "cash",
    "balance": 7500,
    "currency": "INR",
    "icon": "wallet",
    "color": "#EF4444",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid account type
- `401` - Unauthorized
- `404` - Account not found
- `500` - Internal server error

---

### 5. Delete Account
**DELETE** `/api/accounts/:id`

Soft delete an account (sets `isActive` to false).

**Authentication:**
- Requires HTTP-only cookie authentication

**URL Parameters:**
- `id` (string, required): Account ID

**Success Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Account not found
- `500` - Internal server error

---

## Account Types

- **cash**: Physical cash
- **bank**: Bank account (savings/checking)
- **credit**: Credit card
- **wallet**: Digital wallet (PayTM, PhonePe, etc.)

---

## Usage Example

```javascript
// Create an account
const createResponse = await fetch('/api/accounts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'HDFC Bank',
    type: 'bank',
    balance: 10000,
    currency: 'INR',
    icon: 'bank',
    color: '#10B981'
  })
});

// List all accounts
const listResponse = await fetch('/api/accounts', {
  credentials: 'include'
});
const { accounts, totalBalance } = await listResponse.json();

// Update an account
const updateResponse = await fetch(`/api/accounts/${accountId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    balance: 15000
  })
});

// Delete an account
const deleteResponse = await fetch(`/api/accounts/${accountId}`, {
  method: 'DELETE',
  credentials: 'include'
});
```

---

## Notes

- All endpoints require authentication via HTTP-only cookies
- Accounts are soft-deleted (isActive set to false) to maintain transaction history
- Balance updates should typically be done through transactions, not direct updates
- Currency codes should follow ISO 4217 standard (3 characters)
- Colors should be valid hex color codes
