# Frontend Error Handling System

This document provides a comprehensive overview of the frontend error handling system in our application.

## Overview

The frontend error handling system is designed to provide consistent, type-safe error handling across all parts of the application. It integrates seamlessly with our API utilities and React components to ensure a smooth user experience even when errors occur.

## Core Components

### 1. Error Types and Handlers

The system is built around the `ErrorHandler` type, which allows for code-specific error handling:

```typescript
type ErrorHandler<T = void> = {
    [key in ErrorCode]?: (error: APIErrorResponse) => T;
} & {
    default?: (error: APIErrorResponse) => T;
};
```

This type enables you to define specific handlers for different error codes, with a fallback default handler.

### 2. Error Normalization

The `normalizeApiError` function ensures all errors follow a consistent format:

```typescript
const normalizeApiError = (error: any): APIErrorResponseA => {
    // Normalizes any error into a standard format
};
```

This is crucial for consistent error handling regardless of the error source.

### 3. Error Handler Processing

The `handleErrorHandlers` function centralizes the logic for processing error handlers:

```typescript
const handleErrorHandlers = (error: any, handlers?: ErrorHandler<void>) => {
    // Processes error handlers based on error code
};
```

### 4. API Integration

The error handling system is integrated with our API utilities:

- **Mutation Hooks**: `createMutation` in `src/lib/api/mutation.ts`
- **Query Hooks**: `createQuery` in `src/lib/api/query.ts`

Both utilities accept an `errorHandlers` option that allows components to specify how different errors should be handled.

## Usage Guide

### Basic Error Handling

#### 1. Using Error Handlers with API Hooks

You can provide error handlers directly when creating API hooks:

```typescript
// In your API file
export const useUserEndpoints = {
    update: createMutation(apiClient.user.update.$patch, ['user']),
};

// In your component
const { mutate } = useUserEndpoints.update({
    errorHandlers: {
        'VALIDATION.INVALID_INPUT': (err) => {
            toast.error('Please check your input');
        },
        'AUTH.SESSION_EXPIRED': () => {
            toast.error('Your session has expired');
            window.location.href = '/login';
        },
        default: (err) => {
            toast.error(err.error.message || 'An error occurred');
        }
    }
});
```

#### 2. Checking Response Success

Use the `isSuccessResponse` function to check if an API response was successful:

```typescript
const response = await apiClient.user.get();
if (isSuccessResponse(response)) {
    // Handle success
    displayUserData(response.data);
} else {
    // Handle error
    showErrorMessage(response.error.message);
}
```

#### 3. Handling API Responses

Use the `handleApiResponse` function to handle both success and error cases:

```typescript
handleApiResponse(
    response,
    (data) => displayUserData(data),
    {
        'AUTH.SESSION_EXPIRED': () => redirectToLogin(),
        default: (err) => showErrorMessage(err.error.message)
    }
);
```

### Advanced Error Handling

#### 1. Using the useErrorHandler Hook

For more complex error handling in components, use the `useErrorHandler` hook:

```typescript
import { useErrorHandler } from '@/lib/error';
import toast from 'react-hot-toast';

function UserProfile() {
    const handleError = useErrorHandler((err) => {
        toast.error(err.error.message || 'An error occurred');
    });

    const mutation = useMutation({
        mutationFn: api.updateUser,
        onError: (error) => handleError(error, {
            'VALIDATION.INVALID_INPUT': (err) => {
                setFormErrors(err.error.details);
            },
            'AUTH.SESSION_EXPIRED': () => {
                router.push('/login');
            }
        })
    });

    // Rest of component
}
```

#### 2. Custom Error Processing

For custom error processing, you can use the `handleApiError` function directly:

```typescript
try {
    const response = await apiClient.user.get();
    if (!isSuccessResponse(response)) {
        handleApiError(response, {
            'AUTH.USER_NOT_FOUND': () => showNotFoundMessage(),
            default: (err) => showGenericError(err.error.message)
        });
        return;
    }
    // Process successful response
} catch (error) {
    const normalizedError = normalizeApiError(error);
    handleApiError(normalizedError, {
        // Error handlers
    });
}
```

## Best Practices

1. **Always Use Error Handlers**: Provide error handlers for all API calls to ensure a good user experience.

2. **Handle Common Error Codes**: Always handle common error codes like:
   - `AUTH.SESSION_EXPIRED`: Redirect to login
   - `VALIDATION.INVALID_INPUT`: Show validation errors
   - `INTERNAL_SERVER_ERROR`: Show a generic error message

3. **Provide Default Handlers**: Always include a default handler to catch unexpected errors.

4. **Use Toast Notifications**: Use toast notifications for transient errors that don't require user action.

5. **Centralize Common Error Handling**: For errors that should be handled the same way across the application, create centralized error handlers.

## Error Codes

The system uses the following error codes (imported from the server):

### Authentication Errors
- `AUTH.SESSION_NOT_FOUND`: Session not found
- `AUTH.SESSION_EXPIRED`: Session expired
- `AUTH.USER_NOT_FOUND`: User not found
- `AUTH.INVALID_CREDENTIALS`: Invalid credentials

### Validation Errors
- `VALIDATION.INVALID_INPUT`: Invalid input data
- `VALIDATION.MISSING_FIELD`: Required field is missing

### Database Errors
- `DB.QUERY_FAILED`: Database query failed
- `DB.UNIQUE_VIOLATION`: Unique constraint violation
- `DB.FOREIGN_KEY_VIOLATION`: Foreign key constraint violation

### Service Errors
- `SERVICE.CREATE_FAILED`: Failed to create resource
- `SERVICE.UPDATE_FAILED`: Failed to update resource
- `SERVICE.DELETE_FAILED`: Failed to delete resource
- `SERVICE.NOT_FOUND`: Resource not found
- `SERVICE.ALREADY_EXISTS`: Resource already exists

### Generic Errors
- `INTERNAL_SERVER_ERROR`: Generic server error

## Integration with React Query

The error handling system integrates seamlessly with React Query through our custom API utilities:

```typescript
// Creating a query hook
const useGetUser = createQuery(apiClient.user.get, ['user']);

// Using the query hook with error handlers
const { data, isLoading } = useGetUser(
    { id: userId },
    {
        errorHandlers: {
            'SERVICE.NOT_FOUND': () => {
                setNotFound(true);
            }
        }
    }
);

// Creating a mutation hook
const useUpdateUser = createMutation(apiClient.user.update, ['user']);

// Using the mutation hook with error handlers
const { mutate } = useUpdateUser({
    errorHandlers: {
        'VALIDATION.INVALID_INPUT': (err) => {
            setValidationErrors(err.error.details);
        }
    }
});
```

## Conclusion

The frontend error handling system provides a robust, type-safe way to handle errors across the application. By using this system consistently, you can ensure a smooth user experience even when errors occur.

For more information on the server-side error handling, see the [Server Error Handling README](/src/server/lib/error/README.md).
