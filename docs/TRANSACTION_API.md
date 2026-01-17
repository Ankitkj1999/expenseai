# Transaction API Documentation

## Overview
Manage financial transactions (expenses, income, transfers) with automatic account balance updates using MongoDB transactions for data consistency.

## Transaction Types

- **expense**: Money spent from an account
- **income**: Money received into an account
- **transfer**: Money moved between accounts

## API Endpoints

### 1. List Transactions
**GET** `/api/transactions`

Get transactions with optional filters and pagination.

**Authentication:**
- Requires HTTP-only cookie authentication

**Query Parameters:**
- `type` (string, optional): Filter by transaction type - `expense`, `income`, or `transfer`
- `accountId` (string, optional): Filter by account ID
- `categoryId` (string, optional): Filter by category ID
- `startDate` (string, optional): Filter transactions from this date (ISO 8601)
- `endDate` (string, optional): Filter transactions until this date (ISO 8601)
- `limit` (number, optional): Maximum number of results (default: 50)
- `skip` (number, optional): Number of results to skip for pagination (default: 0)

**Success Response (200):**
```json
{
  "transactions": [
    {
      "_id": "transaction_id",
      "userId": "user_id",
      "type": "expense",
      "amount": 500,
      "description": "Grocery shopping",
      "accountId": {
        "_id": "account_id",
        "name": "Cash",
        "type": "cash",
        "icon": "wallet",
        "color": "#3B82F6"
      },
      "categoryId": {
        "_id": "category_id",
        "name": "Groceries",
        "icon": "local_grocery_store",
        "color": "#84CC16"
      },
      "tags": ["food", "weekly"],
      "date": "2024-01-15T10:30:00.000Z",
      "attachments": [],
      "aiGenerated": false,
      "metadata": {
        "location": "Supermarket",
        "notes": "Weekly groceries"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "skip": 0
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Create Transaction
**POST** `/api/transactions`

Create a new transaction and automatically update account balance(s).

**Authentication:**
- Requires HTTP-only cookie authentication

**Request Body:**
```json
{
  "type": "expense",
  "amount": 500,
  "description": "Grocery shopping",
  "accountId": "account_id",
  "categoryId": "category_id",
  "tags": ["food", "weekly"],
  "date": "2024-01-15T10:30:00.000Z",
  "attachments": [],
  "aiGenerated": false,
  "metadata": {
    "location": "Supermarket",
    "notes": "Weekly groceries"
  }
}
```

**Request Fields:**
- `type` (string, required): Transaction type - `expense`, `income`, or `transfer`
- `amount` (number, required): Transaction amount (must be positive)
- `description` (string, required): Transaction description (max 500 characters)
- `accountId` (string, required): Source account ID
- `toAccountId` (string, required for transfers): Destination account ID
- `categoryId` (string, required for expense/income): Category ID
- `tags` (array, optional): Array of tag strings
- `date` (string, optional): Transaction date (ISO 8601, default: now)
- `attachments` (array, optional): Array of attachment objects
- `aiGenerated` (boolean, optional): Whether transaction was created by AI (default: false)
- `metadata` (object, optional): Additional metadata (location, notes)

**Success Response (201):**
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "_id": "transaction_id",
    "userId": "user_id",
    "type": "expense",
    "amount": 500,
    "description": "Grocery shopping",
    "accountId": {...},
    "categoryId": {...},
    "tags": ["food", "weekly"],
    "date": "2024-01-15T10:30:00.000Z",
    "attachments": [],
    "aiGenerated": false,
    "metadata": {...},
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed (missing required fields, invalid type, etc.)
- `401` - Unauthorized
- `500` - Internal server error (account not found, insufficient balance, etc.)

---

### 3. Get Transaction by ID
**GET** `/api/transactions/:id`

Get details of a specific transaction.

**Authentication:**
- Requires HTTP-only cookie authentication

**URL Parameters:**
- `id` (string, required): Transaction ID

**Success Response (200):**
```json
{
  "transaction": {
    "_id": "transaction_id",
    "userId": "user_id",
    "type": "expense",
    "amount": 500,
    "description": "Grocery shopping",
    "accountId": {...},
    "categoryId": {...},
    "tags": ["food", "weekly"],
    "date": "2024-01-15T10:30:00.000Z",
    "attachments": [],
    "aiGenerated": false,
    "metadata": {...},
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Transaction not found
- `500` - Internal server error

---

### 4. Update Transaction
**PUT** `/api/transactions/:id`

Update an existing transaction. Account balances are automatically adjusted.

**Authentication:**
- Requires HTTP-only cookie authentication

**URL Parameters:**
- `id` (string, required): Transaction ID

**Request Body:**
```json
{
  "amount": 550,
  "description": "Updated grocery shopping",
  "tags": ["food", "weekly", "organic"]
}
```

**Request Fields (all optional):**
- `type` (string): Transaction type
- `amount` (number): Transaction amount
- `description` (string): Transaction description
- `accountId` (string): Source account ID
- `toAccountId` (string): Destination account ID
- `categoryId` (string): Category ID
- `tags` (array): Array of tag strings
- `date` (string): Transaction date
- `attachments` (array): Array of attachment objects
- `aiGenerated` (boolean): AI-generated flag
- `metadata` (object): Additional metadata

**Success Response (200):**
```json
{
  "message": "Transaction updated successfully",
  "transaction": {...}
}
```

**Error Responses:**
- `400` - Invalid transaction type
- `401` - Unauthorized
- `404` - Transaction not found
- `500` - Internal server error

---

### 5. Delete Transaction
**DELETE** `/api/transactions/:id`

Delete a transaction and revert account balance changes.

**Authentication:**
- Requires HTTP-only cookie authentication

**URL Parameters:**
- `id` (string, required): Transaction ID

**Success Response (200):**
```json
{
  "message": "Transaction deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Transaction not found
- `500` - Internal server error

---

## Usage Examples

```javascript
// List recent transactions
const listResponse = await fetch('/api/transactions?limit=20', {
  credentials: 'include'
});
const { transactions, total } = await listResponse.json();

// Filter by date range
const filtered = await fetch(
  '/api/transactions?startDate=2024-01-01&endDate=2024-01-31&type=expense',
  { credentials: 'include' }
);

// Create an expense
const createResponse = await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    type: 'expense',
    amount: 500,
    description: 'Grocery shopping',
    accountId: 'account_id',
    categoryId: 'category_id',
    tags: ['food'],
    metadata: { location: 'Supermarket' }
  })
});

