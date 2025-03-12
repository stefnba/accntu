/**
 * Utility functions for working with the error registry
 *
 * This file contains helper functions for interacting with the error registry
 * system, such as looking up error definitions and validating error entries.
 */

import { ErrorRegistry, TErrorCode, TErrorCodeCategory } from './index';
import { PublicErrorCodesByCategory, type TPublicErrorCodes } from './public';
import { ErrorDefinition, ErrorEntryType } from './types';

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
    entry: ErrorEntryType<TCode>
): ErrorEntryType<TCode> {
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
 * console.log(authError.isPublicSafe); // true
 * ```
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

    const publicCode = errorDef.publicCode || errorDef.code;

    // Return the error definition with derived properties
    return {
        ...errorDef,
        fullCode: code,
        category: categoryStr,
        isPublicSafe,
        publicMessage,
        publicCode,
    };
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
export function getAllErrorCodes(): TErrorCode[] {
    return Object.entries(ErrorRegistry).flatMap(([category, errors]) =>
        errors.map((error) => `${category}.${error.code}` as TErrorCode)
    );
}

/**
 * Generate a flat array of all public error codes in dot notation format
 *
 * @example
 * ```typescript
 * // ["AUTH.UNAUTHORIZED", "AUTH.LOGIN_FAILED", ...]
 * ```
 */
export const PublicErrorCodes = Object.entries(PublicErrorCodesByCategory).flatMap(
    ([category, codes]) => codes.map((code) => `${category}.${code}` as TPublicErrorCodes)
) as [TPublicErrorCodes, ...TPublicErrorCodes[]];

/**
 * Gets a list of all expected error codes in the registry
 * These are errors that can occur during normal operation
 *
 * @returns Array of expected error codes
 *
 * @example
 * ```typescript
 * const expectedErrorCodes = getExpectedErrorCodes();
 * // ['AUTH.INVALID_TOKEN', 'RESOURCE.NOT_FOUND', ...]
 * ```
 */
export function getExpectedErrorCodes(): TErrorCode[] {
    return getAllErrorCodes().filter((code) => {
        try {
            const def = getErrorDefinitionFromRegistry(code);
            return def.isExpected;
        } catch (e) {
            return false;
        }
    });
}

/**
 * Gets all public error codes defined in the registry
 *
 * @returns Array of unique public error codes
 *
 * @example
 * ```typescript
 * const publicCodes = getPublicErrorCodes();
 * // ['AUTH.UNAUTHORIZED', 'RESOURCE.NOT_FOUND', ...]
 * ```
 */
export function getPublicErrorCodes(): string[] {
    const publicCodes = new Set<string>();

    getAllErrorCodes().forEach((code) => {
        try {
            const def = getErrorDefinitionFromRegistry(code);
            if (def.publicCode) {
                publicCodes.add(def.publicCode);
            }
        } catch (e) {
            // Skip if error definition not found
        }
    });

    return Array.from(publicCodes);
}

/**
 * Singleton cache for error definitions to avoid repeated lookups
 */
export class ErrorDefinitionCache {
    private static instance: ErrorDefinitionCache;
    private cache = new Map<TErrorCode, ErrorDefinition<TErrorCode>>();

    private constructor() {}

    public static getInstance(): ErrorDefinitionCache {
        if (!ErrorDefinitionCache.instance) {
            ErrorDefinitionCache.instance = new ErrorDefinitionCache();
        }
        return ErrorDefinitionCache.instance;
    }

    public getDefinition<T extends TErrorCode>(code: T): ErrorDefinition<T> {
        if (!this.cache.has(code)) {
            this.cache.set(code, getErrorDefinitionFromRegistry(code));
        }
        return this.cache.get(code) as ErrorDefinition<T>;
    }

    public clearCache(): void {
        this.cache.clear();
    }
}

// For backwards compatibility, provide a function that uses the singleton
export function getCachedErrorDefinition<T extends TErrorCode>(code: T): ErrorDefinition<T> {
    return ErrorDefinitionCache.getInstance().getDefinition(code);
}
