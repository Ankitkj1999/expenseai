# Authentication API Documentation

## Overview
Simple JWT-based authentication system with bcrypt password hashing and HTTP-only cookies for secure token storage.

## Environment Variables
Make sure to set these in your `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Headers:**
- `Set-Cookie: auth-token=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/`

**Error Responses:**
- `400` - Validation failed (invalid email or password too short)
- `409` - User with this email already exists
- `500` - Internal server error

---

### 2. Login
**POST** `/api/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Headers:**
- `Set-Cookie: auth-token=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/`

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid email or password
- `500` - Internal server error

---

### 3. Get Current User
**GET** `/api/auth/me`

Get the currently authenticated user's information.

**Cookies:**
- `auth-token`: JWT token (automatically sent by browser)

**Success Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (no token, invalid token, or user not found)
- `500` - Internal server error

---

### 4. Logout
**POST** `/api/auth/logout`

Logout the current user by clearing the authentication cookie.

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Response Headers:**
- `Set-Cookie: auth-token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`

**Error Responses:**
- `500` - Internal server error

---

## Authentication Flow

1. **Register**: User creates an account with email and password
   - Password is hashed using bcrypt
   - JWT token is generated and set as HTTP-only cookie

2. **Login**: User logs in with credentials
   - Password is verified against stored hash
   - JWT token is generated and set as HTTP-only cookie

3. **Protected Routes**: Token is automatically sent via cookies
   - No need to manually include Authorization header
   - Token is valid for 7 days
   - Browser automatically sends cookie with each request

4. **Logout**: Clears the authentication cookie
   - Cookie is expired immediately
   - User must login again to access protected routes

## Usage Example

```javascript
// Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { user } = await registerResponse.json();

// Use authenticated requests (cookie is sent automatically)
const userResponse = await fetch('/api/auth/me', {
  credentials: 'include' // Important: Include cookies
});
const userData = await userResponse.json();

// Logout
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include' // Important: Include cookies
});
```

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens stored in HTTP-only cookies (prevents XSS attacks)
- Cookies are secure in production (HTTPS only)
- SameSite=Lax protection against CSRF attacks
- JWT tokens expire after 7 days
- Email validation using regex pattern
- Password minimum length of 6 characters
- Duplicate email prevention
- Password hashes are never returned in API responses

## File Structure

```
lib/
├── db/
│   ├── mongodb.ts           # MongoDB connection
│   └── models/
│       └── User.ts          # User model
├── middleware/
│   └── auth.ts              # Authentication middleware
└── utils/
    └── auth.ts              # Auth utilities (JWT, bcrypt)

app/api/auth/
├── register/route.ts        # Registration endpoint
├── login/route.ts           # Login endpoint
├── logout/route.ts          # Logout endpoint
└── me/route.ts              # Get current user endpoint

types/
└── index.ts                 # TypeScript types
```
