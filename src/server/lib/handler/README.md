# Handler Utilities

This directory contains utilities for handling database operations and route handling with consistent error handling and response formatting.

## Overview

The handler utilities provide a set of higher-order functions that wrap database operations and route handlers with standardized error handling, validation, and response formatting. These utilities help ensure consistent behavior across the application and reduce boilerplate code.

## Components

### 1. Database Handlers (`db.ts`)

Utilities for handling database operations:

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
// Direct imports
import { withDbQuery, withDbQueryValidated } from '@/server/lib/handler/db';

// Or use the central handler index with namespaces
import { db } from '@/server/lib/handler';

// Simple database query
const users = await withDbQuery(
  () => database.select().from(users).limit(10),
  'fetch users'
);

// Database query with validation
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
// Direct imports
import { withRoute, withMutationRoute } from '@/server/lib/handler/route';

// Or use the central handler index with namespaces
import { route } from '@/server/lib/handler';

// For GET requests
app.get('/users', async (c) => {
  return withRoute(c, async () => {
    const users = await fetchUsers();
    return users;
  });
});

// For POST requests using the namespace
app.post('/users', async (c) => {
  return route.withMutationRoute(c, async () => {
    const data = await c.req.json();
    const user = await createUser(data);
    return user;
  });
});
```

## Error Handling

These utilities integrate with the error handling system in `@/server/lib/error`. They use:

- `handleDatabaseError` from `@/server/lib/error/db` for database errors
- `handleRouteError` from `@/server/lib/error/route` for route errors

## Type Safety for Hono RPC

The route handlers maintain type safety for Hono RPC clients by using special conditional blocks in the error handling logic. These blocks are never executed at runtime but provide necessary type information for the RPC client to properly infer error response types.
