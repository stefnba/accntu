/**
 * Shared utilities for API query and mutation handling
 * Maintains DRY principles across query.ts and mutation.ts
 */

/**
 * Extracts meaningful values from Hono params for query key generation
 * Handles Hono's standardized param structure: { param: {...}, query: {...} }
 *
 * @param params - Hono request parameters
 * @returns Array of extracted parameter values for query keys
 */
export function extractQueryKeyParams(params: any): unknown[] {
    if (!params || typeof params !== 'object') {
        return [params];
    }

    const keyParts: unknown[] = [];

    // Extract Hono path parameters (param object)
    if (params.param && typeof params.param === 'object') {
        const paramKeys = Object.keys(params.param);

        // For single ID parameters, extract the ID value directly
        // Examples: { param: { id: 'bank123' } } → ['bank123']
        if (paramKeys.length === 1 && params.param.id) {
            keyParts.push(params.param.id);
        } else {
            // For multiple or non-ID parameters, include the whole param object
            // Examples: { param: { bankId: 'bank123', accountId: 'acc456' } } → [{ bankId: 'bank123', accountId: 'acc456' }]
            keyParts.push(params.param);
        }
    }

    // Extract Hono query parameters
    if (params.query && typeof params.query === 'object') {
        // Examples: { query: { search: 'chase', limit: 10 } } → [{ search: 'chase', limit: 10 }]
        keyParts.push(params.query);
    }

    // Fallback: if no Hono param/query structure found, include the whole params object
    if (keyParts.length === 0) {
        keyParts.push(params);
    }

    return keyParts;
}

/**
 * Utility function to preview what query key would be generated
 * Useful for debugging and understanding caching behavior
 */
export function previewQueryKey<T>(
    defaultKey: string | readonly (string | undefined)[],
    params: T,
    keyExtractor?: (params: T) => unknown[]
): unknown[] {
    const extractedParams = keyExtractor ? keyExtractor(params) : extractQueryKeyParams(params);

    return Array.isArray(defaultKey)
        ? [...defaultKey, ...extractedParams]
        : [defaultKey, ...extractedParams];
}
