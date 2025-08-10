import { TQueryKey, TQueryKeyString } from '@/lib/api/types';

export interface BuildQueryKeyParams<T = any> {
    defaultKey?: TQueryKeyString;
    params?: T;
    keyExtractor?: (params: T) => unknown[];
}

/**
 * Builds a query key from a default key and optional parameters.
 * Handles Hono's standardized param structure: { param: {...}, query: {...} }
 *
 * @param defaultKey - The default query key to use
 * @param params - The parameters to use
 * @param keyExtractor - A function to extract the key from the parameters
 */
export const buildQueryKey = ({
    defaultKey,
    params,
    keyExtractor,
}: BuildQueryKeyParams): TQueryKey => {
    const extractedParams = keyExtractor ? keyExtractor(params) : extractQueryKeyParams(params);

    if (!defaultKey) {
        return extractedParams;
    }

    const baseKey = Array.isArray(defaultKey) ? defaultKey : [defaultKey];

    // Only add extracted params if they contain meaningful data
    return extractedParams.length > 0 ? [...baseKey, ...extractedParams] : baseKey;
};

/**
 * Extracts meaningful values from Hono params for query key generation
 * Handles Hono's standardized param structure: { param: {...}, query: {...} }
 *
 * @param params - Hono request parameters
 * @returns Array of extracted parameter values for query keys
 */
export function extractQueryKeyParams(params: any): unknown[] {
    // Return empty array for null/undefined (no relevant params)
    if (!params || typeof params !== 'object') {
        return [];
    }

    const keyParts: unknown[] = [];

    // Extract Hono path parameters (param object)
    if (params.param && typeof params.param === 'object') {
        const paramKeys = Object.keys(params.param);

        // For single ID parameters, extract the ID value directly
        // Examples: { param: { id: 'bank123' } } → ['bank123']
        if (paramKeys.length === 1 && 'id' in params.param) {
            keyParts.push(params.param.id);
        } else if (paramKeys.length > 0) {
            // For multiple or non-ID parameters, include the whole param object
            // Examples: { param: { bankId: 'bank123', accountId: 'acc456' } } → [{ bankId: 'bank123', accountId: 'acc456' }]
            keyParts.push(params.param);
        }
    }

    // Extract Hono query parameters (only if they have meaningful values)
    if (params.query && typeof params.query === 'object') {
        const queryKeys = Object.keys(params.query);
        if (queryKeys.length > 0) {
            // Only include query params if they have meaningful values
            // Examples: { query: { search: 'chase', limit: 10 } } → [{ search: 'chase', limit: 10 }]
            keyParts.push(params.query);
        }
    }

    // Only include params object if it has meaningful content beyond empty Hono structure
    if (keyParts.length === 0 && Object.keys(params).length > 0) {
        // Check if it's just empty Hono structure like { param: {}, query: {} }
        const hasEmptyParam =
            params.param &&
            typeof params.param === 'object' &&
            Object.keys(params.param).length === 0;
        const hasEmptyQuery =
            params.query &&
            typeof params.query === 'object' &&
            Object.keys(params.query).length === 0;

        // If it's not just empty Hono structure, include it
        if (!(hasEmptyParam || hasEmptyQuery)) {
            keyParts.push(params);
        }
    }

    return keyParts;
}

/**
 * Utility function to preview what query key would be generated
 * Useful for debugging and understanding caching behavior
 */
export function previewQueryKey(
    defaultKey: string | readonly (string | undefined)[],
    params: any = null,
    keyExtractor?: (params: any) => unknown[]
): TQueryKey {
    return buildQueryKey({ defaultKey, params, keyExtractor });
}
