import { AppError } from '@/server/lib/error/base';
import { Context } from 'hono';

/**
 * Global error handler for Hono applications
 *
 * Converts any error into a standardized BaseError using convertToAppError and returns
 * a consistent JSON response. All errors are logged with appropriate stack traces and
 * error chains based on their severity.
 *
 * Note: Validation errors (ZodError) are pre-handled by handleZodError and arrive here
 * already converted to BaseError with validation-specific details.
 *
 * Error handling includes:
 * - BaseError: Used as is (including pre-converted validation errors)
 * - HTTPException: Converted to BaseError with original status
 * - APIError: Converted to BaseError with better-auth context
 * - Standard Error: Converted to BaseError with 500 status
 * - Unknown values: Converted to BaseError with generic error message
 *
 * @param error - Any error thrown during request processing
 * @param c - The Hono context
 * @returns JSON response with error details and appropriate status code
 */
export const handleGlobalError = (error: unknown, c: Context) => {
    const userId = c.get('user')?.id;

    // Convert the error to a AppError
    const appError = AppError.fromUnknown(error);

    /**
     * Logging Strategy:
     *
     * DEVELOPMENT:
     * - Constructor auto-logs immediately with formatted console output + JSON export
     * - Skip logging here to avoid duplicate console output
     * - JSON file already has all error details
     * - Request context not critical for local debugging
     *
     * PRODUCTION:
     * - Constructor auto-logs basic error details
     * - Log again HERE with full request context (method, URL, userId, status)
     * - Second log provides critical HTTP context for monitoring/debugging
     * - Both logs go to structured logger, second one is more complete
     */
    if (process.env.NODE_ENV !== 'development') {
        appError.log(
            {
                method: c.req.method,
                url: c.req.url,
                userId,
                status: appError.httpStatus,
            },
            {
                includeChain: true,
                includeStack: appError.httpStatus >= 500,
            }
        );
    }

    return c.json(appError.toResponse(), appError.httpStatus);
};
