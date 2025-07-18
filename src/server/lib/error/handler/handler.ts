import { logDevError, shouldUseDevFormatting } from '@/server/lib/error/dev-formatter';
import { TErrorRequestData } from '@/server/lib/error/types';
import { convertToAppError } from '@/server/lib/error/utils';
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
    const { error: appError } = convertToAppError(error);

    const requestData: TErrorRequestData = {
        method: c.req.method,
        url: c.req.url,
        status: appError.statusCode,
        userId,
    };

    // Use simplified logging in development, full logging in production
    if (shouldUseDevFormatting()) {
        logDevError(appError, requestData);
    } else {
        appError.logError(requestData, {
            includeChain: true,
            includeStack: appError.statusCode >= 500,
        });
    }

    return c.json(appError.toResponse(), appError.statusCode);
};
