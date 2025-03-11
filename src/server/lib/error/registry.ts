/**
 * Registry of public error codes that can be returned to clients
 */
const PublicErrorCodesByCategory = {
    AUTH: [
        'UNAUTHORIZED', // User doesn't have permission
        'LOGIN_FAILED', // Invalid credentials
        'SESSION_EXPIRED', // Session is no longer valid
        'VERIFICATION_FAILED', // OTP/email verification issues
        'ACCOUNT_LOCKED', // Account is locked for security reasons
    ],
    VALIDATION: [
        'INVALID_INPUT', // General invalid input
        'MISSING_FIELD', // Required field is missing
        'INVALID_FORMAT', // Input format is incorrect (email, phone, etc.)
        'DUPLICATE_ENTRY', // Trying to create something that already exists
    ],
    RESOURCE: [
        'NOT_FOUND', // Resource doesn't exist
        'ALREADY_EXISTS', // Resource already exists
        'ACCESS_DENIED', // User doesn't have access to this resource
        'CONFLICT', // Operation conflicts with current state
    ],
    OPERATION: [
        'CREATE_FAILED', // Failed to create resource
        'UPDATE_FAILED', // Failed to update resource
        'DELETE_FAILED', // Failed to delete resource
        'OPERATION_REJECTED', // Operation rejected by business rules
    ],
    RATE_LIMIT: [
        'TOO_MANY_REQUESTS', // Rate limit exceeded
        'TEMPORARY_BLOCK', // Temporarily blocked due to suspicious activity
    ],
    SERVER: [
        'INTERNAL_ERROR', // Unexpected server error
        'SERVICE_UNAVAILABLE', // Service is temporarily unavailable
        'MAINTENANCE', // System is under maintenance
    ],
} as const;

/**
 * Type for generating dot notation from an object with string array values
 */
export type DotNotationFromObjectType<T extends Record<string, readonly string[]>> = {
    [K in keyof T]: K extends string ? `${K}.${T[K][number]}` : never;
}[keyof T];

export type TPublicErrorCodes = DotNotationFromObjectType<typeof PublicErrorCodesByCategory>;
export type TPublicErrorCategories = keyof typeof PublicErrorCodesByCategory;

/**
 * Enhanced error entry type with all properties pre-defined
 *
 * @template TCode The specific string literal type for the error code
 */
type ErrorEntryType<TCode extends string = string> = {
    /**
     * The unique identifier for this error within its category
     * This will be combined with the category to form the full error code (e.g., 'AUTH.INVALID_TOKEN')
     */
    readonly code: TCode;

    /**
     * A developer-friendly description of what the error means
     * This is primarily for internal use and debugging
     */
    readonly description: string;

    /**
     * The HTTP status code that should be returned for this error
     * Common values: 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)
     */
    readonly statusCode: number;

    /**
     * Indicates whether this error is expected during normal operation
     * true = business logic error that can happen during normal operation (e.g., invalid input)
     * false = unexpected error that represents a bug or system failure
     */
    readonly isExpected: boolean;

    /**
     * The public-facing error code that can be returned to clients
     * Should be one of the predefined codes from PublicErrorCodesByCategory
     * If not provided, the error is considered not safe for public consumption
     */
    readonly publicCode?: TPublicErrorCodes;

    /**
     * A user-friendly error message that can be shown to end users
     * Should not contain sensitive information or technical details
     * If not provided, description will be used as fallback in getErrorDefinitionFromRegistry
     */
    readonly publicMessage?: string;

    /**
     * Indicates whether the client should retry the operation
     * true = temporary error that might succeed if retried
     * false/undefined = error that will not be resolved by retrying
     */
    readonly shouldRetry?: boolean;

    /**
     * The number of seconds to wait before retrying the operation
     * Only relevant if shouldRetry is true
     */
    readonly retryAfterSeconds?: number;
};

/**
 * Helper function that validates an error entry at compile time
 * but returns the exact same object to preserve literal types
 */
function createErrorEntry<TCode extends string>(
    entry: ErrorEntryType<TCode>
): ErrorEntryType<TCode> {
    return entry;
}

/**
 * Create the error registry with proper type validation and complete information
 */
