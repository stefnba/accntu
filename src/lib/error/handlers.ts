/**
 * Error Handler Execution
 *
 * Routes errors to appropriate handler functions based on error code.
 * Integrated with createQuery and createMutation's errorHandlers option.
 */

import { ErrorHandler } from './types';
import { normalizeApiError } from './normalize';

/**
 * Executes error handlers based on error code
 *
 * Routes the error to a specific handler (if defined) or the default handler.
 * Used by createQuery and createMutation to process the errorHandlers option.
 *
 * @param error - Any error object
 * @param handlers - Error handler configuration
 *
 * @example
 * ```typescript
 * // In createMutation:
 * handleErrorHandlers(error, errorHandlers);
 *
 * // Calls specific handler or default:
 * // handlers['VALIDATION.INVALID_INPUT']?.(errorObj)
 * // ?? handlers.default?.(errorObj)
 * ```
 */
export const handleErrorHandlers = (error: unknown, handlers?: ErrorHandler<void>): void => {
    if (!handlers) return;

    const errorObj = normalizeApiError(error);
    const errorCode = errorObj.error.code;

    // Execute specific handler or fallback to default
    const handler = handlers[errorCode] ?? handlers.default;

    if (handler) {
        handler(errorObj);
    }
};
