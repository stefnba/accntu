/**
 * Frontend Error Type Definitions
 *
 * Provides type-safe error handling for API responses.
 * Used by createQuery and createMutation in src/lib/api
 */

import { TPublicErrorCode } from '@/server/lib/error/registry';
import { TAPIErrorResponse } from '@/server/lib/error/api-response';

/**
 * Type-safe error handler configuration
 *
 * Maps public error codes to handler functions.
 * Used in createQuery and createMutation's errorHandlers option.
 *
 * @example
 * ```typescript
 * const mutation = useMutation({
 *   errorHandlers: {
 *     'VALIDATION.INVALID_INPUT': (err) => setFormErrors(err.error.details),
 *     'AUTH.UNAUTHORIZED': () => redirect('/login'),
 *     default: (err) => toast.error(err.error.message)
 *   }
 * });
 * ```
 */
export type ErrorHandler<T = void> = {
    [key in TPublicErrorCode]?: (error: TAPIErrorResponse) => T;
} & {
    default?: (error: TAPIErrorResponse) => T;
};

// Re-export for convenience
export type { TAPIErrorResponse, TPublicErrorCode };