export const ErrorRegistry = {
    // Authentication errors
    AUTH: [
        createErrorEntry({
            code: 'INVALID_TOKEN',
            description: 'The provided authentication token is invalid',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'You are not authorized to perform this action',
        }),
        createErrorEntry({
            code: 'EXPIRED_TOKEN',
            description: 'The authentication token has expired',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.SESSION_EXPIRED',
            publicMessage: 'Your session has expired, please sign in again',
        }),
        createErrorEntry({
            code: 'MISSING_TOKEN',
            description: 'No authentication token was provided',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Authentication required to access this resource',
        }),
        createErrorEntry({
            code: 'INVALID_CREDENTIALS',
            description: 'The provided login credentials are incorrect',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.LOGIN_FAILED',
            publicMessage: 'Invalid email or password',
        }),
        createErrorEntry({
            code: 'ACCOUNT_LOCKED',
            description: 'User account has been locked due to too many failed login attempts',
            statusCode: 403,
            isExpected: true,
            publicCode: 'AUTH.ACCOUNT_LOCKED',
            publicMessage:
                'Your account has been temporarily locked. Please try again later or reset your password',
        }),
        createErrorEntry({
            code: 'ACCOUNT_DISABLED',
            description: 'User account has been disabled by an administrator',
            statusCode: 403,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Your account has been disabled. Please contact support for assistance',
        }),
        createErrorEntry({
            code: 'EMAIL_NOT_VERIFIED',
            description: 'User email has not been verified',
            statusCode: 403,
            isExpected: true,
            publicCode: 'AUTH.VERIFICATION_FAILED',
            publicMessage: 'Please verify your email address before proceeding',
        }),
        createErrorEntry({
            code: 'INVALID_OTP',
            description: 'Invalid one-time password provided',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.VERIFICATION_FAILED',
            publicMessage: 'Invalid verification code. Please try again',
        }),
        createErrorEntry({
            code: 'OTP_EXPIRED',
            description: 'The one-time password has expired',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.VERIFICATION_FAILED',
            publicMessage: 'Verification code has expired. Please request a new one',
        }),
        // Adding missing auth errors from types.ts
        createErrorEntry({
            code: 'OTP_ALREADY_USED',
            description: 'The one-time password has already been used',
            statusCode: 400,
            isExpected: true,
            publicCode: 'AUTH.VERIFICATION_FAILED',
            publicMessage: 'This verification code has already been used. Please request a new one',
        }),
        createErrorEntry({
            code: 'OTP_NOT_FOUND',
            description: 'No one-time password found for this user/session',
            statusCode: 404,
            isExpected: true,
            publicCode: 'AUTH.VERIFICATION_FAILED',
            publicMessage: 'Verification code not found. Please request a new one',
        }),
        createErrorEntry({
            code: 'OTP_GENERATION_FAILED',
            description: 'Failed to generate a one-time password',
            statusCode: 500,
            isExpected: false,
            publicCode: 'SERVER.INTERNAL_ERROR',
            publicMessage:
                'We encountered an error while sending your verification code. Please try again',
        }),
        createErrorEntry({
            code: 'USER_NOT_FOUND',
            description: 'User not found during authentication',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'User account not found. Please check your credentials',
        }),
        createErrorEntry({
            code: 'USER_NOT_IN_CONTEXT',
            description: 'User information not found in request context',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Please sign in to continue',
        }),
        createErrorEntry({
            code: 'TOO_MANY_INVALID_REQUESTS',
            description: 'Too many invalid authentication attempts',
            statusCode: 429,
            isExpected: true,
            publicCode: 'RATE_LIMIT.TOO_MANY_REQUESTS',
            publicMessage: 'Too many failed attempts. Please try again later',
            shouldRetry: true,
            retryAfterSeconds: 300, // 5 minutes
        }),
    ],

    // User management errors
    USER: [
        createErrorEntry({
            code: 'NOT_FOUND',
            description: 'The requested user was not found',
            statusCode: 404,
            isExpected: true,
            publicCode: 'RESOURCE.NOT_FOUND',
            publicMessage: 'The user you are looking for does not exist',
        }),
        createErrorEntry({
            code: 'ALREADY_EXISTS',
            description: 'A user with this identifier already exists',
            statusCode: 409,
            isExpected: true,
            publicCode: 'RESOURCE.ALREADY_EXISTS',
            publicMessage: 'A user with this email already exists',
        }),
        createErrorEntry({
            code: 'WEAK_PASSWORD',
            description: 'The provided password does not meet security requirements',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_FORMAT',
            publicMessage:
                'Password must be at least 8 characters and include a mix of letters, numbers, and special characters',
        }),
        createErrorEntry({
            code: 'INVALID_EMAIL',
            description: 'The provided email address is invalid',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_FORMAT',
            publicMessage: 'Please enter a valid email address',
        }),
        createErrorEntry({
            code: 'PROFILE_INCOMPLETE',
            description: 'User profile is missing required information',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.MISSING_FIELD',
            publicMessage: 'Please complete your profile before continuing',
        }),
    ],

    // Data validation errors
    VALIDATION: [
        createErrorEntry({
            code: 'VALIDATION_ERROR',
            description: 'The provided data failed validation',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_INPUT',
            publicMessage: 'The data you provided is invalid',
        }),
        createErrorEntry({
            code: 'MISSING_FIELD',
            description: 'A required field is missing from the request',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.MISSING_FIELD',
            publicMessage: 'Please provide all required fields',
        }),
        createErrorEntry({
            code: 'INVALID_FORMAT',
            description: 'Data format is invalid for one or more fields',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_FORMAT',
            publicMessage: 'One or more fields have an invalid format',
        }),
        createErrorEntry({
            code: 'PARSE_ERROR',
            description: 'Failed to parse request data',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_INPUT',
            publicMessage: 'Invalid request format',
        }),
    ],

    // Resource errors
    RESOURCE: [
        createErrorEntry({
            code: 'NOT_FOUND',
            description: 'The requested resource was not found',
            statusCode: 404,
            isExpected: true,
            publicCode: 'RESOURCE.NOT_FOUND',
            publicMessage: 'The resource you requested could not be found',
        }),
        createErrorEntry({
            code: 'ALREADY_EXISTS',
            description: 'A resource with this identifier already exists',
            statusCode: 409,
            isExpected: true,
            publicCode: 'RESOURCE.ALREADY_EXISTS',
            publicMessage: 'This resource already exists',
        }),
        createErrorEntry({
            code: 'LOCKED',
            description: 'The resource is locked and cannot be modified',
            statusCode: 423, // Locked (WebDAV)
            isExpected: true,
            publicCode: 'RESOURCE.CONFLICT',
            publicMessage: 'This resource is currently locked. Please try again later',
        }),
        createErrorEntry({
            code: 'DEPENDENCY_ERROR',
            description: 'Cannot perform operation due to resource dependencies',
            statusCode: 409,
            isExpected: true,
            publicCode: 'RESOURCE.CONFLICT',
            publicMessage:
                'This operation cannot be completed because other resources depend on this item',
        }),
        createErrorEntry({
            code: 'VERSION_CONFLICT',
            description: 'Resource version conflict detected',
            statusCode: 409,
            isExpected: true,
            publicCode: 'RESOURCE.CONFLICT',
            publicMessage: 'This resource has been modified. Please refresh and try again',
        }),
    ],

    // Permission errors
    PERMISSION: [
        createErrorEntry({
            code: 'ACCESS_DENIED',
            description: 'User does not have permission to access this resource',
            statusCode: 403,
            isExpected: true,
            publicCode: 'RESOURCE.ACCESS_DENIED',
            publicMessage: 'You do not have permission to access this resource',
        }),
        createErrorEntry({
            code: 'INSUFFICIENT_ROLE',
            description: 'User does not have the required role for this operation',
            statusCode: 403,
            isExpected: true,
            publicCode: 'RESOURCE.ACCESS_DENIED',
            publicMessage: 'You do not have the required permissions to perform this action',
        }),
        createErrorEntry({
            code: 'OWNERSHIP_REQUIRED',
            description: 'This operation requires resource ownership',
            statusCode: 403,
            isExpected: true,
            publicCode: 'RESOURCE.ACCESS_DENIED',
            publicMessage: 'You can only perform this action on resources you own',
        }),
        createErrorEntry({
            code: 'READ_ONLY',
            description: 'This resource is read-only',
            statusCode: 403,
            isExpected: true,
            publicCode: 'RESOURCE.ACCESS_DENIED',
            publicMessage: 'This resource cannot be modified',
        }),
    ],

    // Operation errors
    OPERATION: [
        createErrorEntry({
            code: 'CREATE_FAILED',
            description: 'Failed to create the resource',
            statusCode: 500,
            isExpected: false,
            publicCode: 'OPERATION.CREATE_FAILED',
            publicMessage: 'Failed to create the resource. Please try again',
        }),
        createErrorEntry({
            code: 'UPDATE_FAILED',
            description: 'Failed to update the resource',
            statusCode: 500,
            isExpected: false,
            publicCode: 'OPERATION.UPDATE_FAILED',
            publicMessage: 'Failed to update the resource. Please try again',
        }),
        createErrorEntry({
            code: 'DELETE_FAILED',
            description: 'Failed to delete the resource',
            statusCode: 500,
            isExpected: false,
            publicCode: 'OPERATION.DELETE_FAILED',
            publicMessage: 'Failed to delete the resource. Please try again',
        }),
        createErrorEntry({
            code: 'OPERATION_TIMEOUT',
            description: 'The operation timed out',
            statusCode: 408,
            isExpected: true,
            publicCode: 'OPERATION.OPERATION_REJECTED',
            publicMessage: 'The operation took too long to complete. Please try again',
            shouldRetry: true,
        }),
        createErrorEntry({
            code: 'BULK_OPERATION_PARTIAL_FAILURE',
            description: 'Some items in the bulk operation failed',
            statusCode: 207, // Multi-Status
            isExpected: true,
            publicCode: 'OPERATION.OPERATION_REJECTED',
            publicMessage: 'Some items could not be processed. Please check the details',
        }),
        createErrorEntry({
            code: 'CONDITION_NOT_MET',
            description: 'Precondition for the operation was not met',
            statusCode: 412, // Precondition Failed
            isExpected: true,
            publicCode: 'OPERATION.OPERATION_REJECTED',
            publicMessage: 'The operation cannot be completed under the current conditions',
        }),
    ],

    // Rate limit errors
    RATE_LIMIT: [
        createErrorEntry({
            code: 'TOO_MANY_REQUESTS',
            description: 'Rate limit exceeded for this endpoint',
            statusCode: 429,
            isExpected: true,
            publicCode: 'RATE_LIMIT.TOO_MANY_REQUESTS',
            publicMessage: 'You have made too many requests. Please try again later',
            shouldRetry: true,
            retryAfterSeconds: 60,
        }),
        createErrorEntry({
            code: 'QUOTA_EXCEEDED',
            description: 'User has exceeded their quota for this resource',
            statusCode: 429,
            isExpected: true,
            publicCode: 'RATE_LIMIT.TOO_MANY_REQUESTS',
            publicMessage: 'You have reached your quota limit for this resource',
        }),
        createErrorEntry({
            code: 'CONCURRENT_REQUEST_LIMIT',
            description: 'Too many concurrent requests from this user',
            statusCode: 429,
            isExpected: true,
            publicCode: 'RATE_LIMIT.TOO_MANY_REQUESTS',
            publicMessage:
                'Too many concurrent operations. Please wait for your other requests to complete',
            shouldRetry: true,
            retryAfterSeconds: 5,
        }),
        createErrorEntry({
            code: 'TEMPORARY_BLOCK',
            description: 'User temporarily blocked due to suspicious activity',
            statusCode: 403,
            isExpected: true,
            publicCode: 'RATE_LIMIT.TEMPORARY_BLOCK',
            publicMessage:
                'Your account has been temporarily blocked due to suspicious activity. Please try again later',
            shouldRetry: true,
            retryAfterSeconds: 300,
        }),
    ],

    // Server errors
    SERVER: [
        createErrorEntry({
            code: 'INTERNAL_ERROR',
            description: 'An unexpected error occurred on the server',
            statusCode: 500,
            isExpected: false,
            publicCode: 'SERVER.INTERNAL_ERROR',
            publicMessage: 'An unexpected error occurred. Please try again later',
            shouldRetry: true,
        }),
        createErrorEntry({
            code: 'DATABASE_ERROR',
            description: 'Error occurred while interacting with the database',
            statusCode: 500,
            isExpected: false,
            // No publicCode or publicMessage - this is an internal error that shouldn't be exposed
        }),
        createErrorEntry({
            code: 'SERVICE_UNAVAILABLE',
            description: 'The service is temporarily unavailable',
            statusCode: 503,
            isExpected: true,
            publicCode: 'SERVER.SERVICE_UNAVAILABLE',
            publicMessage: 'The service is temporarily unavailable. Please try again later',
            shouldRetry: true,
            retryAfterSeconds: 60,
        }),
        createErrorEntry({
            code: 'MAINTENANCE_MODE',
            description: 'The system is currently in maintenance mode',
            statusCode: 503,
            isExpected: true,
            publicCode: 'SERVER.MAINTENANCE',
            publicMessage: 'The system is currently undergoing maintenance. Please try again later',
            shouldRetry: true,
            retryAfterSeconds: 1800, // 30 minutes
        }),
        createErrorEntry({
            code: 'CONFIGURATION_ERROR',
            description: 'System configuration error detected',
            statusCode: 500,
            isExpected: false,
            // No publicCode or publicMessage - this is an internal error that shouldn't be exposed
        }),
    ],

    // External service errors
    EXTERNAL: [
        createErrorEntry({
            code: 'SERVICE_ERROR',
            description: 'Error occurred in external service',
            statusCode: 502, // Bad Gateway
            isExpected: true,
            publicCode: 'SERVER.SERVICE_UNAVAILABLE',
            publicMessage:
                'We are experiencing issues with an external service. Please try again later',
            shouldRetry: true,
        }),
        createErrorEntry({
            code: 'TIMEOUT',
            description: 'Timeout occurred when calling external service',
            statusCode: 504, // Gateway Timeout
            isExpected: true,
            publicCode: 'SERVER.SERVICE_UNAVAILABLE',
            publicMessage: 'The request took too long to process. Please try again later',
            shouldRetry: true,
        }),
        createErrorEntry({
            code: 'INVALID_RESPONSE',
            description: 'Received invalid response from external service',
            statusCode: 502,
            isExpected: true,
            publicCode: 'SERVER.SERVICE_UNAVAILABLE',
            publicMessage:
                'We are experiencing issues with an external service. Please try again later',
        }),
        createErrorEntry({
            code: 'API_KEY_INVALID',
            description: 'API key for external service is invalid',
            statusCode: 500,
            isExpected: false,
            // No publicCode or publicMessage - this is an internal error that shouldn't be exposed
        }),
    ],

    // Database errors (previously missing)
    DB: [
        createErrorEntry({
            code: 'CONNECTION_ERROR',
            description: 'Failed to connect to the database',
            statusCode: 500,
            isExpected: false,
            // Internal error, not exposed to clients
        }),
        createErrorEntry({
            code: 'QUERY_FAILED',
            description: 'Database query failed to execute',
            statusCode: 500,
            isExpected: false,
            // Internal error, not exposed to clients
        }),
        createErrorEntry({
            code: 'UNIQUE_VIOLATION',
            description: 'Unique constraint violation in database operation',
            statusCode: 409, // Conflict
            isExpected: true,
            publicCode: 'RESOURCE.ALREADY_EXISTS',
            publicMessage: 'A record with this information already exists',
        }),
        createErrorEntry({
            code: 'FOREIGN_KEY_VIOLATION',
            description: 'Foreign key constraint violation in database operation',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_INPUT',
            publicMessage: 'The referenced resource does not exist or cannot be modified',
        }),
        createErrorEntry({
            code: 'TRANSACTION_FAILED',
            description: 'Database transaction failed to commit',
            statusCode: 500,
            isExpected: false,
            // Internal error, not exposed to clients
        }),
        createErrorEntry({
            code: 'INVALID_INPUT',
            description: 'Invalid input data for database operation',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_INPUT',
            publicMessage: 'The provided data is invalid',
        }),
        createErrorEntry({
            code: 'INVALID_OUTPUT',
            description: 'Database returned invalid or unexpected data format',
            statusCode: 500,
            isExpected: false,
            // Internal error, not exposed to clients
        }),
        createErrorEntry({
            code: 'QUERY_NULL_RETURNED',
            description: 'Database query returned null when a value was expected',
            statusCode: 404,
            isExpected: true,
            publicCode: 'RESOURCE.NOT_FOUND',
            publicMessage: 'The requested resource could not be found',
        }),
        createErrorEntry({
            code: 'OPERATION_FAILED',
            description: 'Database operation failed for an unknown reason',
            statusCode: 500,
            isExpected: false,
            // Internal error, not exposed to clients
        }),
    ],

    // Cookie errors (previously missing)
    COOKIE: [
        createErrorEntry({
            code: 'INVALID_VALUE',
            description: 'Cookie contains an invalid value',
            statusCode: 400,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Your session is invalid. Please sign in again',
        }),
        createErrorEntry({
            code: 'MISSING',
            description: 'Required cookie is missing',
            statusCode: 400,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Your session has expired or is missing. Please sign in again',
        }),
        createErrorEntry({
            code: 'EXPIRED',
            description: 'Cookie has expired',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.SESSION_EXPIRED',
            publicMessage: 'Your session has expired. Please sign in again',
        }),
        createErrorEntry({
            code: 'TAMPERED',
            description: 'Cookie appears to have been tampered with',
            statusCode: 400,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Your session is invalid. Please sign in again',
        }),
    ],

    // Adding missing auth errors from the original types
    SESSION: [
        createErrorEntry({
            code: 'NOT_FOUND',
            description: 'Session not found',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.SESSION_EXPIRED',
            publicMessage: 'Your session was not found. Please sign in again',
        }),
        createErrorEntry({
            code: 'EXPIRED',
            description: 'Session has expired',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.SESSION_EXPIRED',
            publicMessage: 'Your session has expired. Please sign in again',
        }),
        createErrorEntry({
            code: 'INVALID',
            description: 'Session is invalid',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Your session is invalid. Please sign in again',
        }),
    ],

    // File errors
    FILE: [
        createErrorEntry({
            code: 'UPLOAD_FAILED',
            description: 'File upload failed',
            statusCode: 500,
            isExpected: true,
            publicCode: 'OPERATION.CREATE_FAILED',
            publicMessage: 'Failed to upload file. Please try again',
            shouldRetry: true,
        }),
        createErrorEntry({
            code: 'FILE_TOO_LARGE',
            description: 'Uploaded file exceeds maximum size limit',
            statusCode: 413, // Payload Too Large
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_INPUT',
            publicMessage: 'The file is too large. Maximum file size is {maxSize}',
        }),
        createErrorEntry({
            code: 'INVALID_FILE_TYPE',
            description: 'File type is not supported',
            statusCode: 415, // Unsupported Media Type
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_FORMAT',
            publicMessage:
                'This file type is not supported. Please upload a file in one of these formats: {supportedFormats}',
        }),
        createErrorEntry({
            code: 'FILE_NOT_FOUND',
            description: 'The requested file was not found',
            statusCode: 404,
            isExpected: true,
            publicCode: 'RESOURCE.NOT_FOUND',
            publicMessage: 'The file you requested could not be found',
        }),
        createErrorEntry({
            code: 'STORAGE_QUOTA_EXCEEDED',
            description: 'User storage quota has been exceeded',
            statusCode: 403,
            isExpected: true,
            publicCode: 'RESOURCE.ACCESS_DENIED',
            publicMessage:
                'Your storage quota has been exceeded. Please remove some files or upgrade your plan',
        }),
    ],

    // Security errors
    SECURITY: [
        createErrorEntry({
            code: 'SUSPICIOUS_ACTIVITY',
            description: 'Suspicious activity detected on user account',
            statusCode: 403,
            isExpected: true,
            publicCode: 'AUTH.ACCOUNT_LOCKED',
            publicMessage:
                'We detected unusual activity on your account. For security reasons, please verify your identity',
        }),
        createErrorEntry({
            code: 'IP_BLOCKED',
            description: 'Request IP address is blocked',
            statusCode: 403,
            isExpected: true,
            publicCode: 'RATE_LIMIT.TEMPORARY_BLOCK',
            publicMessage:
                'Access from your current location has been blocked. If you believe this is an error, please contact support',
        }),
        createErrorEntry({
            code: 'CSRF_TOKEN_INVALID',
            description: 'CSRF token is missing or invalid',
            statusCode: 403,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Your session has expired. Please refresh the page and try again',
        }),
        createErrorEntry({
            code: 'REQUEST_SIGNATURE_INVALID',
            description: 'Request signature validation failed',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
            publicMessage: 'Request authentication failed',
        }),
    ],
} as const;

