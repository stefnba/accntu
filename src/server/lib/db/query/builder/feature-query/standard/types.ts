import { TOnConflict } from '@/server/lib/db/query/table-operations/types';
import { Table } from 'drizzle-orm';

type TReturnColumns<TTable extends Table> = Array<keyof TTable['_']['columns']>;

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
export type TStandardQueryConfigDefaults<TTable extends Table> = {
    idFilters?: {
        [K in keyof TTable['_']['columns']]?: TTable['_']['columns'][K]['_']['data'];
    };
    returnColumns?: TReturnColumns<TTable>;
};

/**
 * Configuration for standard query builder initialization.
 *
 * Defines which columns identify records and how to filter queries.
 *
 * @template TTable - The Drizzle table type
 *
 * @property idColumns - Array of column names that identify a unique record (e.g., ['id'])
 * @property userIdColumn - Optional column name for user-based filtering (e.g., 'userId')
 * @property defaults - Default configuration for all standard queries (idFilters, returnColumns)
 */
export type TStandardQueryConfig<TTable extends Table> = {
    idColumns: Array<keyof TTable['_']['columns']>;
    userIdColumn?: keyof TTable['_']['columns'];
    defaults?: TStandardQueryConfigDefaults<TTable>;
};

/**
 * Options for creating records in the database.
 *
 * @template TTable - The Drizzle table type
 * @template TAllowedColumns - Specific columns that can be inserted (for type safety)
 * @template TReturnColumns - Specific columns to return (for type safety)
 *
 * @property allowedColumns - Columns that can be inserted (whitelist for security)
 * @property returnColumns - Columns to return after creation
 * @property onConflict - How to handle conflicts (e.g., 'ignore', 'update', or detailed config)
 *
 * @example
 * ```typescript
 * .create({
 *   allowedColumns: ['name', 'email'],
 *   returnColumns: ['id', 'name', 'createdAt'],
 *   onConflict: 'ignore'
 * })
 * ```
 */
export type TCreateQueryOptions<
    TTable extends Table,
    TAllowedColumns extends ReadonlyArray<keyof TTable['$inferInsert']> = ReadonlyArray<
        keyof TTable['$inferInsert']
    >,
    TReturnColumns extends Array<keyof TTable['_']['columns']> = Array<
        keyof TTable['_']['columns']
    >,
> = {
    allowedColumns: TAllowedColumns;
    returnColumns?: TReturnColumns;
    onConflict?: TOnConflict<TTable>;
};

/**
 * Options for fetching a single record by ID.
 *
 * @template TTable - The Drizzle table type
 * @template TReturnColumns - Specific columns to return (for type safety)
 *
 * @property returnColumns - Columns to return (only these fields will be in the result)
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
    TReturnColumns extends Array<keyof TTable['_']['columns']> = Array<
        keyof TTable['_']['columns']
    >,
> = {
    returnColumns?: TReturnColumns;
};
