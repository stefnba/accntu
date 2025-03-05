# Middleware

This directory contains shared middleware for the Hono application. Middleware functions are used to process requests before they reach the route handlers, providing cross-cutting functionality like authentication, logging, and error handling.

## Usage

Middleware can be applied at different levels:

1. **Global Middleware**: Applied to all routes
2. **Route Group Middleware**: Applied to a group of routes
3. **Route-Specific Middleware**: Applied to a specific route

```typescript
// Global middleware
app.use('*', middleware1);

// Route group middleware
app.route('/api', apiRoutes).use('*', middleware2);

// Route-specific middleware
app.get('/protected', middleware3, (c) => {
  // Handler
});
```

## Available Middleware

### Authentication Middleware

Located in `src/server/features/auth/middleware.ts`:

- `requireAuth`: Ensures the user is authenticated
- `requireAdmin`: Ensures the user has admin privileges

```typescript
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

### Error Handling Middleware

The error handling middleware is configured in the main `src/server/index.ts` file using Hono's `onError` hook:

```typescript
import { handleError } from '@/server/lib/error/handler';

// Use Hono's onError hook with our error handler
app.onError(handleError);
```

## Creating Custom Middleware

Custom middleware follows the Hono middleware pattern:

```typescript
import { Context, Next } from 'hono';

export const customMiddleware = async (c: Context, next: Next) => {
  // Do something before the request is handled
  console.log('Request received:', c.req.path);

  // Call the next middleware or route handler
  await next();

  // Do something after the request is handled
  console.log('Response sent with status:', c.res.status);
};
```

## Best Practices

1. **Keep Middleware Focused**: Each middleware should have a single responsibility.
2. **Handle Errors**: Use try-catch blocks to handle errors and prevent them from crashing the application.
3. **Use Type Safety**: Leverage TypeScript to ensure type safety in middleware functions.
4. **Document Middleware**: Provide clear documentation for each middleware function.
5. **Consider Performance**: Be mindful of the performance impact of middleware, especially for global middleware.
