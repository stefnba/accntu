import { APIErrorResponse, APIResponse, ErrorCode } from './types';

/**
 * Type for error handlers
 *
 * This type defines a structure for handling different error codes with
 * specific handler functions. It allows for code-specific error handling
 * with a fallback default handler.
 */
export type ErrorHandler<T = void> = {
    [key in ErrorCode]?: (error: APIErrorResponse) => T;
} & {
    default?: (error: APIErrorResponse) => T;
};

/**
 * Handles API errors with type-safe error handlers
 *
 * This function routes API errors to the appropriate handler based on the
 * error code. It provides a type-safe way to handle different error scenarios
 * with specific logic for each error type.
 *
 * @param error - The API error response to handle
 * @param handlers - Object with handlers for specific error codes
 * @returns The result of the handler or undefined if no handler matched
 * @example
 * ```
 * handleApiError(error, {
 *   'AUTH.USER_NOT_FOUND': (err) => showLoginForm(),
 *   'VALIDATION.INVALID_INPUT': (err) => highlightFormErrors(err.error.details),
 *   default: (err) => showGenericError(err.error.message)
 * });
 * ```
 */
export function handleApiError<T = void>(
    error: APIErrorResponse,
    handlers: ErrorHandler<T>
): T | undefined {
    const { code } = error.error;

    if (handlers[code]) {
        return handlers[code]!(error);
    }

    if (handlers.default) {
        return handlers.default(error);
    }

    console.error('Unhandled API error:', error);
    return undefined;
}

/**
 * Type-safe response handler for API responses
 *
 * This function provides a unified way to handle both successful and error
 * responses from API calls. It routes the response to either the success
 * handler or the appropriate error handler based on the response type.
 *
 * @param response - The API response to handle
 * @param onSuccess - Handler function for successful responses
 * @param onError - Handler function or object for error responses
 * @returns The result of the success or error handler
 * @example
 * ```
 * handleApiResponse(
 *   response,
 *   (data) => displayUserData(data),
 *   {
 *     'AUTH.SESSION_EXPIRED': () => redirectToLogin(),
 *     default: (err) => showErrorMessage(err.error.message)
 *   }
 * );
 * ```
 */
export function handleApiResponse<T, R = void, E = void>(
    response: APIResponse<T>,
    onSuccess: (data: T) => R,
    onError?: ErrorHandler<E> | ((error: APIErrorResponse) => E)
): R | E | undefined {
    if (response.success) {
        return onSuccess(response.data);
    }

    if (typeof onError === 'function') {
        return onError(response);
    }

    if (onError) {
        return handleApiError(response, onError);
    }

    console.error('Unhandled API error:', response);
    return undefined;
}

/**
 * Usage example:
 *
 * const response = await api.login(email, password);
 *
 * handleApiResponse(
 *   response,
 *   (data) => {
 *     // Handle success
 *     console.log('Logged in:', data.user);
 *     return true;
 *   },
 *   {
 *     'AUTH.INVALID_CREDENTIALS': (err) => {
 *       showToast(err.error.message);
 *       return false;
 *     },
 *     'AUTH.USER_NOT_FOUND': () => {
 *       navigate('/signup');
 *       return false;
 *     },
 *     default: (err) => {
 *       showToast('An error occurred');
 *       return false;
 *     }
 *   }
 * );
 */
