# Error Handling System

This document provides a comprehensive overview of the error handling system in our application.

## Architecture Overview

The error handling system is designed to provide consistent, type-safe error handling across all layers of the application. It follows these key principles:

1. **Standardized Error Structure**: All errors use a common `BaseError` class
2. **Layer-specific Error Creation**: Errors are created with context about which layer they occurred in
3. **Error Chaining**: Errors can be chained to track propagation through application layers
4. **Consistent API Responses**: All errors are transformed into standardized API responses
5. **Comprehensive Logging**: Errors are logged with detailed information for debugging
6. **Error Metrics**: Error occurrences are tracked for monitoring purposes

## Core Components

### 1. BaseError Class (`base.ts`)

The foundation of the error system is the `BaseError` class, which extends the native JavaScript `Error` class with additional functionality:

- **Error Metadata**: Includes error code, status code, timestamp, and trace ID
- **Error Chain**: Tracks error propagation through application layers
- **API Response Conversion**: Transforms errors into standardized API responses
- **Error Logging**: Provides detailed error logging
- **Error Metrics**: Tracks error occurrences for monitoring

### 2. Error Factory (`factory.ts`)

The `ErrorFactory` provides methods for creating different types of errors with consistent structure:

- `createApiError`: For errors in API routes and controllers
- `createServiceError`: For errors in business logic and services
- `createDatabaseError`: For database-related errors
- `createValidationError`: For data validation errors
- `createExternalError`: For errors in external service interactions
- `createAuthError`: For authentication-related errors

### 3. Error Types (`types.ts`)

Defines TypeScript types for the error system:

- `ErrorCode`: Enumeration of all possible error codes
- `ErrorLayer`: Application layers where errors can occur
- `ErrorChainItem`: Structure for an error in the error chain
- `ErrorOptions`: Options for creating a BaseError
- `APIErrorResponse`: Standard structure for API error responses
- `APIMutationResponse`: Standard structure for API success responses
- `APIResponse`: Union type for all possible API responses

### 4. Global Error Handler (`global-handler.ts`)

Provides a global error handler for Hono applications:

- Catches all errors thrown during request processing
- Transforms different error types into standardized API responses
- Sets appropriate HTTP status codes
- Logs errors with detailed information

### 5. Route Handlers (`route-handler.ts`)

Provides utilities for handling errors in route handlers:

- `withRoute`: For standard API routes (typically GET requests)
- `withQueryRoute`: For query operations that return data directly
- `withMutationRoute`: For mutation operations (POST, PUT, PATCH, DELETE)

#### Type Safety for Hono RPC

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

### 6. Validation Error Handling (`validation.ts`)

Specialized handling for validation errors:

- Transforms Zod validation errors into structured validation errors
- Provides utilities for handling validation errors

### 7. Database Error Handling (`db.ts`)

Utilities for handling database errors:

- Transforms database errors into structured errors
- Provides higher-order functions for executing database queries with error handling
- Includes transaction support

### 8. Response Utilities (`response.ts`)

Utilities for creating standardized API responses:

- Creates success responses with consistent structure
- Provides type guards for response types

## Error Creation Approaches

The error handling system provides two main approaches for creating errors:

### 1. Direct Error Creation

Using the `errorFactory` methods directly to create and throw errors:

```typescript
throw errorFactory.createAuthError({
  message: 'User not found',
  code: 'AUTH.USER_NOT_FOUND',
  statusCode: 404
});
```

This approach is best for:

- Business logic errors that are expected and well-defined
- Cases where you need to explicitly specify the error message, code, and status
- Situations where the error context is clear and doesn't require special handling

### 2. Handler Function Approach

Using specialized handler functions that analyze and transform errors:

```typescript
handleDatabaseError(error as Error, 'fetch user operation');
```

This approach is best for:

- Errors from external systems (like databases or validation libraries)
- Cases where errors need translation from external formats to application formats
- Situations where error patterns can be detected and mapped consistently

The codebase uses specialized handlers for database errors (`handleDatabaseError`) and validation errors (`handleZodError`) because these come from external systems and require specialized knowledge to interpret and transform.

## Error Flow

1. **Error Creation**: An error is created using the appropriate factory method
2. **Error Propagation**: As the error moves through application layers, it can be chained
3. **Error Handling**: The error is caught by Hono's `onError` hook using our error handler
4. **Error Transformation**: The error is transformed into a standardized API response
5. **Error Logging**: The error is logged with detailed information
6. **Error Metrics**: The error occurrence is tracked for monitoring
7. **Client Handling**: The client receives the error response and can handle it appropriately

## Usage Examples

### Creating and Throwing Errors

```typescript
// In a database layer
try {
  // Database operation
} catch (error) {
  throw errorFactory.createDatabaseError({
    message: 'Failed to fetch user data',
    code: 'DB.QUERY_FAILED',
    cause: error instanceof Error ? error : undefined
  });
}

// In a service layer
try {
  // Service operation
} catch (error) {
  if (error instanceof BaseError) {
    // Add context to existing error
    throw error.addToChain('service', 'User service error', 'USER.NOT_FOUND');
  }
  throw errorFactory.createServiceError({
    message: 'Failed to process user data',
    code: 'USER.NOT_FOUND',
    cause: error instanceof Error ? error : undefined,
    statusCode: 404
  });
}

// In an API route
if (!user) {
  throw errorFactory.createApiError({
    message: 'User not found',
    code: 'USER.NOT_FOUND',
    statusCode: 404
  });
}
```

### Setting Up Error Handling

```typescript
import { Hono } from 'hono';
import { handleError } from './lib/error/global-handler';

const app = new Hono();

// Apply error handler using Hono's onError hook
app.onError(handleError);

// Define routes
app.get('/users/:id', async (c) => {
  // Route handler that might throw errors
});

export default app;
```

### Using Route Handlers

```typescript
// Import from the new handler directory
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

## Best Practices

1. **Use Appropriate Error Types**: Choose the right factory method for the error context
2. **Include Meaningful Messages**: Error messages should be clear and actionable
3. **Chain Errors When Appropriate**: Add context as errors propagate through layers
4. **Set Appropriate Status Codes**: Use HTTP status codes that match the error type
5. **Use Route Handlers**: Leverage the route handler utilities for consistent error handling
6. **Handle Database Errors**: Use the database utilities to handle database errors consistently
7. **Validate Input**: Use Zod for validation and the validation error handler for consistent error responses
8. **Monitor Error Metrics**: Use the error metrics for monitoring and alerting