/**
 * Create the dot notation type with object extraction
 * Preserves literal types for nested object array elements
 */
export type DotNotationFromNestedObjectArray<
    T extends Record<string, readonly { code: unknown; description: string }[]>,
> = {
    [K in keyof T]: T[K] extends readonly (infer I)[]
        ? I extends { code: infer C; description: string }
            ? C extends string
                ? `${K & string}.${C}`
                : never
            : never
        : never;
}[keyof T];

/**
 * Define the error code type using the complex structure
 * These will be literal string types like 'AUTH.INVALID_TOKEN'
 */
export type TErrorCode = DotNotationFromNestedObjectArray<typeof ErrorRegistry>;
export type TErrorCodeCategory = TErrorCode extends `${infer Category}.${infer _}`
    ? Category
    : never;

/**
 * Utility type to get specific error info for a given error code
 */
export type ErrorEntryForCode<Code extends TErrorCode> =
    Code extends `${infer Category}.${infer CodeValue}`
        ? Extract<
              (typeof ErrorRegistry)[Category & keyof typeof ErrorRegistry][number],
              { code: CodeValue }
          >
        : never;

/**
 * The return type for the getErrorDefinitionFromRegistry function
 * Includes all properties from ErrorEntryType plus derived properties
 */
export type ErrorDefinition<TCode extends TErrorCode = TErrorCode> = Omit<
    ErrorEntryType,
    'code' | 'publicMessage'
