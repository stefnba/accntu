import {
    TErrorRegistryDefinition,
    TPublicErrorRegistryDefinition,
} from '@/server/lib/error/base/registry/types';
import { TErrorCategory, TErrorCodeByCategory } from '@/server/lib/error/registry';
import { TAppLayer } from '@/types/app';
import { ContentfulStatusCode } from 'hono/utils/http-status';

// ============================================
// LAYER & HTTP STATUS TYPES
// ============================================

/**
 * Application layers where errors can be thrown
 *
 * Maps to TAppLayer from global types for consistency across the application.
 * Used to track which layer of the architecture threw the error.
 */
export type TErrorLayer = TAppLayer;

/**
 * HTTP status code mapping type
 *
 * Maps error codes to HTTP status codes for API responses.
 */
export type THttpStatusCodeMapping = Record<string, ContentfulStatusCode>;

// ============================================
// ERROR CONSTRUCTOR PARAMETER TYPES
// ============================================

/**
 * Complete parameters required to construct an AppError
 *
 * This is the full parameter set that AppError constructor accepts.
 * Contains all error metadata including HTTP status, public error info,
 * and internal error details.
 *
 * @property code - Error code (e.g., 'INVALID_INPUT', 'NOT_FOUND')
 * @property category - Error category (e.g., 'VALIDATION', 'RESOURCE')
 * @property httpStatus - HTTP status code for API responses
 * @property isExpected - Whether this error is expected during normal operation
 * @property message - Internal error message (not shown to users)
 * @property public - Public error information safe to expose to clients
 * @property cause - Optional underlying error that caused this error
 * @property layer - Optional application layer where error was thrown
 * @property details - Optional additional error details for debugging
 */
export type TAppErrorParams = Required<Omit<TErrorRegistryDefinition, 'layers'>> & {
    code: string;
    category: string;
    cause?: Error;
    layer?: TErrorLayer;
    details?: Record<string, unknown>;
    public?: TPublicErrorRegistryDefinition & { details?: Record<string, unknown>; code: string };
};

/**
 * Domain-specific error parameters
 *
 * Type helper for creating domain error classes (ValidationError, AuthError, etc.)
 * that automatically set the category and constrain code to that category's valid codes.
 *
 * @template C - Error category type (e.g., 'VALIDATION', 'AUTH')
 *
 * @example
 * ```typescript
 * // ValidationError only accepts VALIDATION codes
 * class ValidationError extends AppError {
 *   constructor(params: TDomainErrorParams<'VALIDATION'>) {
 *     super({ ...params, category: 'VALIDATION' });
 *   }
 * }
 *
 * // TypeScript will only allow: 'INVALID_INPUT' | 'MISSING_FIELD' | 'INVALID_FORMAT'
 * new ValidationError({ code: 'INVALID_INPUT', ... });
 * ```
 */
export type TDomainErrorParams<C extends TErrorCategory> = Omit<
    TAppErrorParams,
    'category' | 'code'
> & {
    code: TErrorCodeByCategory<C>;
};

// ============================================
// ERROR LOGGING & REQUEST TYPES
// ============================================

/**
 * HTTP request data for error logging
 *
 * Contains request context that should be logged with errors
 * for debugging and monitoring purposes.
 *
 * @property method - HTTP method (GET, POST, etc.)
 * @property url - Request URL path
 * @property userId - ID of authenticated user (if any)
 * @property status - HTTP status code of response
 */
export type TErrorRequestData = {
    method: string;
    url: string;
    userId: string | undefined | null;
    status: number;
};

// ============================================
// ERROR CHAIN TYPES
// ============================================

/**
 * Single error in an error chain
 *
 * Represents one error in a chain of errors (error → cause → cause → ...)
 * Contains both standard Error fields and AppError-specific metadata.
 *
 * @property depth - Position in chain (0 = latest error, higher = deeper in chain)
 * @property name - Error name/class (e.g., 'ValidationError', 'TypeError')
 * @property message - Error message
 * @property id - Unique error instance ID (only for AppError)
 * @property key - Full error key like 'VALIDATION.INVALID_INPUT' (only for AppError)
 * @property code - Error code like 'INVALID_INPUT' (only for AppError)
 * @property category - Error category like 'VALIDATION' (only for AppError)
 * @property layer - Application layer where error was thrown (only for AppError)
 */
export type TErrorChainItem = {
    depth: number;
    name: string;
    message: string;
    id?: string;
    key?: string;
    code?: string;
    category?: string;
    layer?: TErrorLayer;
};

/**
 * Complete error chain context for logging/monitoring
 *
 * Provides a structured view of the entire error chain from the latest error
 * down to the root cause. Useful for debugging and understanding error propagation.
 *
 * @property depth - Total number of errors in the chain
 * @property rootCause - The deepest error in the chain (original error)
 * @property chain - Array of all errors from latest to root cause
 *
 * @example
 * ```typescript
 * const context = error.getChain();
 * // {
 * //   depth: 3,
 * //   rootCause: { name: 'PrismaError', message: 'Unique constraint failed', ... },
 * //   chain: [
 * //     { depth: 0, name: 'ServerError', key: 'SERVER.INTERNAL_ERROR', ... },
 * //     { depth: 1, name: 'OperationError', key: 'OPERATION.CREATE_FAILED', ... },
 * //     { depth: 2, name: 'PrismaError', message: 'Unique constraint failed' }
 * //   ]
 * // }
 * ```
 */
export interface ErrorChainContext {
    depth: number;
    rootCause: Omit<TErrorChainItem, 'depth'>;
    chain: Array<TErrorChainItem>;
}

// ============================================
// SERIALIZATION TYPES
// ============================================

/**
 * Serialized AppError for JSON responses and logging
 *
 * Plain object representation of an AppError that can be safely
 * serialized to JSON for API responses or log storage.
 *
 * @property name - Error name (e.g., 'ValidationError')
 * @property message - Error message
 * @property code - Error code (e.g., 'INVALID_INPUT')
 * @property httpStatus - HTTP status code
 * @property isExpected - Whether error is expected
 * @property public - Public error info safe for clients
 * @property details - Internal error details for debugging
 * @property timestamp - ISO timestamp when error occurred
 * @property id - Unique error instance ID
 * @property cause - Serialized cause error (if any)
 * @property stack - Stack trace (omitted for expected errors)
 */
export interface SerializedAppError {
    name: string;
    message: string;
    code: string;
    httpStatus: number;
    details?: Record<string, unknown>;
    timestamp: string;
    id: string;
    cause?: SerializedAppError | { message: string; stack?: string };
    stack?: string;
    isExpected: boolean;
    public?: TPublicErrorRegistryDefinition & { details?: Record<string, unknown> };
}
