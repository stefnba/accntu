# Error Handling System

## Overview

Our error handling system is a sophisticated, type-safe solution designed for consistent error management across the application. It provides error chaining, metrics tracking, sanitization, and standardized API responses.

## Core Components

### 1. Base Error Class (`base.ts`)

The foundation of our error system, extending native Error with:

- Unique trace IDs
- Error chaining
- Metrics tracking
- Response caching
- Structured logging

```typescript
throw new BaseError({
  errorCode: 'AUTH.USER_NOT_FOUND',
  message: 'User not found in database',
  details: { userId: '123' }
});
```

### 2. Error Factory (`factory.ts`)

Creates typed errors for different layers:

- `createApiError()`: API/Route errors
- `createServiceError()`: Business logic errors
- `createDatabaseError()`: Database operation errors
- `createValidationError()`: Input validation errors
- `createAuthError()`: Authentication/Authorization errors
- `createErrorFromContext()`: Context-aware errors

```typescript
throw errorFactory.createDatabaseError({
  code: 'DB.QUERY_FAILED',
  message: 'Failed to fetch user data',
  cause: error
});
```

### 3. Error Registry (`registry/`)

Central repository of error definitions:

- Error codes and messages

- HTTP status codes
- Public/Private error mappings
- Error categories
- Retry policies

### 4. Response Handling (`response/`)

Transforms errors into API responses:

- Sanitizes sensitive information
- Standardizes error format
- Includes request IDs
- Handles public/private error codes

## Error Categories

1. **API Errors** (`API_*`)
   - Route handling
   - Request validation
   - Response formatting

2. **Auth Errors** (`AUTH_*`)
   - Authentication
   - Authorization
   - Session management

3. **Database Errors** (`DB_*`)
   - Query failures
   - Connection issues
   - Constraint violations

4. **Validation Errors** (`VALIDATION_*`)
   - Input validation
   - Schema validation
   - Business rule validation

5. **Service Errors** (`SERVICE_*`)
   - Business logic
   - External service integration
   - Process failures

## Error Chain Example

```typescript
// Original error
throw errorFactory.createDatabaseError({
  code: 'DB.QUERY_FAILED',
  message: 'Failed to fetch user'
});

// Caught and chained in service
try {
  await db.getUser(id);
} catch (error) {
  throw errorFactory.createServiceError({
    code: 'USER.NOT_FOUND',
    cause: error
  });
}

// Final API error response
{
  "success": false,
  "error": {
    "code": "USER.NOT_FOUND",
    "message": "User not found"
  },
  "request_id": "trace_123",
  "chain": [
    {
      "type": "SERVICE",
      "code": "USER.NOT_FOUND",
      "timestamp": "2024-03-15T..."
    },
    {
      "type": "DATABASE",
      "code": "DB.QUERY_FAILED",
      "timestamp": "2024-03-15T..."
    }
  ]
}
```

## Performance Features

1. **Error Definition Caching**
   - Cached error definitions
   - Lazy chain construction
   - Response caching

2. **Metrics Buffering**
   - Batched metrics updates
   - Configurable flush intervals
   - Memory-efficient tracking

## Best Practices

1. **Creating Errors**
   - Use factory methods instead of direct instantiation
   - Include relevant error details
   - Chain errors when propagating
   - Use specific error codes

2. **Handling Errors**
   - Handle errors at appropriate layers
   - Log with proper context
   - Sanitize sensitive information
   - Return standardized responses

3. **Error Codes**
   - Use descriptive codes
   - Follow category.action format
   - Keep messages user-friendly
   - Include actionable information

4. **Logging**
   - Include trace IDs
   - Log full error chains
   - Add request context
   - Use appropriate log levels

## Usage Examples

### Service Layer

```typescript
try {
  const user = await db.findUser(id);
  if (!user) {
    throw errorFactory.createServiceError({
      code: 'USER.NOT_FOUND',
      details: { userId: id }
    });
  }
} catch (error) {
  throw errorFactory.createServiceError({
    code: 'USER.FETCH_FAILED',
    cause: error
  });
}
```

### API Layer

```typescript
app.onError((error, c) => {
  const baseError = convertToAppError(error);
  return c.json(
    baseError.toResponse({ includeChain: true }),
    baseError.statusCode
  );
});
```

### Validation

```typescript
if (!isValidEmail(email)) {
  throw errorFactory.createValidationError({
    code: 'VALIDATION.INVALID_EMAIL',
    details: { email }
  });
}
```

## Metrics and Monitoring

The system automatically tracks:

- Error frequencies
- Error patterns
- Response times
- Chain depths
- Recovery rates

Access metrics via:

```typescript
const metrics = getErrorMetrics();
console.log(metrics['AUTH.USER_NOT_FOUND'].count);
```

## Testing

Test error handling using:

```typescript
expect(() => {
  throw errorFactory.createServiceError({
    code: 'USER.NOT_FOUND'
  });
}).toThrow(BaseError);
```

## Error Recovery

Some errors support automatic recovery:

- Session expiration
- Connection losses
- Rate limiting
- Stale data

## Future Improvements

1. Enhanced error prediction
2. ML-based error grouping
3. Automated recovery strategies
4. Extended metrics analysis
5. Custom error dashboards
