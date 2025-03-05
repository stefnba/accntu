# Cookie Management

This module provides a centralized approach to cookie management in the application using Hono's built-in cookie helpers.

## Structure

- `constants.ts`: Defines cookie names and default options
- `index.ts`: Exports utility functions for cookie operations

## Implementation Approach

### 1. Cookie Constants

All cookie names should be defined in `constants.ts` to ensure consistency across the application:

```typescript
export const COOKIE_NAMES = {
  AUTH_SESSION: 'auth_session',
  AUTH_REFRESH_TOKEN: 'auth_refresh_token',
  // ...other cookie names
};

export type TCookieNames = keyof typeof COOKIE_NAMES;
```

### 2. Cookie Utility Functions

The module provides utility functions that wrap Hono's cookie helpers:

```typescript
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

// Set a secure cookie (HTTP-only, secure in production)
export function setSecureCookie(c: Context, name: TCookieNames, value: string) {
  setCookie(c, name, value, COOKIE_OPTIONS.SECURE);
}

// Set a preference cookie (accessible by client-side JavaScript)
export function setPreferenceCookie(c: Context, name: TCookieNames, value: string) {
  setCookie(c, name, value, COOKIE_OPTIONS.PREFERENCES);
}

// Set a session cookie (expires when browser is closed)
export function setSessionCookie(c: Context, name: string, value: string) {
  setCookie(c, name, value, COOKIE_OPTIONS.SESSION);
}

// Delete a cookie
export function clearCookie(c: Context, name: string) {
  deleteCookie(c, name, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
}

// Get a cookie value
export function getCookieValue(c: Context, name: string) {
  return getCookie(c, name);
}

// Get all cookies
export function getAllCookies(c: Context) {
  return getCookie(c);
}
```

### 3. Cookie Operations in Services

Cookie operations are performed directly in service functions that handle HTTP context:

```typescript
// Session service (handles HTTP concerns including cookies)
export const createSession = async (c: Context, user: TUser) => {
  // Create session record in database
  const session = await sessionQueries.createSessionRecord({
    userId: user.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    ipAddress: c.req.header('x-forwarded-for') || '',
    userAgent: c.req.header('user-agent'),
  });

  // Set session cookie
  const sessionId = createId();
  setSecureCookie(c, 'AUTH_SESSION', sessionId);

  return sessionId;
};
```

## Best Practices

1. **Centralized Constants**: Always use `COOKIE_NAMES` constants instead of hardcoding cookie names
2. **Security**: Use secure, HTTP-only cookies for sensitive data
3. **Cookie Types**: Use the appropriate cookie type for each use case:
   - `setSecureCookie`: For sensitive data like session tokens
   - `setPreferenceCookie`: For user preferences accessible by client-side JavaScript
   - `setSessionCookie`: For temporary data that expires when the browser is closed
4. **Error Handling**: Handle cookie-related errors gracefully

## Integration with Hono

To use cookies with Hono, make sure to include the cookie middleware:

```typescript
import { Hono } from 'hono';
import { cookie } from 'hono/cookie';

const app = new Hono();
app.use('*', cookie());
```
