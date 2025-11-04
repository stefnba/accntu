import {
    GetTableColumnDefinitions,
    GetTableColumnKeys,
} from '@/server/lib/db/query/table-operations';
import { Table } from 'drizzle-orm';

export type TStandardNewQueryConfig<TTable extends Table> = {
    defaultFilters?: TDefaultFilters<TTable>;
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
