/**
 * Type definitions for the error registry
 *
 * This file contains type definitions used by the error registry system
 * to define and work with standardized error codes and their properties.
 */

import {
    TErrorCodeCategory,
    TErrorShortCode,
    type TErrorFullCode,
} from '@/server/lib/error/registry';
import { TPublicErrorCode } from '@/server/lib/error/registry/public';
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
    T extends Record<string, readonly { code: unknown; message: string }[]>,
> = {
    [K in keyof T]: T[K] extends readonly (infer I)[]
        ? I extends { code: infer C; message: string }
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
export type TErrorEntryType<TCode extends string = string> = {
    /**
     * The unique identifier for this error within its category
     * This will be combined with the category to form the full error code (e.g., 'AUTH.INVALID_TOKEN')
     */
    readonly code: TCode;

    /**
     * A developer-friendly message of what the error means
     * This is primarily for internal use and debugging but can be shown to users in case no public message is available
     */
    readonly message: string;

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
    readonly isExpected?: boolean;

    /**
     * The public-facing error entry that can be returned to clients
     * Should be one of the predefined codes from PublicErrorCodesByCategory and a public message
     */
    readonly public?: TPublicErrorCode | { code: TPublicErrorCode; message?: string };

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
 * The public-facing error entry that can be returned to clients
 */
export type TPublicErrorEntry<T extends string = string> = {
    /**
     * The public error code that can be returned to clients
     */
    readonly code: T;

    /**
     * The public error message that can be returned to clients
     */
    readonly message: string;
};

/**
 * The return type for the getErrorDefinitionFromRegistry function
 * Includes all properties from ErrorEntryType plus derived properties
 */
export type TErrorDefinition<
    TFullCode extends TErrorFullCode = TErrorFullCode,
    TCode extends TErrorShortCode = TErrorShortCode,
    TCategory extends TErrorCodeCategory = TErrorCodeCategory,
> = Omit<TErrorEntryType, 'code'> & {
    /** The original error code from the entry (e.g., 'INVALID_TOKEN') */
    code: TCode;
    /** The full error code with category prefix (e.g., 'AUTH.INVALID_TOKEN') */
    fullCode: TFullCode;
    /** The category of the error code (e.g., 'AUTH') */
    category: TCategory;
    /** The public error entry that can be returned to clients */
    public: TPublicErrorEntry<TPublicErrorCode>;
    /** The details of the error */
    details?: Record<string, unknown>;
};

/**
 * Type helper to get only the short error codes (without the category prefix) for a specific category
 * @example
 * ```typescript
 * // Returns "UNAUTHORIZED" | "LOGIN_FAILED" | ... (without the "AUTH." prefix)
 * type AuthShortCodes = ErrorShortCodesByCategory<"AUTH">;
 * ```
 */
export type ErrorCodesByCategory<T extends TErrorCodeCategory> =
    Extract<TErrorFullCode, `${T}.${string}`> extends `${T}.${infer ShortCode}` ? ShortCode : never;
