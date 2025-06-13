/**
 * Utility functions for working with the error registry
 *
 * This file contains helper functions for interacting with the error registry
 * system, such as looking up error definitions and validating error entries.
 */

import { typedEntries } from '@/lib/utils';

import {
    ERROR_REGISTRY,
    TErrorShortCode,
    type TErrorCodeCategory,
    type TErrorFullCode,
} from './index';
import {
    PUBLIC_ERROR_REGISTRY,
    TPublicErrorShortCode,
    type TPublicErrorCategory,
    type TPublicErrorCode,
} from './public';
import type {
    ErrorCodesByCategory,
    TErrorDefinition,
    TErrorEntryType,
    TPublicErrorEntry,
} from './types';

/**
 * Helper function that validates an error entry at compile time
 * but returns the exact same object to preserve literal types
 *
 * @param entry The error entry to validate
 * @returns The validated error entry (unchanged)
 *
 * @example
 * ```typescript
 * const entry = createErrorEntry({
 *   code: 'USER_NOT_FOUND',
 *   description: 'User not found in the database',
 *   statusCode: 404,
 *   isExpected: true,
 *   publicCode: 'RESOURCE.NOT_FOUND',
 *   publicMessage: 'The requested user could not be found'
 * });
 * ```
 */
export function createErrorEntry<TCode extends string>(
    entry: TErrorEntryType<TCode>
): TErrorEntryType<TCode> {
    return entry;
}

/**
 * Helper function that validates a public error entry at compile time
 * but returns the exact same object to preserve literal types
 *
 * @param entry The public error entry to validate
 * @returns The validated public error entry (unchanged)
 *
 * @example
 * ```typescript
 * const entry = createPublicErrorEntry({
 *   code: 'RESOURCE.NOT_FOUND',
 *   message: 'The requested user could not be found'
 * });
 * ```
 */
export function createPublicErrorEntry<TCode extends string>(
    entry: TPublicErrorEntry<TCode>
): TPublicErrorEntry<TCode> {
    return entry;
}

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
 * ```typescript
 * // Get a specific error definition
 * const authError = getErrorDefinitionFromRegistry('AUTH.INVALID_TOKEN');
 * console.log(authError.statusCode); // 401
 * ```
 */
export function getErrorDefinitionFromRegistry<T extends TErrorFullCode>(
    code: T
): TErrorDefinition<T> {
    // Split the code into category and error code parts
    const [categoryStr, codeStr] = code.split('.') as [TErrorCodeCategory, TErrorShortCode];

    // Find the error definition
    const categoryErrors = ERROR_REGISTRY[categoryStr];
    if (!categoryErrors) {
        throw new Error(`Error category not found: ${categoryStr}`);
    }

    const errorDef = categoryErrors.find((e) => e.code === codeStr);
    if (!errorDef) {
        throw new Error(`Error definition not found for code: ${code}`);
    }

    // Get the public error code and message
    if (!errorDef.public) {
        return {
            statusCode: errorDef.statusCode,
            message: errorDef.message,
            fullCode: code,
            category: categoryStr,
            code: errorDef.code,
            public: {
                code: 'SERVER.INTERNAL_ERROR',
                message: getPublicErrorDefinitionFromRegistry('SERVER.INTERNAL_ERROR').message,
            },
        };
    }

    const publicError =
        typeof errorDef.public === 'object'
            ? {
                  code: errorDef.public.code,
                  message:
                      errorDef.public.message ??
                      getPublicErrorDefinitionFromRegistry(errorDef.public.code).message,
              }
            : {
                  code: errorDef.public,
                  message: getPublicErrorDefinitionFromRegistry(errorDef.public).message,
              };

    return {
        statusCode: errorDef.statusCode,
        message: errorDef.message,
        fullCode: code,
        category: categoryStr,
        code: errorDef.code,
        public: publicError,
    };
}

/**
 * Get public error definition directly from the registry with enhanced type safety
 *
 * This function looks up a public error by its code and returns a complete public error definition
 * with all properties from the registry plus derived fields like isPublicSafe.
 *
 */
