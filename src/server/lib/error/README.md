# Error Handling System

This document provides a comprehensive overview of the error handling system in our application.

## Architecture Overview

The error handling system is designed to provide consistent, type-safe error handling across all layers of the application. It follows these key principles:

1. **Standardized Error Structure**: All errors use a common `BaseError` class
2. **Layer-specific Error Creation**: Errors are created with context about which layer they occurred in
3. **Error Chaining**: Errors can be chained to track propagation through application layers
4. **Consistent API Responses**: All errors are transformed into standardized API responses
5. **Error Privacy Layer**: Public responses are sanitized to hide implementation details
6. **Comprehensive Logging**: Errors are logged with detailed information for debugging
7. **Error Metrics**: Error occurrences are tracked for monitoring purposes
8. **Centralized Error Registry**: All error definitions in one place for consistency
9. **Performance Optimizations**: Caching, lazy evaluation, and batched processing for efficiency

## Performance Optimizations

The error handling system includes several optimizations for improved performance:

### 1. Error Definition Caching

A singleton cache for error definitions reduces redundant lookups:

```typescript
// Using the cached error definition
const errorDefinition = getCachedErrorDefinition(code);
```

The `ErrorDefinitionCache` class uses a singleton pattern to ensure a single cache instance throughout the application. It automatically caches error definitions as they're requested.

### 2. Lazy Error Chain Construction

The error chain is constructed only when first accessed, improving performance when chains aren't needed:

```typescript
// The chain is constructed on first access
console.log(error.errorChain);
```

### 3. Cached Public Responses

The `toResponse()` method caches sanitized public responses and only regenerates them when options change:

```typescript
// Same options will reuse the cached response
const response1 = error.toResponse({includeRequestId: true});
const response2 = error.toResponse({includeRequestId: true}); // Uses cache
```

### 4. Batched Error Metrics

Error metrics are buffered and flushed periodically to reduce overhead:

```typescript
// Error metrics are automatically batched and flushed every 5 seconds
error.trackError(); // Adds to buffer, not directly to metrics store
```

### 5. Simplified Error ID Generation

A dedicated utility function generates shorter, more efficient error IDs:

```typescript
// Generates a short, unique error ID
const errorId = generateErrorId();
```

## Context-Aware Error Creation

The system now includes context-aware error creation that automatically determines the appropriate layer:

### Stack Trace Analysis

The `createErrorFromContext()` method analyzes the call stack to determine the layer:

```typescript
// The layer is automatically determined based on the call stack
const error = errorFactory.createErrorFromContext({
  message: 'User not found',
  code: 'USER.NOT_FOUND'
});
```

This reduces the need to manually specify the layer in many common cases.

## Directory Structure

The error handling system is organized into two main directories:

1. **`src/server/lib/error/`**: Contains core error classes, types, and factory
   - Core error classes and types
   - Error registry for centralized error definitions
   - Error factory for creating different types of errors
   - Error handling functions for specific error types
   - Error sanitization for public responses
   - Global error handler for Hono applications
   - Utility functions for type checking and error operations

2. **`src/server/lib/handler/`**: Contains specialized handlers for database and route operations
   - Higher-order functions for database operations with error handling
   - Higher-order functions for route handlers with error handling
   - Centralized exports for all handler utilities

This separation allows for better organization and clearer separation of concerns.

## Core Components

### 1. Error Registry (`error/registry.ts`)

The foundation of the error system is the centralized error registry that defines all properties of each error code:

- **Error Definitions**: Each error code has a definition that includes:
  - `description`: Human-readable description of the error
  - `statusCode`: HTTP status code to use in responses
  - `publicCode`: Public error code for sanitization
  - `publicMessage`: User-friendly message for public responses
  - `isExpected`: Whether the error is expected in normal operation
  - `shouldRetry`: Whether the client should retry the operation
  - `retryAfterSeconds`: How long to wait before retrying

The registry serves as a single source of truth for error properties, ensuring consistency across the application.

### 2. BaseError Class (`error/base.ts`)

The `BaseError` class extends the native JavaScript `Error` class with additional functionality:

- **Error Metadata**: Includes error code, status code, timestamp, and trace ID
- **Lazy Error Chain**: Tracks error propagation through application layers (constructed on first access)
- **API Response Caching**: Caches sanitized responses for performance
- **Batched Metrics**: Uses a buffered approach to tracking error occurrences
- **Chain-aware Logging**: Provides detailed error logging with chain formatting
- **Error Metrics**: Tracks error occurrences for monitoring

### 3. Error Factory (`error/factory.ts`)

The `ErrorFactory` provides methods for creating different types of errors with consistent structure:

- `createApiError`: For errors in API routes and controllers
- `createServiceError`: For errors in business logic and services
- `createDatabaseError`: For database-related errors
- `createValidationError`: For data validation errors
- `createExternalError`: For errors in external service interactions
- `createAuthError`: For authentication-related errors
- `createErrorFromContext`: For context-aware error creation

All factory methods now use a consistent object parameter pattern for better type safety and flexibility.

### 4. Type Guards and Utilities (`error/utils.ts`)

Provides robust type guards and utility functions:

- `isBaseError`: Type guard to check if a value is a BaseError
- `isError`: Type guard to check if a value is a standard Error
- `getErrorMessage`: Extracts a message from any error type
- `generateErrorId`: Generates a short, unique error ID
- `createStructuredErrorDetails`: Creates a typed error details object

### 5. Error Types (`error/types.ts`)

Defines TypeScript types for the error system:

