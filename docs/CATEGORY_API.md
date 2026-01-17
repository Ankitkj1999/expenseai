# Category API Documentation

## Overview
Manage expense and income categories. The system provides default categories, and users can create custom categories.

## Default System Categories

### Expense Categories
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Groceries
- Other

### Income Categories
- Salary
- Business
- Investments
- Freelance
- Other

## API Endpoints

### 1. List All Categories
**GET** `/api/categories`

Get all categories available to the user (system categories + user's custom categories).

**Authentication:**
- Requires HTTP-only cookie authentication

**Query Parameters:**
- `type` (string, optional): Filter by category type - `expense` or `income`

**Success Response (200):**
```json
{
  "categories": [
    {
      "_id": "category_id",
      "userId": null,
      "name": "Food & Dining",
      "type": "expense",
      "icon": "restaurant",
      "color": "#EF4444",
      "isSystem": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "category_id_2",
      "userId": "user_id",
      "name": "Custom Category",
      "type": "expense",
      "icon": "category",
      "color": "#6B7280",
      "isSystem": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 2
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Create Custom Category
**POST** `/api/categories`

Create a new custom category for the authenticated user.

**Authentication:**
- Requires HTTP-only cookie authentication

**Request Body:**
```json
{
  "name": "Pets",
  "type": "expense",
  "icon": "pets",
  "color": "#F59E0B"
}
```

**Request Fields:**
- `name` (string, required): Category name (max 50 characters)
- `type` (string, required): Category type - `expense` or `income`
- `icon` (string, optional): Icon identifier (default: "category")
- `color` (string, optional): Hex color code (default: "#6B7280")

**Success Response (201):**
```json
{
  "message": "Category created successfully",
  "category": {
    "_id": "category_id",
    "userId": "user_id",
    "name": "Pets",
    "type": "expense",
    "icon": "pets",
    "color": "#F59E0B",
    "isSystem": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed (missing required fields or invalid type)
- `401` - Unauthorized
- `409` - Category with this name already exists
- `500` - Internal server error

---

### 3. Update Custom Category
**PUT** `/api/categories/:id`

Update an existing custom category. System categories cannot be edited.

**Authentication:**
- Requires HTTP-only cookie authentication

**URL Parameters:**
- `id` (string, required): Category ID

**Request Body:**
```json
{
  "name": "Pet Care",
  "color": "#10B981"
}
```

**Request Fields (all optional):**
- `name` (string): Category name
- `type` (string): Category type - `expense` or `income`
- `icon` (string): Icon identifier
- `color` (string): Hex color code

**Success Response (200):**
```json
{
  "message": "Category updated successfully",
  "category": {
    "_id": "category_id",
    "userId": "user_id",
    "name": "Pet Care",
    "type": "expense",
    "icon": "pets",
    "color": "#10B981",
    "isSystem": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid category type
- `401` - Unauthorized
- `403` - Cannot edit system categories or unauthorized to edit this category
- `404` - Category not found
- `500` - Internal server error

---

### 4. Delete Custom Category
**DELETE** `/api/categories/:id`

Delete a custom category. System categories cannot be deleted.

**Authentication:**
- Requires HTTP-only cookie authentication

**URL Parameters:**
- `id` (string, required): Category ID

**Success Response (200):**
```json
{
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Cannot delete system categories or unauthorized to delete this category
- `404` - Category not found
- `500` - Internal server error

---

## Usage Example

```javascript
// List all categories
const listResponse = await fetch('/api/categories', {
  credentials: 'include'
});
const { categories } = await listResponse.json();

// List only expense categories
const expenseResponse = await fetch('/api/categories?type=expense', {
  credentials: 'include'
});

// Create a custom category
const createResponse = await fetch('/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Pets',
    type: 'expense',
    icon: 'pets',
    color: '#F59E0B'
  })
});

// Update a category
const updateResponse = await fetch(`/api/categories/${categoryId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Pet Care',
    color: '#10B981'
  })
});

// Delete a category
const deleteResponse = await fetch(`/api/categories/${categoryId}`, {
  method: 'DELETE',
  credentials: 'include'
});
```

---

## Notes

- All endpoints require authentication via HTTP-only cookies
- System categories are automatically initialized on first use
- System categories cannot be edited or deleted
- Users can only edit/delete their own custom categories
- Category names are case-insensitive for duplicate checking
- When listing categories, system categories appear first, followed by custom categories
- Deleting a category does not affect existing transactions using that category
