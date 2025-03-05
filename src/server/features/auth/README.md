# Authentication Feature

This directory contains the authentication feature for the application, which handles user authentication, session management, and authorization.

## Directory Structure

```
src/server/features/auth/
├── queries/           # Database queries for auth-related operations
│   ├── email-otp.ts   # Email OTP queries
│   └── session.ts     # Session queries
├── services/          # Business logic for auth-related operations
│   ├── auth.ts        # Main auth service
│   ├── email-otp.ts   # Email OTP service
│   ├── oauth.ts       # OAuth service
│   └── session.ts     # Session service
├── middleware.ts      # Auth middleware for protecting routes
├── routes.ts          # Auth API routes
└── schemas.ts         # Validation schemas for auth-related operations
```

## Usage

### Importing Services and Queries

```typescript
// Import services
import * as authServices from '@/server/features/auth/services/auth';
import * as sessionServices from '@/server/features/auth/services/session';
import * as emailOtpServices from '@/server/features/auth/services/email-otp';
import * as oauthServices from '@/server/features/auth/services/oauth';

// Import queries
import * as sessionQueries from '@/server/features/auth/queries/session';
import * as emailOtpQueries from '@/server/features/auth/queries/email-otp';
```

### Session Management

The session management system uses Hono's context to handle cookies directly in the service layer, following a centralized approach:

```typescript
// Create a session for a user (handles cookie setting internally)
await sessionServices.createSession(c, user);

// Get session from cookie
const session = await sessionServices.getSessionFromCookie(c);

// Invalidate session and clear cookie
await sessionServices.invalidateSessionFromCookie(c);

// Validate session from cookie (throws error if invalid)
const user = await sessionServices.validateSessionFromCookie(c);
```

### Authenticating a User

```typescript
// Authenticate with email OTP
await authServices.authenticateWithEmailOtp(c, { email: 'user@example.com' });

// Verify email OTP and create session
const user = await authServices.verifyEmailOtpAndCreateSession(c, {
  token: 'token123',
  otp: '123456'
});

// Get current user from session
const currentUser = await authServices.getCurrentUser(c);

// Logout user
await authServices.logout(c);
```

### Protecting Routes with Middleware

```typescript
// In your route file
import { requireAuth, requireAdmin } from '@/server/features/auth/middleware';

// Protect a route
app.get('/protected', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// Admin-only route
app.get('/admin', requireAuth, requireAdmin, (c) => {
  return c.json({ message: 'Admin area' });
});
```

## Auth Methods

The authentication system supports multiple authentication methods:

1. **Email OTP**: One-time password sent to the user's email
2. **OAuth**: Authentication with third-party providers (Google, GitHub, etc.)
3. **Magic Link**: Passwordless authentication via email links

Each authentication method integrates with the same session management system, providing a consistent user experience regardless of the authentication method used.

## Cookie Management

The authentication system uses Hono's built-in cookie helpers for managing cookies through a centralized utility layer:

```typescript
import { getCookieValue, setSecureCookie, clearCookie } from '@/server/lib/cookies';

// Set a secure cookie (HTTP-only, secure in production)
setSecureCookie(c, COOKIE_NAMES.AUTH_SESSION, sessionId);

// Get a cookie value
const sessionId = getCookieValue(c, COOKIE_NAMES.AUTH_SESSION);

// Clear a cookie
clearCookie(c, COOKIE_NAMES.AUTH_SESSION);

// Set a preference cookie (accessible by client-side JavaScript)
setPreferenceCookie(c, COOKIE_NAMES.THEME, 'dark');

// Set a session cookie (expires when browser is closed)
setSessionCookie(c, COOKIE_NAMES.CSRF_TOKEN, csrfToken);

// Get all cookies
const allCookies = getAllCookies(c);
```

### Cookie Constants

All cookie names are centralized in `COOKIE_NAMES` constant:

```typescript
export const COOKIE_NAMES = {
  // Auth related cookies
  AUTH_SESSION: 'auth_session',
  AUTH_REFRESH_TOKEN: 'refresh_token',
  CSRF_TOKEN: 'csrf_token',

  // User preferences
  THEME: 'theme',
  LANGUAGE: 'language',

  // Feature flags
  BETA_FEATURES: 'beta_features',
};
```

## Error Handling

The authentication system uses a centralized error handling approach:

```typescript
// In services
throw errorFactory.createAuthError({
  message: 'Invalid or expired session',
  code: 'AUTH.SESSION_NOT_FOUND',
  statusCode: 401,
});

// In middleware
try {
  // Authentication logic
} catch (error) {
  // Error handling
  if (error instanceof HTTPException) throw error;
  throw new HTTPException(500, { message: 'Internal error' });
}
```

## Code Style

All functions in this feature use object parameters instead of positional parameters for better maintainability and readability:

```typescript
// Good
function doSomething({ param1, param2 }: { param1: string; param2: number }) {
  // ...
}

// Bad
function doSomething(param1: string, param2: number) {
  // ...
}
```

This makes the code more maintainable, self-documenting, and easier to extend in the future.
