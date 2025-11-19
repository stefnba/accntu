/**
 * Standard function signature for all database query functions.
 * All query functions must be async and return a Promise.
 *
 * @template Input - The input parameter type (defaults to any for flexibility)
 * @template Output - The return type (defaults to any for flexibility)
 */
export type QueryFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

/**
 * Empty object type used as the initial state in query builders.
 * Using `{}` (not `Record<string, never>`) is intentional because:
 * - `Record<string, never>` creates index signatures that make `keyof` resolve to `string`
 * - `{}` has no index signature, allowing TypeScript to infer actual property keys from intersections
 * - When intersected: `{} & { create: Fn } & { getById: Fn }` → `{ create: Fn, getById: Fn }`
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TEmptyQueries = {};

/**
 * Unwraps null/undefined from the top level of a type only, preserving nullable fields.
 * This is different from NonNullable which recursively removes null from nested properties.
 *
 * @template T - The type to unwrap
 * @example UnwrapNullable<User | null> // User (with nullable fields preserved)
 */
export type UnwrapNullable<T> = T extends null | undefined ? never : T;

/**
 * Universal type inference for feature entity types.
 * Works with both FeatureQueryBuilder instances and plain query function records.
 * Automatically handles array unwrapping and null unwrapping at the root level only.
 * Preserves nullable fields within the entity (e.g., optional/nullable columns).
 *
 * @template T - The FeatureQueryBuilder instance or query functions record
 * @template TKey - The query key to infer from (defaults to 'getById')
 * @example InferFeatureType<typeof userQueries> // User (with nullable fields preserved)
 * @example InferFeatureType<typeof userQueries, 'getMany'> // User from getMany query
 */
export type InferFeatureType<T, TKey extends string = 'getById'> = T extends {
    queries: infer Q;
}
    ? TKey extends keyof Q
        ? Q[TKey extends keyof Q ? TKey : never] extends (
              ...args: never[]
          ) => Promise<infer TReturn>
            ? TReturn extends (infer U)[]
                ? UnwrapNullable<U>
                : UnwrapNullable<TReturn>
            : never
        : never
    : never;
