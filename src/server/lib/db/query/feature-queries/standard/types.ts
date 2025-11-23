import { GetTableColumnDefinitions, GetTableColumnKeys } from '@/server/lib/db/drizzle';
import { TOrderBy, TPagination } from '@/server/lib/db/query/table-operations';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';

/**
 * Configuration options for constructing a standard query builder for a specific feature table.
 *
 * Provides hooks for default filters (applied to all/most queries), pagination, ordering, and per-operation defaults.
 *
 * @template TTable - A Drizzle Table instance type
 *
 * @property defaultFilters - Filters applied to all operations unless overridden (e.g., soft-delete, tenancy).
 * @property getMany - Options specifically for the "getMany" operation:
 *   - defaultPagination: Default page size for list queries.
 *   - defaultOrdering: Default column ordering (should match enabled/allowed ordering columns).
 *   - defaultFilters: Additional default filters for getMany.
 *   - filters: Whether runtime filters are supported in getMany.
 * @property getById - Options for "getById" operation:
 *   - defaultFilters: Filters always applied to getById calls.
 */
export type TStandardNewQueryConfig<TTable extends Table> = {
    defaultFilters?: TDefaultFilters<TTable>;
    getMany?: {
        defaultPagination?: Prettify<Pick<TPagination, 'pageSize'>>;
        defaultOrdering?: TOrderBy<TTable>; // todo restrict this to the columns that are enabled for ordering
        defaultFilters?: TDefaultFilters<TTable>;
        filters?: boolean;
    };
    getById?: {
        defaultFilters?: TDefaultFilters<TTable>;
    };
};

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
type TDefaultFilters<TTable extends Table> = {
    [K in GetTableColumnKeys<TTable>]?: GetTableColumnDefinitions<TTable>[K]['_']['data'];
};