// Create a transfer
const transferResponse = await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    type: 'transfer',
    amount: 1000,
    description: 'Transfer to savings',
    accountId: 'checking_account_id',
    toAccountId: 'savings_account_id'
  })
});

// Update a transaction
const updateResponse = await fetch(`/api/transactions/${transactionId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    amount: 550,
    description: 'Updated description'
  })
});

// Delete a transaction
const deleteResponse = await fetch(`/api/transactions/${transactionId}`, {
  method: 'DELETE',
  credentials: 'include'
});
```

---

## Important Notes

### Account Balance Updates
- All transaction operations use MongoDB transactions for atomicity
- Account balances are automatically updated:
  - **Expense**: Deducts from account
  - **Income**: Adds to account
  - **Transfer**: Deducts from source, adds to destination
- If any operation fails, all changes are rolled back

### Validation Rules
- Amount must be positive
- Transfers require `toAccountId`
- Expense/Income require `categoryId`
- Transfers don't use categories
- Account ownership is verified
- Description max length: 500 characters

### Filtering & Pagination
- Default limit: 50 transactions
- Results sorted by date (newest first)
- Use `skip` and `limit` for pagination
- Combine filters for specific queries

### Populated References
- Account details are populated in responses
- Category details are populated (when applicable)
- Destination account populated for transfers
