import { TZodShape } from '@/lib/schemas/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { Prettify } from '@/types/utils';
import { EmptySchema, TZodArray } from '@/types/zod';
import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';
import z, { ZodNever } from 'zod';

// ========================================
// Core Types
// ========================================

export type TFeatureTableConfig<T extends Table> = {
    table: T;
    filters: TZodShape;
    pagination: TZodShape;
    ordering: TZodArray;
    updateData: TZodShape;
    createData: TZodShape;
    returnCols: TZodShape;
    id: TZodShape;
    userId: TZodShape;
    base: TZodShape;
};

// Utility to check if T is a union
type IsStringUnion<T, U = T> = T extends string ? ([U] extends [T] ? false : true) : never;

export type ConditionalTest<S extends TZodShape, R extends TZodShape> = keyof S extends never
    ? Pick<TZodShape, never>
    : R;

export type ConditionalTestArray<
    S extends TZodArray,
    R extends TZodShape,
> = S['element'] extends ZodNever ? Pick<TZodShape, never> : R;

export type ConditionalSchema<S extends TZodShape, K extends string> = Prettify<
    keyof S extends never
        ? Pick<TZodShape, never>
        : IsStringUnion<K> extends true
          ? {
                [k in K]: 'ERROR: Union keys are not allowed in ConditionalSchema. Use a single string literal.';
            }
          : { [k in K]: z.ZodObject<S> }
>;

export type ConditionalArraySchema<S extends TZodArray, K extends string> = Prettify<
    S['element'] extends ZodNever
        ? Pick<TZodShape, never>
        : IsStringUnion<K> extends true
          ? {
                [k in K]: 'ERROR: Union keys are not allowed in ConditionalSchemaArray. Use a single string literal.';
            }
          : { [k in K]: S }
>;

/**
 * Type alias for FeatureTableConfig with any generics.
 *
 * **Use Cases:**
 * - Backward compatibility with older code
 * - Generic function parameters that accept any table config
 * - Type constraints in complex generic scenarios
 *
 * **Recommendation:**
 * Prefer structural typing (e.g., `{ idSchema: z.ZodObject<...> }`) over this
 * for better type flexibility and precision in most cases.
 *
 * @example
 * ```ts
 * function processConfig(config: AnyFeatureTableConfig) {
 *   // Works with any table config
 * }
 * ```
 */
export type AnyFeatureTableConfig = FeatureTableConfig<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
>;

// ========================================
// Schema Inference Utilities
// ========================================

/**
 * Infer the Zod schema shape for a Drizzle table operation.
 *
 * Extracts the appropriate schema type (insert/select/update) from a Drizzle table
 * definition. Uses Drizzle's BuildSchema utility to generate the correct Zod shape.
 *
 * **Operation Types:**
 * - `insert`: Schema for creating new records (required fields, no defaults)
 * - `select`: Schema for reading records (all fields, as stored in DB)
 * - `update`: Schema for updating records (all fields partial/optional)
 *
 * @template TTable - Drizzle table type
 * @template TType - Operation type (insert/select/update)
 *
 * @example
 * ```ts
 * type InsertSchema = InferTableSchema<typeof userTable, 'insert'>;
 * // Result: { name: z.ZodString, email: z.ZodString, ... }
 *
 * type SelectSchema = InferTableSchema<typeof userTable, 'select'>;
 * // Result: { id: z.ZodString, name: z.ZodString, createdAt: z.ZodDate, ... }
 * ```
 */
export type InferTableSchema<
    TTable extends Table,
    TType extends 'insert' | 'select' | 'update' = 'insert',
> = Prettify<BuildSchema<TType, TTable['_']['columns'], undefined, undefined>>;

/**
 * Infers the raw TypeScript shape for a Drizzle table operation (insert, select, or update).
 *
 * Given a Drizzle table type, extracts the plain TypeScript object type (not a Zod schema)
 * for a specific operation type. This enables strongly typed values for database
 * create, update, and select operations, directly linked to table schema definitions.
 *
 * @typeParam TTable - A Drizzle Table type (e.g., typeof userTable)
 * @typeParam TOperation - The kind of DB operation: 'insert', 'select', or 'update'
 *
 * @example
 * type InsertType = InferTableTypes<typeof userTable, 'insert'>;
 * //    ^? { name: string; email: string; ... }
 *
 * type UpdateType = InferTableTypes<typeof userTable, 'update'>;
 * //    ^? { name?: string; email?: string; ... }
 *
 * // For quick access to default 'insert' type:
 * type InsertTypeDefault = InferTableTypes<typeof userTable>;
 */
export type InferTableTypes<
    TTable extends Table,
    TOperation extends 'insert' | 'select' | 'update' = 'insert',
> = z.infer<InferTableSchema<TTable, TOperation>>;

