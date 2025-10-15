import { TPublicErrorCode } from '@/server/lib/errorOld/registry/public';
import {
    APIErrorResponseSchema,
    TAPIErrorResponse,
    TAPIResponse,
} from '@/server/lib/errorOld/response';

import { InvalidJSONValue, JSONValue, SimplifyDeepArray } from 'hono/utils/types';

/**
 * Type for error handlers that can handle both internal and public error codes
 */
export type ErrorHandler<T = void> = {
    [key in TPublicErrorCode]?: (error: TAPIErrorResponse) => T;
} & {
    default?: (error: TAPIErrorResponse) => T;
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
    error: TAPIErrorResponse,
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
export function handleApiResponse<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
    R = void,
    E = void,
>(
    response: TAPIResponse<T>,
    onSuccess: (data: T) => R,
    onError?: ErrorHandler<E> | ((error: TAPIErrorResponse) => E)
): R | E | undefined {
    if (!response) {
        return undefined;
    }

    // successful mutation response
    if (isSuccessResponse(response)) {
        return onSuccess(response.data);
    }

    // error response
    if (isErrorResponse(response)) {
        if (!onError) {
            return undefined;
        }

        if (typeof onError === 'function') {
            return onError(response);
        }

        return handleApiError(response, onError);
    }

    return undefined;
}

/**
 * Checks if an API response is a success response
 *
 * This function determines if the given API response is successful
 * by checking the success property.
 *
 * @param response - The API response to check
 * @returns True if the response is successful, false otherwise
 * @example
 * ```
 * const response = await api.getUser(userId);
 * if (isSuccessResponse(response)) {
 *   // Handle success case
 *   displayUserData(response.data);
 * } else {
 *   // Handle error case
 *   showErrorMessage(response.error.message);
 * }
 * ```
 */
export function isSuccessResponse<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
>(response: TAPIResponse<T>): response is { success: true; data: T } {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === true
    );
}

/**
 * Checks if an API response is an error response
 *
 * This function determines if the given API response is an error
 * by checking the success property.
 *
 * @param response - The API response to check
 * @returns True if the response is an error response, false otherwise
 */
export function isErrorResponse<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
>(response: TAPIResponse<T>): response is TAPIErrorResponse {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === false
    );
}

/**
 * React hook for handling API errors in components
 *
 * This hook provides a standardized way to handle API errors in React components.
 * It returns a function that can be used to handle errors from API calls.
 *
 * @param defaultHandler - Default handler for errors that don't match any specific code
 * @returns A function that can be used to handle errors
 * @example
 * ```
 * const handleError = useErrorHandler((err) => {
 *   toast.error(err.error.message);
 * });
 *
 * // In a component
 * const mutation = useMutation({
 *   mutationFn: api.createUser,
 *   onError: (error) => handleError(error, {
 *     'VALIDATION.INVALID_INPUT': (err) => {
 *       setFormErrors(err.error.details);
 *     },
 *     'AUTH.EMAIL_EXISTS': () => {
 *       setEmailError('This email is already registered');
 *     }
 *   })
 * });
 * ```
 */
export function useErrorHandler(defaultHandler: (error: TAPIErrorResponse) => void) {
    return function handleError(error: unknown, handlers?: ErrorHandler<void>): void {
        // If it's not an API error response, just log it
        if (
            !error ||
            typeof error !== 'object' ||
            !('error' in error) ||
            !error.error ||
            typeof error.error !== 'object' ||
            !('code' in error.error)
        ) {
            console.error('Unknown error format:', error);
            defaultHandler({
                success: false,
                error: {
                    code: 'SERVER.INTERNAL_ERROR',
                    message: 'An unexpected error occurred',
                },
                request_id: 'unknown',
            });
            return;
        }

        // Try to normalize the error
        const normalizedError = normalizeApiError(error);

        if (handlers) {
            // Try to handle with specific handlers
            const result = handleApiError(normalizedError, handlers);
            if (result !== undefined) {
                return;
            }
        }

        // Fall back to default handler
        defaultHandler(normalizedError);
    };
}

/**
 * Handles an API error response and returns a standardized error object
 *
 * This function parses the error response and returns a standardized error
 * object if the response is in our error format. If the response is not in
 * our error format, it returns a default error object.
 *
 * The function attempts to parse both internal and public error responses.
 *
 * @param error - The API error response to handle
 * @returns A standardized error object
 */
export const normalizeApiError = (error: any): TAPIErrorResponse => {
    // First try to parse as an internal error response
    const parsedInternalResult = APIErrorResponseSchema.safeParse(error);
    if (parsedInternalResult.success) {
        return parsedInternalResult.data;
    }

    // If neither format matches, create a default error
    return {
        success: false,
        error: {
            message: 'An unknown error occurred',
            code: 'SERVER.INTERNAL_ERROR',
            details: error,
        },
        request_id: 'client-generated',
    };
};

/**
 * Handles error handlers for API errors
 *
 * This function handles error handlers for API errors.
 *
 * @param error - The API error response to handle
 * @param handlers - Object with handlers for specific error codes
 * @returns The result of the handler or undefined if no handler matched
 */
export const handleErrorHandlers = (error: any, handlers?: ErrorHandler<void>) => {
    if (!handlers) {
        return;
    }

    const errorObj = normalizeApiError(error);
    const errorCode = errorObj?.error?.code;

    // If we have a handler for this specific error code, use it
    if (errorCode && handlers[errorCode]) {
        handlers[errorCode](errorObj);
    }
    // Otherwise use the default handler if available
    else if (handlers.default) {
        handlers.default(errorObj);
    }
};
