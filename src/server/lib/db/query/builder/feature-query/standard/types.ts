import {
    GetTableColumnDefinitions,
    GetTableColumnKeys,
    GetTableInsertKeys,
    TOnConflict,
} from '@/server/lib/db/query/table-operations/types';
import { CommonTableFieldKeys } from '@/server/lib/db/table';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';

// ========================================
// Internal utility types
// ========================================

/**
 * Get only custom columns from a table (excludes system-managed COMMON_FIELDS).
 *
 * Filters out: id, userId, isActive, createdAt, updatedAt
 * Use this when you want to restrict upsert operations to only custom columns.
 */
export type GetCustomColumnKeys<TTable extends Table> = Exclude<
    GetTableColumnKeys<TTable>,
    CommonTableFieldKeys
>;

/**
 * Get only custom insertable columns from a table (excludes system-managed COMMON_FIELDS).
 *
 * Filters out: id, userId, isActive, createdAt, updatedAt
 * Use this for create/update operations when you want to restrict to custom fields only.
 */
export type GetCustomInsertKeys<TTable extends Table> = Exclude<
    GetTableInsertKeys<TTable>,
    CommonTableFieldKeys
>;

/**
 * Array of column names to return from a query.
 *
 * Uses GetTableColumnKeys utility type for consistency across the codebase.
 *
 * @template TTable - The Drizzle table type
 *
 * @example
 * ```typescript
 * type Columns = TReturnColumns<typeof userTable>;
 * // Array<'id' | 'name' | 'email' | 'createdAt' | ...>
 * ```
 */
type TReturnColumns<TTable extends Table> = Array<GetTableColumnKeys<TTable>>;

/**
 * Filters to apply when querying records by ID.
 *
 * Allows specifying values for any column in the table as filter conditions.
 * Typically used for soft deletes or tenant isolation (e.g., { isActive: true, deletedAt: null }).
 *
 * Uses GetTableColumnDefinitions utility type for type-safe column access.
 *
 * @template TTable - The Drizzle table type
 *
 * @example
 * ```typescript
 * const filters: TIdFilters<typeof userTable> = {
 *   isActive: true,
 *   deletedAt: null
 * };
 * ```
 */
type TIdFilters<TTable extends Table> = {
    [K in GetTableColumnKeys<TTable>]?: GetTableColumnDefinitions<TTable>[K]['_']['data'];
};

// ========================================
// Generic default resolution helpers
// ========================================

/**
 * Resolves default allowed columns from config for INSERT/UPDATE operations.
 *
 * Extracts `allowedUpsertColumns` from config.defaults with proper type checking.
 * Falls back to all insertable columns if not configured.
 *
 * @template TTable - The Drizzle table type
 * @template Config - The standard query configuration
 *
 * @example
 * ```typescript
 * // With defaults configured
 * type Resolved = ResolveDefaultAllowedColumns<typeof userTable, MyConfig>;
 * // ReadonlyArray<'name' | 'email' | 'role'>
 *
 * // Without defaults
 * type Resolved = ResolveDefaultAllowedColumns<typeof userTable, MinimalConfig>;
 * // ReadonlyArray<keyof UserTable['$inferInsert']>
 * ```
 */
export type ResolveDefaultAllowedColumns<
    TTable extends Table,
    Config extends TStandardQueryConfig<TTable>,
> = Config['defaults'] extends { allowedUpsertColumns: infer A }
    ? A extends ReadonlyArray<GetTableInsertKeys<TTable>>
        ? A
        : ReadonlyArray<GetTableInsertKeys<TTable>>
    : ReadonlyArray<GetTableInsertKeys<TTable>>;

/**
 * Resolves default return columns from config for SELECT operations.
 *
 * Extracts `returnColumns` from config.defaults with proper type checking.
 * Falls back to all selectable columns if not configured.
 *
 * @template TTable - The Drizzle table type
 * @template Config - The standard query configuration
 *
 * @example
 * ```typescript
 * // With defaults configured
 * type Resolved = ResolveDefaultReturnColumns<typeof userTable, MyConfig>;
 * // Array<'id' | 'name' | 'email'>
 *
 * // Without defaults
 * type Resolved = ResolveDefaultReturnColumns<typeof userTable, MinimalConfig>;
 * // Array<keyof UserTable['_']['columns']>
 * ```
 */
export type ResolveDefaultReturnColumns<
    TTable extends Table,
    Config extends TStandardQueryConfig<TTable>,
> = Config['defaults'] extends { returnColumns: infer R }
    ? R extends Array<GetTableColumnKeys<TTable>>
        ? R
        : Array<GetTableColumnKeys<TTable>>
    : Array<GetTableColumnKeys<TTable>>;

