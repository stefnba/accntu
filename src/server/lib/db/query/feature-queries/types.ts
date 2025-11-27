/**
 * Standard function signature for all database query functions.
 * All query functions must be async and return a Promise.
 *
 * The bivariance hack keeps parameters assignable (needed when storing
 * heterogeneous query functions in a single record) without resorting to `any`.
 *
 * @template Input - The input parameter type
 * @template Output - The return type
 */
export type QueryFn<Input = unknown, Output = unknown> = {
    bivarianceHack(args: Input): Promise<Output>;
}['bivarianceHack'];

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
 * Infers the resource type returned by FeatureQueryBuilder queries after calling .build().
 *
 * @example
 *   type User = InferFeatureType<typeof userQueries>
 *   type UserFromMany = InferFeatureType<typeof userQueries, 'getMany'>
 */
export type InferFeatureType<
    Q extends Record<string, QueryFn>,
    TKey extends string = 'getById',
> = TKey extends keyof Q
    ? Q[TKey extends keyof Q ? TKey : never] extends (...args: never[]) => Promise<infer TReturn>
        ? TReturn extends (infer U)[]
            ? UnwrapNullable<U>
            : UnwrapNullable<TReturn>
        : never
    : never;
