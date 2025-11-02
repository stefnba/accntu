import { TZodShape } from '@/lib/schemas/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';
import z from 'zod';

// ========================================
// Types
// ========================================

/**
 * Sentinel value representing an empty schema.
 *
 * Used instead of `undefined` to enable zero-assertion type safety.
 * `Record<never, never>` ensures `keyof EmptySchema` is `never`, which makes
 * the `IsEmptySchema` type helper work correctly.
 */
export type EmptySchema = Record<never, never>;

/**
 * Type alias for FeatureTableConfig with any generics.
 *
 * Primarily kept for backward compatibility and special cases where you need
 * to constrain to the full FeatureTableConfig class rather than using structural typing.
 * Most type helpers use structural constraints instead (e.g., `{ idSchema: z.ZodObject<...> }`)
 * for better type flexibility and precision.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFeatureTableConfig = FeatureTableConfig<any, any, any, any, any, any, any>;

// ========================================
// Infer utils
// ========================================

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
 * Uses structural typing to only require the schemas actually needed.
 * Separates the data object from userId when userIdSchema is configured.
 *
 * Returns:
 * - `{ data: InsertData }` - Always includes data object with insert fields
 * - `& { userId: string }` - Added only if config has userIdSchema set
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
    TConfig extends {
        insertDataSchema: z.ZodObject<TZodShape>;
        userIdSchema: z.ZodObject<TZodShape>;
    },
    TData = z.infer<TConfig['insertDataSchema']>,
    TUserIdSchema = z.infer<TConfig['userIdSchema']>,
> = Prettify<
    {
        data: InferOptionalSchema<TConfig['userIdSchema']> extends undefined
            ? TData
            : // omit userId field if userIdSchema is configured
              Prettify<Omit<TData, keyof TUserIdSchema>>;
    } & (InferOptionalSchema<TConfig['userIdSchema']> extends undefined ? object : TUserIdSchema)
>;

/**
 * Helper type: Infer the input shape for update operations.
 *
 * Uses structural typing to only require the schemas actually needed.
 * Combines data, ids, and userId based on what's configured.
 *
 * Returns:
 * - `{ data: UpdateData }` - Always includes data object with partial update fields
 * - `& { ids: IdData }` - Added only if config has idSchema set
 * - `& { userId: string }` - Added only if config has userIdSchema set
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
    TConfig extends {
        updateDataSchema: z.ZodObject<TZodShape>;
        idSchema: z.ZodObject<TZodShape>;
        userIdSchema: z.ZodObject<TZodShape>;
    },
> = Prettify<
    {
        data: z.infer<TConfig['updateDataSchema']>;
    } & (InferOptionalSchema<TConfig['idSchema']> extends undefined
        ? object
        : { ids: z.infer<TConfig['idSchema']> }) &
        (InferOptionalSchema<TConfig['userIdSchema']> extends undefined
            ? object
            : z.infer<TConfig['userIdSchema']>)
>;

/**
 * Helper type: Infer the IDs input shape from config.
 *
 * Uses structural typing to only require the idSchema property.
 * Returns an object with an `ids` property if the config has IDs configured,
 * or an empty object if no IDs are configured.
 *
 * @example
 * ```ts
 * type IdsInput = InferIdsInput<typeof config>;
 * // With IDs: { ids: { id: string } }
 * // Without IDs: {}
 * ```
 */
export type InferIdsInput<
    TConfig extends {
        idSchema: z.ZodObject<TZodShape>;
    },
> =
    Prettify<InferOptionalSchema<TConfig['idSchema']>> extends undefined
        ? object
        : { ids: Prettify<z.infer<TConfig['idSchema']>> };

/**
 * Helper type: Infer the userId input shape from config.
 *
 * Uses structural typing to only require the userIdSchema property.
 * Returns the userId object if configured (e.g., `{ userId: string }`),
 * or an empty object if no userId is configured.
 *
 * @example
 * ```ts
 * type UserIdInput = InferUserIdInput<typeof config>;
 * // With userId: { userId: string }
 * // Without userId: {}
 * ```
 */
export type InferUserIdInput<
    TConfig extends {
        userIdSchema: z.ZodObject<TZodShape>;
    },
> =
    Prettify<InferOptionalSchema<TConfig['userIdSchema']>> extends undefined
        ? object
        : Prettify<z.infer<TConfig['userIdSchema']>>;

/**
 * Helper type: Extract the return column names from config.
 *
 * Uses structural typing to only require the selectReturnSchema property.
 * Returns a union of column names that were defined via .defineReturnColumns()
 *
 * @example
 * ```ts
 * type Columns = InferReturnColums<typeof config>;
 * // Result: "id" | "name" | "description" | "color" | "transactionCount"
 * ```
 */
export type InferReturnColums<
    TConfig extends {
        selectReturnSchema: z.ZodObject<TZodShape>;
    },
> = keyof z.infer<TConfig['selectReturnSchema']>;

/**
 * Helper type: Infer the table type from a feature table config.
 *
 * Uses structural typing to only require the table property.
 * Returns the underlying Drizzle table type.
 *
 * @example
 * ```ts
 * type TagTable = InferTableFromConfig<typeof config>;
 * // Result: PgTableWithColumns<{ ... }>
 * ```
 */
export type InferTableFromConfig<
    TConfig extends {
        table: Table;
    },
> = TConfig['table'];
