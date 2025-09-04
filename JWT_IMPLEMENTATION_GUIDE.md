# JWT Authentication Implementation Guide

## Overview
This project now includes JWT (JSON Web Token) authentication to secure API endpoints. Users must authenticate to access protected routes.

## Backend Implementation

### 1. JWT Middleware (`backend/middleware/auth.js`)
- **Purpose**: Verifies JWT tokens in the Authorization header
- **Format**: Expects `Bearer <token>` in the Authorization header
- **Function**: Decodes the token and adds user info to `req.user`

### 2. Protected Routes
The following routes now require authentication:
- `/categories` - All category operations
- `/expenses` - All expense operations  
- `/verify/verify` - Token verification endpoint

### 3. Public Routes
These routes remain public (no token required):
- `/signup` - User registration
- `/login` - User authentication

### 4. Token Generation
- **Signup**: Generates token after successful user creation
- **Login**: Generates token after successful authentication
- **Expiration**: Tokens expire after 24 hours

## Frontend Implementation

### 1. API Utility (`sign_up/src/utils/api.js`)
- **Automatic Token Handling**: Automatically adds JWT tokens to all API requests
- **Token Storage**: Tokens are stored in localStorage
- **Auto-logout**: Automatically logs out users when tokens expire (401 response)

### 2. Token Storage
The following data is stored in localStorage:
- `token` - JWT token for authentication
- `user_id` - User's unique identifier
- `user_name` - User's display name

### 3. Authentication Flow
1. **Signup**: User creates account → receives token → auto-login
2. **Login**: User authenticates → receives token → access granted
3. **Protected Routes**: Token automatically included in headers
4. **Logout**: Clears all stored data and returns to login

## API Usage Examples

### Signup (Public)
```javascript
POST /signup
{
  "name": "John Doe",
  "email": "john@example.com", 
  "phone": "1234567890",
  "password": "password123"
}

Response:
{
  "message": "User signed up successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login (Public)
```javascript
POST /login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "name": "John Doe",
  "user_id": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Routes (Require Token)
```javascript
GET /categories
Headers: Authorization: Bearer <token>

GET /expenses  
Headers: Authorization: Bearer <token>

POST /expenses
Headers: Authorization: Bearer <token>
Body: {
  "amount": 100,
  "description": "Lunch",
  "category_id": 1
}
```

### Token Verification
```javascript
GET /verify/verify
Headers: Authorization: Bearer <token>

Response:
{
  "message": "Token is valid",
  "user": {
    "userId": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

## Security Features

### 1. Token Validation
- **Signature Verification**: Ensures token hasn't been tampered with
- **Expiration Check**: Tokens automatically expire after 24 hours
- **User Context**: Each request includes authenticated user information

### 2. Automatic Token Handling
- **Request Interceptor**: Automatically adds tokens to outgoing requests
- **Response Interceptor**: Handles token expiration and auto-logout
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

### 3. Route Protection
- **Middleware-based**: All protected routes use the same authentication middleware
- **Consistent Security**: Same level of protection across all secured endpoints
- **Easy Maintenance**: Centralized authentication logic

## Testing

### Run JWT Test
```bash
cd backend
npm install axios
node ../test_jwt.js
```

This will test the complete authentication flow:
1. User signup with token generation
2. User login with token generation  
3. Protected route access without token (should fail)
4. Protected route access with token (should succeed)
5. Token verification endpoint

## Environment Variables

Create a `.env` file in the backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

**Important**: Change the JWT_SECRET in production for security!

## Production Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Secure Cookies**: Consider using httpOnly cookies instead of localStorage
3. **Token Refresh**: Implement refresh token mechanism for better UX
4. **Rate Limiting**: Add rate limiting to prevent brute force attacks
5. **CORS**: Configure CORS properly for production domains
6. **JWT Secret**: Use a strong, unique secret key in production

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if token is valid and not expired
2. **Token Missing**: Ensure token is stored in localStorage after login
3. **CORS Errors**: Verify backend CORS configuration
4. **Database Errors**: Check database connection and models

### Debug Steps

1. Check browser console for errors
2. Verify token in localStorage
3. Check network tab for API responses
4. Verify backend server is running
5. Check database connection

## Summary

The JWT implementation provides:
- ✅ Secure authentication for all protected routes
- ✅ Automatic token handling in frontend
- ✅ Middleware-based route protection
- ✅ Token expiration and auto-logout
- ✅ Comprehensive error handling
- ✅ Easy testing and debugging

All API calls now automatically include JWT tokens, and protected routes verify authentication before processing requests.