// ========================================
// Config
// ========================================

/**
 * Default values for standard queries.
 *
 * These defaults are applied to all standard queries unless overridden.
 *
 * @template TTable - The Drizzle table type
 *
 * @property idFilters - Default filters applied to all queries (e.g., { isActive: true })
 * @property returnColumns - Default columns to return in query results
 *
 * @example
 * ```typescript
 * const defaults: TStandardQueryConfigDefaults<typeof userTable> = {
 *   idFilters: { isActive: true },
 *   returnColumns: ['id', 'name', 'email']
 * };
 * ```
 */
export type TStandardQueryConfigDefaults<
    TTable extends Table,
    OnlyAllowCustomFields extends boolean = true,
> = {
    /**
     * Default filters applied to ALL queries (e.g., soft delete, tenant isolation).
     *
     * These filters are automatically added to getById, getMany, updateById, etc.
     * Common use cases: `{ isActive: true }`, `{ deletedAt: null }`
     *
     * @example
     * ```typescript
     * idFilters: { isActive: true, deletedAt: null }
     * ```
     */
    idFilters?: TIdFilters<TTable>;

    /**
     * Default columns to return from queries (can be overridden per query).
     *
     * Specifies which fields are included in query results by default.
     * Used by: create, getById, getMany, updateById
     *
     * @example
     * ```typescript
     * returnColumns: ['id', 'name', 'email', 'createdAt']
     * ```
     */
    returnColumns?: TReturnColumns<TTable>;

    /**
     * Default columns allowed for create/update operations (can be overridden per query).
     *
     * Security whitelist - only these columns can be inserted/updated by default.
     * Used by: create, createMany, updateById, updateMany
     *
     * **Type Constraint:** When `excludeSystemFields = true`, only custom fields allowed (no system fields).
     *
     * @example
     * ```typescript
     * // excludeSystemFields = false (default)
     * allowedUpsertColumns: ['name', 'email', 'id', 'userId']  // ✅ All fields allowed
     *
     * // excludeSystemFields = true
     * allowedUpsertColumns: ['name', 'email']  // ✅ Only custom fields
     * allowedUpsertColumns: ['name', 'id']     // ❌ TypeScript error: 'id' is a system field
     * ```
     */
    allowedUpsertColumns?: ReadonlyArray<
        OnlyAllowCustomFields extends true
            ? GetCustomInsertKeys<TTable>
            : GetTableInsertKeys<TTable>
    >;
};

/**
 * Configuration for standard query builder initialization.
 *
 * Defines which columns identify records and how to filter queries.
 *
 * @template TTable - The Drizzle table type
 *
 * @example
 * ```typescript
 * .standardQueries({
 *   idColumns: ['id'],
 *   userIdColumn: 'userId',
 *   defaults: { ... }
 * })
 * ```
 */
export type TStandardQueryConfig<TTable extends Table> = {
    /**
     * Array of column names that uniquely identify a record.
     *
     * Used by getById, updateById, removeById to locate records.
     * Typically just `['id']`, but can be composite keys: `['tenantId', 'id']`
     *
     * @example
     * ```typescript
     * idColumns: ['id']
     * // or composite key:
     * idColumns: ['tenantId', 'userId']
     * ```
     */
    idColumns: Array<GetTableColumnKeys<TTable>>;

    /**
     * Column name for user-based filtering (multi-tenancy, row-level security).
     *
     * When set, all queries automatically filter by this column.
     * Common use: ensuring users can only access their own data.
     *
     * @example
     * ```typescript
     * userIdColumn: 'userId'
     * // Query input will require: { userId: string, ... }
     * ```
     */
    userIdColumn?: GetTableColumnKeys<TTable>;

    /**
     * Default configuration for all standard queries.
     *
     * Set common values to avoid repetition across create, getById, etc.
     * Any default can be overridden per-query when needed.
     *
     * **Type Constraint:** When `excludeSystemFields = true`, the `allowedUpsertColumns`
     * in defaults can only contain custom fields (no system fields).
     *
     * @example
     * ```typescript
     * defaults: {
     *   idFilters: { isActive: true },
     *   returnColumns: ['id', 'name', 'email'],
     *   allowedUpsertColumns: ['name', 'email', 'role']
     * }
     * ```
     */
    defaults?: TStandardQueryConfigDefaults<TTable>;
};

// ========================================
// Query options
// ========================================

