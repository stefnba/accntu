# Route Handlers with Error Handling

This document explains how to use the route handler utilities in the error handling system.

## Overview

The route handler utilities provide a consistent way to handle errors in your API routes while maintaining type safety for Hono RPC clients. They ensure that all responses follow a standardized format, making client-side error handling more predictable.

There are three main route handler utilities:

1. `withRoute`: For standard API routes (typically GET requests)
2. `withQueryRoute`: For query operations that return data directly
3. `withMutationRoute`: For mutation operations (POST, PUT, PATCH, DELETE)

## withRoute

The `withRoute` function is designed for standard API routes that return data directly. It handles errors consistently and returns the data as-is for successful operations.

### Usage

```typescript
import { withRoute } from '@/server/lib/error/route-handler';

app.get('/users', async (c) => {
  return withRoute(c, async () => {
    // Your route logic here
    const users = await fetchUsers();
    return users; // Returns data directly
  });
});
```

### Response Format

For successful operations, the response will be the data returned by your handler function:

```json
[
  {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": "2",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
]
```

For errors, the response will follow the standard error format:

```json
{
  "success": false,
  "error": {
    "code": "USER.NOT_FOUND",
    "message": "User not found",
    "details": {}
  },
  "trace_id": "abc123"
}
```

## withQueryRoute

The `withQueryRoute` function is similar to `withRoute` but always returns a 200 status code for successful operations. It's designed specifically for query operations.

### Usage

```typescript
import { withQueryRoute } from '@/server/lib/error/route-handler';

app.get('/users', async (c) => {
  return withQueryRoute(c, async () => {
    const users = await fetchUsers();
    return users; // Returns data directly with 200 status
  });
});
```

## withMutationRoute

The `withMutationRoute` function is designed for mutation operations (POST, PUT, PATCH, DELETE). It wraps successful responses in a standardized format with a `success` flag and a `data` property, and returns a 201 status code.

### Usage

```typescript
import { withMutationRoute } from '@/server/lib/error/route-handler';
import { zValidator } from '@hono/zod-validator';

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

app.post('/users', zValidator('json', CreateUserSchema), async (c) => {
  return withMutationRoute(c, async () => {
    const data = c.req.valid('json');
    const user = await createUser(data);
    return user; // Will be wrapped in { success: true, data: user }
  });
});
```

### Response Format

For successful operations, the response will be wrapped in a standardized format:

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

For errors, the response will follow the same standard error format as `withRoute`.

## Error Handling

All three functions handle errors consistently by re-throwing them to be caught by the global error handler. This ensures that all errors are processed in a standardized way.

### Hono RPC Type Safety

The route handlers use a special technique in the `handleRouteError` function to maintain type safety for Hono RPC clients:

```typescript
// IMPORTANT: This conditional block is required for Hono RPC type safety
// It's never executed at runtime, but provides necessary type information
// for the RPC client to properly infer error response types
if (false as boolean) {
    return c.json(error.toResponse(), errorStatusCode);
}
```

These conditional blocks are never executed at runtime (the condition is always false), but they provide necessary type information for the Hono RPC client to properly infer error response types. Without these blocks, the RPC client would not be able to correctly type the error responses, leading to type errors or incorrect type inference.

This technique is a form of "type hinting" that helps TypeScript understand the possible return types without actually executing the code. It's a common pattern in TypeScript libraries that need to maintain type safety across complex control flows.

### Throwing Errors

You can throw errors from your handler functions using the `errorFactory`:

```typescript
import { errorFactory } from '@/server/lib/error';

if (!user) {
  throw errorFactory.createApiError({
    message: 'User not found',
    code: 'USER.NOT_FOUND',
    statusCode: 404
  });
}
```

## Type Safety

All functions maintain type safety for Hono RPC clients, ensuring that the response types are properly inferred.

## Best Practices

1. Use `withRoute` for general API routes
2. Use `withQueryRoute` for GET requests that should always return 200
3. Use `withMutationRoute` for POST, PUT, PATCH, and DELETE operations
4. Use the `errorFactory` to create and throw errors with appropriate codes and status codes
5. Handle validation using Zod schemas and the `zValidator` middleware
6. Keep your handler functions focused on business logic, letting the route handlers take care of error handling

## Complete Example

```typescript
import { Hono } from 'hono';
import { withMutationRoute, withQueryRoute } from '@/server/lib/error/route-handler';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { errorFactory } from '@/server/lib/error';

// Example schema for user creation
const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// Create a new Hono app for user routes
export const userRoutes = new Hono();

// GET route using withQueryRoute
userRoutes.get('/', async (c) => {
  return withQueryRoute(c, async () => {
    const users = await getUsers();
    return users; // Returns data directly
  });
});

// POST route using withMutationRoute
userRoutes.post('/', zValidator('json', CreateUserSchema), async (c) => {
  return withMutationRoute(c, async () => {
    const data = c.req.valid('json');

    // Example error handling
    if (data.email === 'exists@example.com') {
      throw errorFactory.createApiError({
        message: 'Email already exists',
        code: 'AUTH.EMAIL_EXISTS',
        statusCode: 409
      });
    }

    const user = await createUser(data);
    return user; // Will be wrapped in { success: true, data: user }
  });
});
```