/**
 * Type guard to check if a Zod schema is empty (has no fields).
 *
 * Returns `true` if the schema shape has no properties (EmptySchema),
 * `false` if it contains any fields.
 *
 * **Use Cases:**
 * - Runtime checks for optional configuration (IDs, userId)
 * - Conditional type logic for input/output types
 * - Type narrowing in generic functions
 *
 * @template T - Zod object schema to check
 *
 * @example
 * ```ts
 * type HasIds = IsEmptySchema<typeof config.idSchema>;
 * // Result: true if no IDs configured, false if IDs exist
 *
 * // Used in conditional types:
 * type Result = IsEmptySchema<TIdSchema> extends true
 *   ? 'No IDs'
 *   : 'Has IDs';
 * ```
 */
export type IsEmptySchema<T> =
    T extends z.ZodObject<infer S> ? (keyof S extends never ? true : false) : false;

/**
 * Infer schema value, returning `undefined` if schema is empty.
 *
 * Provides clean `undefined` semantics for optional schemas (like IDs, userId)
 * while maintaining proper type inference for configured schemas.
 *
 * **How it works:**
 * 1. Checks if schema is empty using `IsEmptySchema`
 * 2. If empty → returns `undefined`
 * 3. If not empty → returns inferred Zod type via `z.infer<T>`
 *
 * **Use Cases:**
 * - Optional ID schema (when `.setIds()` not called)
 * - Optional userId schema (when `.setUserId()` not called)
 * - Conditional input types that change based on configuration
 *
 * @template T - Zod object schema to infer from
 *
 * @example
 * ```ts
 * // Config WITH IDs:
 * type IdType = InferOptionalSchema<typeof config.idSchema>;
 * // Result: { id: string }
 *
 * // Config WITHOUT IDs:
 * type NoIdType = InferOptionalSchema<typeof emptyConfig.idSchema>;
 * // Result: undefined
 *
 * // Used in function parameters:
 * function getById(ids: InferOptionalSchema<typeof config.idSchema>) {
 *   // ids is { id: string } | undefined depending on config
 * }
 * ```
 */
export type InferOptionalSchema<T> = IsEmptySchema<T> extends true ? undefined : z.infer<T>;

// ========================================
// Operation Input Type Helpers
// ========================================

/**
 * Infer the input shape for create/insert operations.
 *
 * Constructs the input type for creating new records based on the table config.
 * Uses structural typing to only include schemas that are actually configured.
 *
 * **Structure:**
 * - `{ data: InsertData }` - Always present, contains fields from insertDataSchema
 * - `& { userId: string }` - Conditionally added if userIdSchema is configured
 *
 * **Field Exclusion:**
 * If userId is configured, it's automatically excluded from the data object
 * to prevent duplication (userId goes at top level, not in data).
 *
 * @template TConfig - Table config with insertDataSchema and userIdSchema
 *
 * @example
 * ```ts
 * // Config WITH userId:
 * type Input = InferCreateInput<typeof tagConfig>;
 * // Result: { data: { name: string; color?: string }; userId: string }
 *
 * // Config WITHOUT userId:
 * type Input = InferCreateInput<typeof publicConfig>;
 * // Result: { data: { name: string; color?: string } }
 *
 * // Usage in functions:
 * const create = (input: InferCreateInput<typeof config>) => {
 *   return db.insert(table).values({ ...input.data, userId: input.userId });
 * };
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
 * Infer the input shape for update operations.
 *
 * Constructs the input type for updating existing records based on the table config.
 * Uses structural typing to dynamically include only configured schemas.
 *
 * **Structure:**
 * - `{ data: UpdateData }` - Always present, contains partial fields from updateDataSchema
 * - `& { ids: IdData }` - Conditionally added if idSchema is configured
 * - `& { userId: string }` - Conditionally added if userIdSchema is configured
 *
 * **Field Optionality:**
 * The data object is always partial (all fields optional) since updates typically
 * modify only specific fields, not the entire record.
 *
 * @template TConfig - Table config with updateDataSchema, idSchema, and userIdSchema
 *
 * @example
 * ```ts
 * // Config WITH IDs and userId:
 * type Input = InferUpdateInput<typeof tagConfig>;
 * // Result: {
 * //   data: { name?: string; color?: string };
 * //   ids: { id: string };
 * //   userId: string;
 * // }
 *
 * // Config WITHOUT IDs:
 * type Input = InferUpdateInput<typeof noIdConfig>;
 * // Result: { data: { name?: string; color?: string }; userId: string }
 *
 * // Usage in functions:
 * const update = (input: InferUpdateInput<typeof config>) => {
 *   return db.update(table)
 *     .set(input.data)
 *     .where(and(eq(table.id, input.ids.id), eq(table.userId, input.userId)));
 * };
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
 * Infer the IDs input shape from table config.
 *
 * Extracts just the ID fields portion for operations that need to identify
 * specific records (get by ID, delete by ID, etc.).
 *
 * **Returns:**
 * - `{ ids: { id: string, ... } }` - If IDs are configured via `.setIds()`
 * - `{}` (empty object) - If no IDs configured
 *
 * **Composite Keys:**
 * Supports multi-field primary keys automatically.
 *
 * @template TConfig - Table config with idSchema
 *
 * @example
 * ```ts
 * // Single ID:
 * type IdsInput = InferIdsInput<typeof tagConfig>;
 * // Result: { ids: { id: string } }
 *
 * // Composite key:
 * type IdsInput = InferIdsInput<typeof junctionConfig>;
 * // Result: { ids: { tagId: string; transactionId: string } }
 *
 * // No IDs:
 * type IdsInput = InferIdsInput<typeof noIdConfig>;
 * // Result: {}
 *
 * // Usage in functions:
 * const getById = (input: InferIdsInput<typeof config>) => {
 *   if ('ids' in input) {
 *     return db.query.table.findFirst({ where: eq(table.id, input.ids.id) });
 *   }
 * };
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
 * Infer the userId input shape from table config.
 *
 * Extracts just the user ID field for operations that need user context
 * for row-level security (RLS) filtering.
 *
 * **Returns:**
 * - `{ userId: string }` - If userId is configured via `.setUserId()`
 * - `{}` (empty object) - If no userId configured
 *
 * @template TConfig - Table config with userIdSchema
 *
 * @example
 * ```ts
 * // With userId:
 * type UserIdInput = InferUserIdInput<typeof tagConfig>;
 * // Result: { userId: string }
 *
 * // Without userId (public table):
 * type UserIdInput = InferUserIdInput<typeof publicConfig>;
 * // Result: {}
 *
 * // Usage in functions:
 * const listAll = (input: InferUserIdInput<typeof config>) => {
 *   const where = 'userId' in input
 *     ? eq(table.userId, input.userId)
 *     : undefined;
 *   return db.query.table.findMany({ where });
 * };
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
 * Extract the return column names from table config.
 *
 * Returns a union type of all column names that will be returned in query results.
 * These columns are defined via `.defineReturnColumns()` in the config builder.
 *
 * **Use Cases:**
 * - Type-safe column selection in queries
 * - Dynamic query building with proper types
 * - Validation that certain columns are included
 *
 * @template TConfig - Table config with selectReturnSchema
 *
 * @example
 * ```ts
 * type Columns = InferReturnColumns<typeof tagConfig>;
 * // Result: "id" | "name" | "color" | "userId"
 *
 * // Usage in query builders:
 * const selectColumns = (cols: InferReturnColumns<typeof config>[]) => {
 *   return db.select().from(table).columns(cols);
 * };
 *
 * // Type-safe column checks:
 * type HasIdColumn = 'id' extends InferReturnColumns<typeof config> ? true : false;
 * ```
 */
