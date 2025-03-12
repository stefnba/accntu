# Frontend Error Handling System

This document provides a comprehensive overview of the frontend error handling system in our application.

## Overview

The frontend error handling system is designed to provide consistent, type-safe error handling across all parts of the application. It integrates seamlessly with our API utilities and React components to ensure a smooth user experience even when errors occur.

## Core Components

### 1. Error Types and Handlers

The system is built around the `ErrorHandler` type, which allows for code-specific error handling:

```typescript
type ErrorHandler<T = void> = {
    [key in TPublicErrorCodes]?: (error: TAPIErrorResponse) => T;
} & {
    default?: (error: TAPIErrorResponse) => T;
};
```

This type enables you to define specific handlers for error codes, with a fallback default handler.

### 2. Error Normalization

The `normalizeApiError` function ensures all errors follow a consistent format:

```typescript
const normalizeApiError = (error: any): TAPIErrorResponse => {
    // Normalizes any error into a standard format
    // Handles different error response formats
};
```

This is crucial for consistent error handling regardless of the error source and format.

### 3. Error Type Guards

The system provides type guard functions to safely check response types:

```typescript
function isSuccessResponse<T>(response: TAPIResponse<T>): response is { success: true; data: T };
function isErrorResponse<T>(response: TAPIResponse<T>): response is TAPIErrorResponse;
```

These functions safely determine if a response is a success or error, with proper null checks.

### 4. API Integration

The error handling system is integrated with our API utilities:

- **Mutation Hooks**: `createMutation` in `src/lib/api/mutation.ts`
- **Query Hooks**: `createQuery` in `src/lib/api/query.ts`

Both utilities accept an `errorHandlers` option that allows components to specify how different errors should be handled.

## Response Formats

The backend system returns responses in a consistent format:

### Success Response
```typescript
{
    success: true,
    data: { ... } // The actual data
}
```

### Error Response
```typescript
{
    success: false,
    error: {
        code: 'SERVER.INTERNAL_ERROR', // Error code
        message: 'An error occurred', // User-friendly message
        details: { ... } // Optional additional details
    },
    request_id: '123abc'
}
```

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
        // Handle specific error codes
        'VALIDATION.INVALID_INPUT': (err) => {
            toast.error('Please check your input');
        },
        // Default handler for any other errors
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
            'RESOURCE.NOT_FOUND': () => {
                setNotFound(true);
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
            'SERVICE.NOT_FOUND': () => showNotFoundMessage(),
            'RESOURCE.NOT_FOUND': () => showNotFoundMessage(),
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

2. **Use Type Guards Safely**: Always use the provided type guards (`isSuccessResponse`, `isErrorResponse`) to safely check response types.

3. **Handle Common Error Codes**: Always handle common error codes like:
   - `AUTH.SESSION_EXPIRED`: Authentication expired
   - `VALIDATION.INVALID_INPUT`: Input validation issues
   - `RESOURCE.NOT_FOUND`: Resource not found
   - `SERVER.INTERNAL_ERROR`: Generic server errors

4. **Provide Default Handlers**: Always include a default handler to catch unexpected errors.

5. **Use Toast Notifications**: Use toast notifications for transient errors that don't require user action.

6. **Centralize Common Error Handling**: For errors that should be handled the same way across the application, create centralized error handlers.

## Type Safety

Our error handling system is designed with TypeScript in mind:

1. **Response Types**: The `TAPIResponse<T>` and `TAPIErrorResponse` types provide strong typing for API responses.

2. **Type Guards**: The `isSuccessResponse` and `isErrorResponse` functions act as type guards to safely narrow types.

3. **Error Handlers**: The `ErrorHandler<T>` type provides type safety for error handling functions.

## Integration with React Query

When using React Query, integrate our error handling system:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from '@/lib/error';

function UserData() {
    const handleError = useErrorHandler((err) => {
        toast.error(err.error.message);
    });

    const { data } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await apiClient.user.get();
            if (!isSuccessResponse(response)) {
                throw response; // Will be caught by onError
            }
            return response.data;
        },
        onError: (error) => handleError(error, {
            'AUTH.SESSION_EXPIRED': () => {
                navigate('/login');
            }
        })
    });

    // Rest of component
}
```

## Error Codes and Categories

### Internal Error Codes
The system uses detailed internal error codes (imported from the server):

- `AUTH.SESSION_EXPIRED`: Session expired
- `VALIDATION.INVALID_INPUT`: Invalid input data
- `DB.QUERY_FAILED`: Database query failed
- And many more specific codes

### Public Error Categories
For sanitized public responses, broader categories are used:

- `AUTH_ERROR`: Authentication/authorization issues
- `VALIDATION_ERROR`: Input validation issues
- `RESOURCE_ERROR`: Resource not found, already exists, etc.
- `RATE_LIMIT_ERROR`: Rate limiting or quota issues
- `SERVER_ERROR`: Generic server errors

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
            },
            'RESOURCE_ERROR': () => {
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
        },
        'VALIDATION_ERROR': (err) => {
            // Handle sanitized validation errors
            toast.error(err.error.message);
        }
    }
});
```

## Error Registry Integration

The client error handling system is designed to work seamlessly with the server's error registry system. The modular structure of the error registry makes it easier to handle errors in a type-safe way on the client side.

### Public Error Codes

The client error system uses the public error codes defined in the server's `public-error-codes.ts` file. These codes are used to match error handlers to specific error types:

```typescript
import { handleApiError } from '@/lib/error';

handleApiError(error, {
  'AUTH.UNAUTHORIZED': (err) => redirectToLogin(),
  'VALIDATION.INVALID_INPUT': (err) => showFormErrors(err),
  default: (err) => showGenericError(err.error.message)
});
```

### Benefits of the Modular Registry

The modular structure of the error registry provides several benefits for client-side error handling:

1. **Type Safety**: The client can import the `TPublicErrorCodes` type to ensure error handlers match actual error codes
2. **Consistent Error Messages**: Public error messages defined in the registry are used consistently across the application
3. **Better DX**: Developers get autocompletion for error codes when writing error handlers
4. **Easy Extensibility**: New error types can be added to the registry and immediately be available for client handling

### Error Handling Best Practices

When handling errors on the client side, follow these best practices:

1. **Always Use the Helper Functions**: Use `handleApiError` and `handleApiResponse` for consistent error handling
2. **Match Specific Error Codes First**: Handle specific error codes before falling back to generic handlers
3. **Provide User-Friendly Messages**: Show the `publicMessage` from the error response to users
4. **Handle Retry Logic**: Check the `shouldRetry` property for temporary errors that might succeed if retried
5. **Group Related Error Handlers**: Group error handlers by feature or domain for better organization

The modular registry system makes it easier to follow these best practices by providing a consistent, well-documented set of error codes and messages.

## Conclusion

The frontend error handling system provides a robust, type-safe way to handle errors across the application. By using this system consistently, you can ensure a smooth user experience even when errors occur.

For more information on the server-side error handling, see the [Server Error Handling README](/src/server/lib/error/README.md)
