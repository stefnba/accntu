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
    ],
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
    ],
    DATA: [
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
    ],
    RATE_LIMIT: [
        createErrorEntry({
            code: 'TOO_MANY_REQUESTS',
            description: 'Rate limit exceeded for this endpoint',
            statusCode: 429,
            isExpected: true,
            publicCode: 'RATE_LIMIT.TOO_MANY_REQUESTS',
            publicMessage: 'You have made too many requests. Please try again later.',
        }),
    ],
    SERVER: [
        createErrorEntry({
            code: 'INTERNAL_ERROR',
            description: 'An unexpected error occurred on the server',
            statusCode: 500,
            isExpected: false,
            // No publicCode or publicMessage means this is not public safe
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