export type InferReturnColums<
    TConfig extends {
        selectReturnSchema: z.ZodObject<TZodShape>;
    },
> = keyof z.infer<TConfig['selectReturnSchema']>;

/**
 * Infer the input shape for many filters operations.
 *
 * Extracts the input shape for filtering multiple records based on the table config.
 * Uses structural typing to dynamically include only configured schemas.
 *
 * **Structure:**
 * - `{ filters: Filters }` - Always present, contains partial fields from manyFiltersSchema
 */
export type InferManyFiltersInput<TConfig extends { manyFiltersSchema: z.ZodObject<TZodShape> }> =
    Prettify<z.infer<TConfig['manyFiltersSchema']>>;

/**
 * Infer the underlying Drizzle table type from a feature table config.
 *
 * Extracts the Drizzle table definition from a config, allowing you to work
 * with the raw table type when needed.
 *
 * @template TConfig - Table config with table property
 *
 * @example
 * ```ts
 * type TagTable = InferTableFromConfig<typeof tagConfig>;
 * // Result: PgTableWithColumns<{...}>
 *
 * // Usage with Drizzle operations:
 * const getTableName = (config: typeof tagConfig) => {
 *   type Table = InferTableFromConfig<typeof config>;
 *   // Can now use Table type with Drizzle functions
 * };
 * ```
 */
export type InferTableFromConfig<
    TConfig extends {
        table: Table;
    },
> = TConfig['table'];

/**
 * Infer Zod schema for a specific table field.
 *
 * Extracts the Zod schema for a single field from a Drizzle table if the field exists,
 * or returns EmptySchema if the field doesn't exist in the table.
 *
 * **Use Cases:**
 * - Auto-detecting optional fields (id, userId) in table definitions
 * - Building default schemas based on table structure
 * - Type-safe field schema extraction
 *
 * @template TTable - Drizzle table type
 * @template TField - Field name to extract (defaults to 'id')
 *
 * @example
 * ```ts
 * // Table has 'id' field:
 * type IdSchema = InferDefaultSchemaForField<typeof userTable, 'id'>;
 * // Result: z.ZodObject<{ id: z.ZodString }>
 *
 * // Table doesn't have 'ownerId' field:
 * type OwnerSchema = InferDefaultSchemaForField<typeof userTable, 'ownerId'>;
 * // Result: z.ZodObject<EmptySchema>
 *
 * // Used internally by builder:
 * const idSchema = InferDefaultSchemaForField<TTable, 'id'>;
 * const userIdSchema = InferDefaultSchemaForField<TTable, 'userId'>;
 * ```
 */
export type InferDefaultSchemaForField<
    TTable extends Table,
    TField extends string = 'id',
> = TField extends keyof TTable['_']['columns']
    ? z.ZodObject<Prettify<Pick<InferTableSchema<TTable, 'select'>['shape'], TField>>>
    : z.ZodObject<EmptySchema>;
