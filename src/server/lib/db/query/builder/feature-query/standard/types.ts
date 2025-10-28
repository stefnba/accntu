import { TOnConflict } from '@/server/lib/db/query/table-operations/types';
import { Table } from 'drizzle-orm';

/**
 * Configuration for standard query builder initialization.
 *
 * Defines which columns identify records and how to filter queries.
 *
 * @template TTable - The Drizzle table type
 *
 * @property idColumns - Array of column names that identify a unique record (e.g., ['id'])
 * @property userIdColumn - Optional column name for user-based filtering (e.g., 'userId')
 * @property defaultIdFilters - Optional default filters applied to all queries (e.g., { isActive: true })
 *
 * @example
 * ```typescript
 * const config: TStandardQueryConfig<typeof userTable> = {
 *   idColumns: ['id'],
 *   userIdColumn: 'userId',
 *   defaultIdFilters: { isActive: true }
 * };
 * ```
 */
export type TStandardQueryConfig<TTable extends Table> = {
    idColumns: Array<keyof TTable['_']['columns']>;
    userIdColumn?: keyof TTable['_']['columns'];
    defaultIdFilters?: {
        [K in keyof TTable['_']['columns']]?: TTable['_']['columns'][K]['_']['data'];
    };
};

/**
 * Options for creating records in the database.
 *
 * @template TTable - The Drizzle table type
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
export type TCreateQueryOptions<TTable extends Table> = {
    allowedColumns?: ReadonlyArray<keyof TTable['$inferInsert']>;
    returnColumns?: Array<keyof TTable['_']['columns']>;
    onConflict?: TOnConflict<TTable>;
};

/**
 * Options for fetching a single record by ID.
 *
 * @template TTable - The Drizzle table type
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
export type TGetByIdQueryOptions<TTable extends Table> = {
    returnColumns?: Array<keyof TTable['_']['columns']>;
};