- `TErrorCode`: Union type of all possible error codes
- `ErrorLayer`: Application layers where errors can occur
- `ErrorChainItem`: Structure for an error in the error chain
- `ErrorOptions`: Options for creating a BaseError
- `TAPIErrorResponse`: Standard structure for API error responses
- `TAPIResponse`: Union type for all possible API responses

All error definition types now use readonly properties to enforce immutability.

### 6. Error Sanitization (`error/sanitize.ts`)

Provides error sanitization for public responses:

- `sanitizeErrorForPublic`: Transforms detailed errors into public-safe versions
- Supports configurable sanitization options

### 7. Global Error Handler (`error/handler.ts`)

Provides a global error handler for Hono applications:

- Catches all errors thrown during request processing
- Transforms different error types into standardized API responses
- Sets appropriate HTTP status codes
- Optionally sanitizes errors for public consumption
- Logs errors with detailed information
- Uses type guards for safer error handling

## Enhanced Logging

The system now includes enhanced logging capabilities:

### Chain-aware Logging

The `logError` method includes options for customizing log output:

```typescript
// Log with chain formatting and stack trace
error.logError(requestData, {
  includeChain: true,  // Include the error chain
  includeStack: true   // Include stack trace
});
```

The formatted chain provides a concise view of error propagation:

```
[ROUTE] AUTH.INVALID_TOKEN: Invalid authentication token (2023-03-15T10:30:00.000Z) →
[SERVICE] AUTH.SESSION_EXPIRED: Session has expired (2023-03-15T10:30:00.100Z)
```

## Error Flow

1. **Error Creation**: An error is created using the appropriate factory method
2. **Error Propagation**: As the error moves through application layers, it can be chained
3. **Error Handling**: The error is caught by Hono's middleware using our error handler
4. **Error Transformation**: The error is transformed into a standardized API response
5. **Error Sanitization**: The response is optionally sanitized for public consumption
6. **Error Logging**: The error is logged with detailed information
7. **Error Metrics**: The error occurrence is tracked for monitoring
8. **Client Handling**: The client receives the error response and can handle it appropriately

## Usage Examples

### Creating and Throwing Errors

```typescript
// Using the object parameter pattern
throw errorFactory.createDatabaseError({
  message: 'Failed to fetch user data',
  code: 'DB.QUERY_FAILED',
  cause: error
});

// Using context-aware error creation
throw errorFactory.createErrorFromContext({
  message: 'User not found',
  code: 'USER.NOT_FOUND'
});
```

### Using Type Guards

```typescript
try {
  // Operation that might throw
} catch (error) {
  if (isBaseError(error)) {
    // Handle BaseError
  } else if (isError(error)) {
    // Handle standard Error
  } else {
    // Handle other types
  }
}
```

### Creating Structured Error Details

```typescript
const details = createStructuredErrorDetails({
  userId: user.id,
  operation: 'update',
  fields: ['name', 'email']
});

throw errorFactory.createValidationError({
  message: 'Validation failed',
  code: 'VALIDATION.INVALID_INPUT',
  details
});
```

### Setting Up Error Handling with Chain-aware Logging

```typescript
// In the error handler
if (isBaseError(error)) {
  // Use full logging for unexpected errors, simplified for expected ones
  const isExpectedError = error.errorDefinition.isExpected;
  error.logError(requestData, {
    includeChain: true, // Always include chain in logs
    includeStack: !isExpectedError // Only include stack for unexpected errors
  });
  return c.json(error.toResponse(), error.statusCode);
}
```

## Best Practices

1. **Use Object Parameter Pattern**: Always use the object parameter pattern for clarity and flexibility
2. **Use Type Guards**: Use `isBaseError` and `isError` instead of `instanceof` checks
3. **Use Context-aware Creation**: Use `createErrorFromContext` when the layer can be determined automatically
4. **Consider Performance**: Be aware of the performance implications of error chains and detailed logging
5. **Structure Error Details**: Use `createStructuredErrorDetails` for type-safe error details
6. **Enable Caching**: Leverage the caching mechanisms for improved performance
7. **Configure Logging**: Use the logging options to control verbosity based on error severity
8. **Leverage Immutability**: Rely on the immutability of error definitions
9. **Use Factory Methods**: Always use the appropriate factory methods for different error types
10. **Check for Existing Errors**: Before creating new errors, check if you can reuse and chain an existing one

## Registry Structure

The error registry is designed for immutability and type safety:

```typescript
// All properties are readonly
export type ErrorDefinition<T extends string = string> = {
  readonly fullCode: T;
  readonly group: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly statusCode: ContentfulStatusCode;
  readonly isExpected: boolean;
  readonly publicCode: TPublicErrorCodes;
  readonly publicMessage: string;
  readonly shouldRetry?: boolean;
  readonly retryAfterSeconds?: number;
  readonly originalDefinition?: Record<string, unknown>;
};
```

The registry structure ensures that error definitions can't be modified after creation, improving reliability and predictability.

## Conclusion

The error handling system provides a robust, type-safe, and efficient way to handle errors across all layers of the application. By using this system consistently, you can ensure:

1. **Better User Experience**: Users see helpful, consistent error messages
2. **Improved Debugging**: Developers get detailed error information with context
3. **Enhanced Monitoring**: Error metrics help identify patterns and issues
4. **Optimized Performance**: Caching and lazy evaluation reduce overhead
5. **Stronger Type Safety**: Type guards and immutable definitions prevent errors

The optimizations and architectural improvements make the system not only more robust but also more efficient.
