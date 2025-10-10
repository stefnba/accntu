import { ERROR_REGISTRY, TErrorKeys } from '@/server/lib/errorNew/registry';
import { InferErrorFromKey } from '@/server/lib/errorNew/registry/types';
import { nanoid } from 'nanoid';

/**
 * Utility function that gets the error definition from the registry by its key
 *
 * Uses Map for O(1) lookup performance.
 *
 * Note: Type assertion required due to TypeScript Map limitation.
 * Map.get() returns union of all error types, cannot narrow by key literal.
 * Runtime guard ensures error exists.
 *
 * @see https://github.com/microsoft/TypeScript/issues/13778
 *
 * @example
 * ```typescript
 * const error = getErrorFromRegistry('OPERATION.DELETE_FAILED');
 * // Result: { category: 'OPERATION', code: 'DELETE_FAILED', ... }
 * ```
 */
export function getErrorFromRegistry<K extends TErrorKeys>(
    key: K
): InferErrorFromKey<typeof ERROR_REGISTRY, K> {
    const error = ERROR_REGISTRY.get(key);

    if (!error) {
        throw new Error(`Error code ${key} not found in registry`);
    }

    return error as InferErrorFromKey<typeof ERROR_REGISTRY, K>;
}

/**
 * Generates a short, unique error ID for use in error tracing
 *
 * Uses a more concise format than the default nanoid
 *
 * @returns A unique error trace ID
 */
export function generateErrorId(): string {
    return nanoid(10);
}
