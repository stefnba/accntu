import { ContentfulStatusCode } from 'hono/utils/http-status';

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
 * Type for error entries with exact types - permits literal typing
 * while still enforcing the structure
 */
type ErrorEntryType<TCode extends string = string> = {
    /**
     * The code of the error
     */
    readonly code: TCode;

    /**
     * The description of the error
     */
    readonly description: string;

    /**
     * The status code of the error
     */
    readonly statusCode: ContentfulStatusCode;

    /**
     * Whether the error is expected
     */
    readonly isExpected: boolean;

    /**
     * The public code of the error. If not provided, this means the errors needs to be sanitized before being sent to the client.
     */
    readonly publicCode?: TPublicErrorCodes;

    /**
     * Default public-facing message to use when sanitizing the error. If not provided, the description will be used.
     * If provided, this means the error needs to be sanitized before being sent to the client.
     */
    readonly publicMessage?: string;
};

/**
 * Type for the registry that preserves literals and ensures the correct structure
 */
type ErrorRegistryStructure = {
    readonly [Category in string]: ReadonlyArray<ErrorEntryType<string>>;
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
 * Create the error registry with proper type validation
 * This approach validates the structure but preserves literal types
 */
export const ErrorRegistry = {
    WHAS: [
        createErrorEntry({
            code: 'WHAS',
            description: 'WHAS',
            statusCode: 401,
            isExpected: true,
        }),
    ],
    AUTH: [
        createErrorEntry({
            code: 'INVALID_TOKEN',
            description: 'The provided authentication token is invalid',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
        }),
        createErrorEntry({
            code: 'EXPIRED_TOKEN',
            description: 'The authentication token has expired',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.SESSION_EXPIRED',
        }),
        createErrorEntry({
            code: 'MISSING_TOKEN',
            description: 'No authentication token was provided',
            statusCode: 401,
            isExpected: true,
            publicCode: 'AUTH.UNAUTHORIZED',
        }),
    ],
    USER: [
        createErrorEntry({
            code: 'NOT_FOUND',
            description: 'The requested user was not found',
            statusCode: 404,
            isExpected: true,
            publicCode: 'RESOURCE.NOT_FOUND',
        }),
        createErrorEntry({
            code: 'ALREADY_EXISTS',
            description: 'A user with this identifier already exists',
            statusCode: 409,
            isExpected: true,
            publicCode: 'RESOURCE.ALREADY_EXISTS',
        }),
    ],
    DATA: [
        createErrorEntry({
            code: 'VALIDATION_ERROR',
            description: 'The provided data failed validation',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.INVALID_INPUT',
        }),
        createErrorEntry({
            code: 'MISSING_FIELD',
            description: 'A required field is missing from the request',
            statusCode: 400,
            isExpected: true,
            publicCode: 'VALIDATION.MISSING_FIELD',
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

export { PublicErrorCodesByCategory };
