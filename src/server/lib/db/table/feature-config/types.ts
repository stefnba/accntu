import { TZodShape } from '@/lib/schemas/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';
import z from 'zod';

/**
 * Infer the Zod schema shape for a Drizzle table operation.
 *
 * Extracts the appropriate schema (insert/select/update) from a table definition.
 */
export type InferTableSchema<
    TTable extends Table,
    TType extends 'insert' | 'select' | 'update' = 'insert',
> = BuildSchema<TType, TTable['_']['columns'], undefined, undefined>;

/**
 * Sentinel value representing an empty schema.
 *
 * Used instead of `undefined` to enable zero-assertion type safety.
 * `Record<never, never>` ensures `keyof EmptySchema` is `never`, which makes
 * the `IsEmptySchema` type helper work correctly.
 */
export type EmptySchema = Record<never, never>;

/**
 * Check if a Zod schema is empty (has no fields).
 *
 * Returns `true` if the schema has no properties, `false` otherwise.
 * Used internally to determine if optional schemas were configured.
 */
export type IsEmptySchema<T> =
    T extends z.ZodObject<infer S> ? (keyof S extends never ? true : false) : false;

/**
 * Infer schema value, returning `undefined` if schema is empty.
 *
 * Provides clean `undefined` semantics for empty schemas while maintaining
 * proper type inference for non-empty ones. This is the consumer-facing helper
 * type that makes working with optional schemas ergonomic.
 *
 * @example
 * ```ts
 * // With IDs configured:
 * type IdType = InferSchemaIfExists<typeof config.idSchema>;
 * // Result: { id: string }
 *
 * // Without IDs configured:
 * type NoIdType = InferSchemaIfExists<typeof emptyConfig.idSchema>;
 * // Result: undefined
 * ```
 */
export type InferOptionalSchema<T> = IsEmptySchema<T> extends true ? undefined : z.infer<T>;

/**
 * Helper type: Infer the input shape for create operations.
 *
 * Returns:
 * - `{ data: InsertData }` - Always includes data object with insert fields
 * - `& { userId: string }` - If config has userIdSchema set, adds userId field
 *
 * @example
 * ```ts
 * type Input = InferCreateInput<typeof config>;
 * // Result: { data: { name: string; description?: string; color?: string }; userId: string }
 *
 * const create = (input: Input) => { ... };
 * create({ data: { name: 'Tag 1' }, userId: 'user-123' });
 * ```
 */
export type InferCreateInput<
    TConfig extends FeatureTableConfig<
        Table,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape
    >,
> = { data: z.infer<TConfig['insertSchema']> } & (InferOptionalSchema<
    TConfig['userIdSchema']
> extends undefined
    ? object
    : z.infer<TConfig['userIdSchema']>);

/**
 * Helper type: Infer the input shape for update operations.
 *
 * Returns:
 * - `{ data: UpdateData }` - Always includes data object with partial update fields
 * - `& { ids: IdData }` - If config has idSchema set, adds ids object
 * - `& { userId: string }` - If config has userIdSchema set, adds userId field
 *
 * @example
 * ```ts
 * type Input = InferUpdateInput<typeof config>;
 * // Result: { data: { name?: string; ... }; ids: { id: string }; userId: string }
 *
 * const update = (input: Input) => { ... };
 * update({
 *   data: { name: 'New Name' },
 *   ids: { id: 'tag-123' },
 *   userId: 'user-123'
 * });
 * ```
 */
export type InferUpdateInput<
    TConfig extends FeatureTableConfig<
        Table,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape
    >,
> = {
    data: z.infer<TConfig['updateSchema']>;
} & (InferOptionalSchema<TConfig['idSchema']> extends undefined
    ? object
    : { ids: z.infer<TConfig['idSchema']> }) &
    (InferOptionalSchema<TConfig['userIdSchema']> extends undefined
        ? object
        : z.infer<TConfig['userIdSchema']>);

/**
 * Helper type: Extract the return column names from config.
 *
 * Returns a union of column names that were defined via .defineReturnColumns()
 *
 * @example
 * ```ts
 * type Columns = InferReturnColums<typeof config>;
 * // Result: "id" | "name" | "description" | "color" | "transactionCount"
 * ```
 */
export type InferReturnColums<
    TConfig extends FeatureTableConfig<
        Table,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape
    >,
> = keyof z.infer<TConfig['selectSchema']>;
