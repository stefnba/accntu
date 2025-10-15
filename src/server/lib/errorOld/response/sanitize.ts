import { TErrorFullCode } from '@/server/lib/errorOld/registry';
import { TErrorDefinition } from '@/server/lib/errorOld/registry/types';
import { TAPIErrorResponse } from '@/server/lib/errorOld/response/types';

/**
 * Configuration options for error sanitization
 */
export interface SanitizeErrorOptions {
    /**
     * Whether to include the request ID in the public response
     * @default true
     */
    includeRequestId?: boolean;

    /**
     * Environment name for conditional sanitization behavior
     * If 'development', more information is included in responses
     * @default process.env.NODE_ENV
     */
    environment?: 'development' | 'production' | 'test';
}

/**
 * Sanitizes an error response for public consumption
 *
 * This function transforms a detailed internal error response into a
 * sanitized public response that's safe to return to clients.
 *
 * @param error - The internal error response to sanitize
 * @param options - Options for customizing the sanitization
 * @param errorDefinition - Optional pre-fetched error definition to avoid lookup
 * @returns A sanitized public error response
 */
export function sanitizeErrorForPublic(
    errorDefinition: TErrorDefinition<TErrorFullCode>,
    requestId: string,
    details: Record<string, unknown>,
    options: SanitizeErrorOptions = {}
): TAPIErrorResponse {
    const { includeRequestId = true, environment = process.env.NODE_ENV } = options;

    // Get publicCode from error.error.code (which should be the internal code)
    const internalCode = errorDefinition.fullCode;
    const isDevelopment = environment === 'development';

    // Use the publicCode from errorDefinition, which already handles mapping
    // from internal codes to public codes
    const publicCode = errorDefinition.public.code;

    // Build the public response
    const publicResponse: TAPIErrorResponse = {
        success: false,
        error: {
            code: publicCode,
            message: errorDefinition.public.message,
        },
        request_id: includeRequestId ? requestId : '',
    };

    // In development, include the original error code for debugging
    if (isDevelopment) {
        publicResponse.error.details = {
            ...details,
            originalCode: internalCode,
            originalMessage: errorDefinition.message,
        };
    }

    return publicResponse;
}