export function getPublicErrorDefinitionFromRegistry(code: TPublicErrorCode): TPublicErrorEntry {
    // Split the code into category and error code parts
    const [categoryStr, codeStr] = code.split('.') as [TPublicErrorCategory, TPublicErrorShortCode];

    const categoryErrors = PUBLIC_ERROR_REGISTRY[categoryStr];
    if (!categoryErrors) {
        throw new Error(`Public error category not found: ${categoryStr}`);
    }

    const errorDef = categoryErrors.find((e) => e.code === codeStr);
    if (!errorDef) {
        throw new Error(`Public error definition not found for code: ${code}`);
    }

    return errorDef;
}

/**
 * Gets a list of all error codes in the registry
 *
 * @returns Array of all error codes
 *
 * @example
 * ```typescript
 * const allErrorCodes = getAllErrorCodes();
 * // ['AUTH.INVALID_TOKEN', 'AUTH.EXPIRED_TOKEN', ...]
 * ```
 */
export const getAllErrorCodes = (): TErrorFullCode[] =>
    typedEntries(ERROR_REGISTRY).flatMap(([category, errors]) =>
        errors.map((error) => `${category}.${error.code}`)
    ) as TErrorFullCode[];

/**
 * Generate a flat array of all public error codes in dot notation format
 *
 * @returns Array of all public error codes
 *
 * @example
 * ```typescript
 * // ["AUTH.UNAUTHORIZED", "AUTH.LOGIN_FAILED", ...]
 * ```
 */
export const getAllPublicErrorCodes = (): TPublicErrorCode[] =>
    typedEntries(PUBLIC_ERROR_REGISTRY).flatMap(([category, codes]) =>
        codes.map((code) => `${category}.${code}`)
    ) as TPublicErrorCode[];

/**
 * Singleton cache for error definitions to avoid repeated lookups
 */
export class ErrorDefinitionCache {
    private static instance: ErrorDefinitionCache;
    private cache = new Map<TErrorFullCode, TErrorDefinition<TErrorFullCode>>();

    private constructor() {}

    public static getInstance(): ErrorDefinitionCache {
        if (!ErrorDefinitionCache.instance) {
            ErrorDefinitionCache.instance = new ErrorDefinitionCache();
        }
        return ErrorDefinitionCache.instance;
    }

    public getDefinition<T extends TErrorFullCode>(code: T): TErrorDefinition<T> {
        if (!this.cache.has(code)) {
            this.cache.set(code, getErrorDefinitionFromRegistry(code));
        }
        return this.cache.get(code) as TErrorDefinition<T>;
    }

    public clearCache(): void {
        this.cache.clear();
    }
}

// For backwards compatibility, provide a function that uses the singleton
export function getCachedErrorDefinition<T extends TErrorFullCode>(code: T): TErrorDefinition<T> {
    return ErrorDefinitionCache.getInstance().getDefinition(code);
}

/**
 * Creates an error code builder function for a specific category that only accepts
 * valid short codes for that category and returns fully qualified error codes
 *
 * @param category The error category
 * @returns A function that accepts only valid short codes for the category and returns fully qualified error codes
 *
 * @example
 * ```typescript
 * const authError = createErrorCodeBuilder('AUTH');
 *
 * // Returns "AUTH.INVALID_TOKEN"
 * const code = authError('INVALID_TOKEN');
 *
 * // TypeScript Error: Argument of type '"NOT_FOUND"' is not assignable to parameter of type '"BETTER_AUTH_ERROR" | "EMPTY_SESSION_TOKEN" | ...'
 * const invalidCode = authError('NOT_FOUND');
 * ```
 */
export function createErrorCodeBuilder<Cat extends TErrorCodeCategory>(
    category: Cat
): <Code extends ErrorCodesByCategory<Cat>>(shortCode: Code) => `${Cat}.${Code}` {
    return (shortCode) => `${category}.${shortCode}` as const;
}
