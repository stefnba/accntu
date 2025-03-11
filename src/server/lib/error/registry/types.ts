/**
 * Type definitions for the error registry
 *
 * This file contains type definitions used by the error registry system
 * to define and work with standardized error codes and their properties.
 */

import { TPublicErrorCodes } from '@/server/lib/error/registry/public';
import { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Type for generating dot notation from an object with string array values
 *
 * @template T Object with string array values
 * @returns Union type of dot-notation strings
 *
 * @example
 * ```typescript
 * const obj = { FOO: ['BAR', 'BAZ'], QUX: ['QUUX'] } as const;
 * type Result = DotNotationFromObjectType<typeof obj>;
 * // Result = 'FOO.BAR' | 'FOO.BAZ' | 'QUX.QUUX'
 * ```
 */
export type DotNotationFromObjectType<T extends Record<string, readonly string[]>> = {
    [K in keyof T]: K extends string ? `${K}.${T[K][number]}` : never;
}[keyof T];

/**
 * Type for generating dot notation from a nested object with code arrays
 * Preserves literal types for nested object array elements
 *
 * @template T Object with arrays of objects containing code properties
 * @returns Union type of dot-notation strings
 *
 * @example
 * ```typescript
 * const registry = {
 *   FOO: [{ code: 'BAR', description: '...' }, { code: 'BAZ', description: '...' }]
 * } as const;
 * type Result = DotNotationFromNestedObjectArray<typeof registry>;
 * // Result = 'FOO.BAR' | 'FOO.BAZ'
 * ```
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
 * Enhanced error entry type with all properties pre-defined
 *
 * @template TCode The specific string literal type for the error code
 */
export type ErrorEntryType<TCode extends string = string> = {
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
    readonly statusCode: ContentfulStatusCode;

    /**
     * Indicates whether this error is expected during normal operation
     * true = business logic error that can happen during normal operation (e.g., invalid input)
     * false = unexpected error that represents a bug or system failure
     */
    readonly isExpected: boolean;

    /**
     * The public-facing error code that can be returned to clients
     * Should be one of the predefined codes from PublicErrorCodesByCategory
     */
    readonly publicCode: TPublicErrorCodes;

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
 * The return type for the getErrorDefinitionFromRegistry function
 * Includes all properties from ErrorEntryType plus derived properties
 */
export type ErrorDefinition<TCode extends string = string> = Omit<
    ErrorEntryType,
    'code' | 'publicMessage'
> & {
    /** The original error code from the entry (e.g., 'INVALID_TOKEN') */
    code: string;
    /** The full error code with category prefix (e.g., 'AUTH.INVALID_TOKEN') */
    fullCode: TCode;
    /** The category of the error code (e.g., 'AUTH') */
    category: string;
    /** Whether this error is safe to expose to public clients */
    isPublicSafe: boolean;
    /** The message that can be safely shown to users */
    publicMessage: string;
    /** The public code category that this maps to */
    publicCode: TPublicErrorCodes;
};
