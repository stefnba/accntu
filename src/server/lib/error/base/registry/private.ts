import { typedEntries } from '@/lib/utils';
import {
    FlattenedRegistryValue,
    InferErrorDefinitionFromKey,
    InferErrorKeys,
    TErrorRegistryObject,
} from '@/server/lib/error/base/registry/types';

/**
 * Type-safe error registry with caching
 *
 * Provides fast lookups for error definitions using dot-notation keys.
 * Lazily builds an internal cache on first access for optimal performance.
 *
 * @template R - The registry object type (inferred from constructor argument)
 *
 * @example
 * ```typescript
 * const registry = ErrorRegistry.fromObject({
 *   AUTH: {
 *     INVALID_TOKEN: { message: 'Invalid token', httpStatus: 401 }
 *   }
 * });
 *
 * const error = registry.get('AUTH.INVALID_TOKEN');
 * // { message: 'Invalid token', httpStatus: 401 }
 * ```
 */
export class ErrorRegistry<const R extends TErrorRegistryObject> {
    /**
     * The original nested registry object
     */
    readonly registry: R;

    /**
     * Internal cache for flattened error lookups (built lazily on first access)
     */
    private cache?: ReadonlyMap<InferErrorKeys<R>, FlattenedRegistryValue<R>>;

    /**
     * Creates a new ErrorRegistry instance
     *
     * @param obj - Nested registry object with categories and error codes
     */
    constructor(obj: R) {
        this.registry = obj;
    }

    /**
     * Build the internal flattened cache map
     *
     * Transforms nested registry structure into a flat Map with dot-notation keys
     * for O(1) lookups. Returns ReadonlyMap to prevent external mutations.
     *
     * @returns ReadonlyMap of error keys to definitions
     */
    private buildMap(): ReadonlyMap<InferErrorKeys<R>, FlattenedRegistryValue<R>> {
        type KeyType = InferErrorKeys<R>;
        type ValueType = FlattenedRegistryValue<R>;

        const map = new Map<KeyType, ValueType>();

        for (const [category, codes] of typedEntries(this.registry)) {
            for (const [code, def] of typedEntries(codes)) {
                const key = `${String(category)}.${String(code)}` as KeyType;
                map.set(key, def as ValueType);
            }
        }

        return map;
    }

    /**
     * Get error definition by key
     *
     * Retrieves the error definition for a given dot-notation key.
     * Builds cache on first call for subsequent fast lookups.
     *
     * @template K - The error key type (e.g., "AUTH.INVALID_TOKEN")
     * @param key - Dot-notation error key
     * @returns Error definition for the given key
     * @throws Error if key does not exist in registry
     *
     * @example
     * ```typescript
     * const def = registry.get('AUTH.INVALID_TOKEN');
     * // { message: 'Invalid token', httpStatus: 401 }
     * ```
     */
    get<K extends InferErrorKeys<R>>(key: K): InferErrorDefinitionFromKey<R, K> {
        this.cache ??= this.buildMap();
        const val = this.cache.get(key);

        if (val === undefined) {
            throw new Error(`Error key "${key}" not found`);
        }

        return val as InferErrorDefinitionFromKey<R, K>;
    }

    /**
     * Check if error key exists in registry
     *
     * @template K - The error key type (e.g., "AUTH.INVALID_TOKEN")
     * @param key - Dot-notation error key
     * @returns true if key exists, false otherwise
     *
     * @example
     * ```typescript
     * if (registry.has('AUTH.INVALID_TOKEN')) {
     *   // Key exists
     * }
     * ```
     */
    has<K extends InferErrorKeys<R>>(key: K): boolean {
        this.cache ??= this.buildMap();
        return this.cache.has(key);
    }

    /**
     * Create a new ErrorRegistry instance from a registry object
     *
     * Static factory method for creating registries with proper type inference.
     *
     * @template U - The registry object type (inferred)
     * @param obj - Nested registry object
     * @returns New ErrorRegistry instance
     *
     * @example
     * ```typescript
     * const registry = ErrorRegistry.fromObject({
     *   AUTH: { INVALID_TOKEN: { message: 'Invalid', httpStatus: 401 } }
     * });
     * ```
     */
    static fromObject<const U extends TErrorRegistryObject>(obj: U) {
        return new ErrorRegistry(obj);
    }
}
