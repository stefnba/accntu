# Handler Utilities

This directory contains utilities for handling database operations and route handling with consistent error handling and response formatting.

## Overview

The handler utilities provide a set of higher-order functions that wrap database operations and route handlers with standardized error handling, validation, and response formatting. These utilities help ensure consistent behavior across the application and reduce boilerplate code.

## Components

### 1. Database Handlers (`db.ts`)

Utilities for handling database operations:

- `handleDatabaseError`: Transforms database errors into structured errors
- `withDbQuery`: Executes a database query with error handling
- `withDbQueryNullable`: Executes a database query that may return null
- `withDbQueryValidated`: Executes a database query with input and output validation
- `withDbQueryValidatedNullable`: Executes a database query with validation that may return null
- `withTransaction`: Executes a database operation within a transaction

### 2. Route Handlers (`route.ts`)

Utilities for handling route operations:

- `withRoute`: Wraps a route handler with error handling
- `withQueryRoute`: Wraps a query route handler with standardized response formatting
- `withMutationRoute`: Wraps a mutation route handler with standardized response formatting

### 3. Handler Index (`index.ts`)

A central export point for all handler utilities:

- Re-exports all database handler utilities as `db`
- Re-exports all route handler utilities as `route`

## Usage

### Database Handlers

```typescript
import { withDbQuery, withDbQueryValidated } from '@/server/lib/handler/db';
// Or use the central handler index
import { db } from '@/server/lib/handler';

// Simple database query
const users = await withDbQuery(
  () => database.select().from(users).limit(10),
  'fetch users'
);

// Database query with validation using the central index
const user = await db.withDbQueryValidated({
  inputSchema: userSchema,
  outputSchema: userSchema,
  inputData: userData,
  queryFn: (validData) => database.insert(users).values(validData).returning(),
  operation: 'create user'
});
```

### Route Handlers

```typescript
import { withRoute, withMutationRoute } from '@/server/lib/handler/route';
// Or use the central handler index
import { route } from '@/server/lib/handler';

// For GET requests
app.get('/users', async (c) => {
  return withRoute(c, async () => {
    const users = await fetchUsers();
    return users;
  });
});

// For POST requests using the central index
app.post('/users', async (c) => {
  return route.withMutationRoute(c, async () => {
    const data = await c.req.json();
    const user = await createUser(data);
    return user;
  });
});
```

## Type Safety for Hono RPC

The route handlers include special conditional blocks in the `handleRouteError` function that are critical for Hono RPC type safety:

```typescript
// IMPORTANT: This conditional block is required for Hono RPC type safety
// It's never executed at runtime, but provides necessary type information
// for the RPC client to properly infer error response types
if (false as boolean) {
    return c.json(error.toResponse(), errorStatusCode);
}
```

These blocks are never executed at runtime (the condition is always false), but they provide necessary type information for the Hono RPC client to properly infer error response types. Without these blocks, the RPC client would not be able to correctly type the error responses, leading to type errors or incorrect type inference.
