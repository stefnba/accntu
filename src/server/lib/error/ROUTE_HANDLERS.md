# Route Handlers with Error Handling

This document explains how to use the route handler utilities in the error handling system.

## Overview

The route handler utilities provide a consistent way to handle errors in your API routes while maintaining type safety for Hono RPC clients. They ensure that all responses follow a standardized format, making client-side error handling more predictable.

There are two main route handler utilities:

1. `withRoute`: For standard API routes (typically GET requests)
2. `withMutationRoute`: For mutation operations (POST, PUT, PATCH, DELETE)

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

## withMutationRoute

The `withMutationRoute` function is designed for mutation operations (POST, PUT, PATCH, DELETE). It wraps successful responses in a standardized format with a `success` flag and a `data` property.

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

Both functions handle errors consistently:

1. `BaseError` instances are transformed into standardized API responses with appropriate status codes
2. Unknown errors are wrapped in a generic error response with a 500 status code

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

Both functions maintain type safety for Hono RPC clients, ensuring that the response types are properly inferred.

## Best Practices

1. Use `withRoute` for GET requests and other operations that return data directly
2. Use `withMutationRoute` for POST, PUT, PATCH, and DELETE operations
3. Use the `errorFactory` to create and throw errors with appropriate codes and status codes
4. Handle validation using Zod schemas and the `zValidator` middleware
5. Keep your handler functions focused on business logic, letting the route handlers take care of error handling

## Complete Example

```typescript
import { Hono } from 'hono';
import { withMutationRoute, withRoute } from '@/server/lib/error/route-handler';
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

// GET route using withRoute
userRoutes.get('/', async (c) => {
  return withRoute(c, async () => {
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