> & {
    /** The original error code from the entry (e.g., 'INVALID_TOKEN') */
    code: string;
    /** The full error code with category prefix (e.g., 'AUTH.INVALID_TOKEN') */
    fullCode: TCode;
    /** The category of the error code (e.g., 'AUTH') */
    category: TErrorCodeCategory;
    /** Whether this error is safe to expose to public clients */
    isPublicSafe: boolean;
    /** The message that can be safely shown to users */
    publicMessage: string;
    /** The public code category that this maps to */
    publicCode?: TPublicErrorCodes;
};

/**
 * Get error definition directly from the registry with enhanced type safety
 *
 * This function looks up an error by its code and returns a complete error definition
 * with all properties from the registry plus derived fields like isPublicSafe.
 *
 * @template T The specific error code literal type
 * @param {T} code The error code to look up (e.g., 'AUTH.INVALID_TOKEN')
 * @returns {ErrorDefinition<T>} The complete error definition with derived properties
 * @throws {Error} If the error category or code is not found in the registry
 *
 * @example
 * // Get a specific error definition
 * const authError = getErrorDefinitionFromRegistry('AUTH.INVALID_TOKEN');
 * console.log(authError.statusCode); // 401
 * console.log(authError.isPublicSafe); // true
 */
export function getErrorDefinitionFromRegistry<T extends TErrorCode>(code: T): ErrorDefinition<T> {
    // Split the code into category and error code parts
    const [categoryStr, codeStr] = code.split('.') as [TErrorCodeCategory, string];

    // Find the error definition
    const categoryErrors = ErrorRegistry[categoryStr as keyof typeof ErrorRegistry];
    if (!categoryErrors) {
        throw new Error(`Error category not found: ${categoryStr}`);
    }

    const errorDef = categoryErrors.find((e) => e.code === codeStr);
    if (!errorDef) {
        throw new Error(`Error definition not found for code: ${code}`);
    }

    // Derive isPublicSafe based on presence of publicCode or publicMessage
    const isPublicSafe = !!(errorDef.publicCode || errorDef.publicMessage);

    // Use publicMessage if defined, otherwise default to description
    const publicMessage = errorDef.publicMessage || errorDef.description;

    // Return the error definition with derived properties
    return {
        ...errorDef,
        fullCode: code,
        category: categoryStr,
        isPublicSafe,
        publicMessage,
    };
}