/**
 * Options for creating records in the database.
 *
 * @template TTable - The Drizzle table type
 * @template TAllowedColumns - Specific columns that can be inserted (for type safety)
 * @template TReturnColumns - Specific columns to return (for type safety)
 * @template ExcludeSystemFields - When true, restricts allowedColumns to custom fields only
 *
 * @example
 * ```typescript
 * .create({
 *   allowedColumns: ['name', 'email'],
 *   returnColumns: ['id', 'name', 'createdAt'],
 *   onConflict: 'ignore'
 * })
 *
 * // Or use defaults from config
 * .create({
 *   onConflict: 'ignore'
 *   // allowedColumns and returnColumns will use config.defaults
 * })
 * ```
 */
export type TCreateQueryOptions<
    TTable extends Table,
    TAllowedColumns extends ReadonlyArray<GetTableInsertKeys<TTable>> = ReadonlyArray<
        GetTableInsertKeys<TTable>
    >,
    TReturnColumns extends Array<GetTableColumnKeys<TTable>> = Array<GetTableColumnKeys<TTable>>,
> = {
    /**
     * Columns that can be inserted (security whitelist).
     *
     * Optional - uses `config.defaults.allowedUpsertColumns` if not specified.
     * Only these columns can be included in the insert data.
     *
     * @example
     * ```typescript
     * allowedColumns: ['name', 'email', 'role']
     * ```
     */
    allowedColumns?: TAllowedColumns;

    /**
     * Columns to return after creation.
     *
     * Optional - uses `config.defaults.returnColumns` if not specified.
     * Specifies which fields are included in the result object.
     *
     * @example
     * ```typescript
     * returnColumns: ['id', 'name', 'createdAt']
     * ```
     */
    returnColumns?: TReturnColumns;

    /**
     * How to handle duplicate key conflicts.
     *
     * - `'ignore'` - Skip conflicting inserts silently
     * - `'update'` - Update existing records on conflict
     * - `'fail'` - Let database throw error (default)
     * - Object with detailed conflict handling config
     *
     * @example
     * ```typescript
     * onConflict: 'ignore'
     * // or
     * onConflict: {
     *   type: 'update',
     *   target: ['email'],
     *   setExcluded: ['name', 'updatedAt']
     * }
     * ```
     */
    onConflict?: TOnConflict<TTable>;
};

/**
 * Options for fetching a single record by ID.
 *
 * @template TTable - The Drizzle table type
 * @template TReturnColumns - Specific columns to return (for type safety)
 *
 * @example
 * ```typescript
 * .getById({
 *   returnColumns: ['id', 'name', 'email']
 * })
 * ```
 */
export type TGetByIdQueryOptions<
    TTable extends Table,
    TReturnColumns extends Array<GetTableColumnKeys<TTable>> = Array<GetTableColumnKeys<TTable>>,
> = {
    /**
     * Columns to return in the result.
     *
     * Optional - uses `config.defaults.returnColumns` if not specified.
     * Only these fields will be included in the returned record.
     *
     * @example
     * ```typescript
     * returnColumns: ['id', 'name', 'email', 'createdAt']
     * ```
     */
    returnColumns?: TReturnColumns;

    /**
     * Additional filters to apply (overrides config defaults for this query only).
     *
     * Optional - uses `config.defaults.idFilters` if not specified.
     * Useful for query-specific filtering (e.g., temporary override of soft delete).
     *
     * @example
     * ```typescript
     * idFilters: { isActive: false }  // Override to fetch inactive records
     * ```
     */
    idFilters?: TIdFilters<TTable>;
};

/**
 * Options for configuring an updateById query.
 *
 * Combines ID-based lookup with update column restrictions and return column selection.
 * Inherits `returnColumns` and `idFilters` from `TGetByIdQueryOptions`, and `allowedColumns`
 * from `TCreateQueryOptions`.
 *
 * @template TTable - The Drizzle table type
 * @template TAllowedColumns - Columns allowed for update (security whitelist)
 * @template TReturnColumns - Columns to return in the result
 *
 * @example
 * ```typescript
 * // Define updateById with restricted columns
 * .updateById<['name', 'email'], ['id', 'name', 'email', 'updatedAt']>({
 *   allowedColumns: ['name', 'email'],
 *   returnColumns: ['id', 'name', 'email', 'updatedAt']
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Using defaults - no options needed
 * .updateById()  // Uses config.defaults.allowedUpsertColumns & returnColumns
 * ```
 */
export type TUpdateByIdQueryOptions<
    TTable extends Table,
    TAllowedColumns extends ReadonlyArray<GetTableInsertKeys<TTable>> = ReadonlyArray<
        GetTableInsertKeys<TTable>
    >,
    TReturnColumns extends Array<GetTableColumnKeys<TTable>> = Array<GetTableColumnKeys<TTable>>,
> = Prettify<
    TGetByIdQueryOptions<TTable, TReturnColumns> &
        Omit<TCreateQueryOptions<TTable, TAllowedColumns, TReturnColumns>, 'returnColumns'>
>;
