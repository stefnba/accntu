import { TOrderBy } from '@/server/lib/db/query/table-operations/types';
import { and, asc, desc, SQL, Table } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';

/**
 * Helper function to add pagination to a query
 * @param qb - The query builder
 * @param page - The page number
 * @param pageSize - The page size
 * @returns The query builder with pagination
 */
export function withPagination<T extends PgSelect>(
    qb: T,
    { page, pageSize }: { page: number; pageSize: number }
) {
    // Ensure page is at least 1 and pageSize is at least 0 to prevent negative offsets
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(0, pageSize);
    return qb.limit(safePageSize).offset((safePage - 1) * safePageSize);
}

/**
 * Helper function to add ordering to a query
 * @param qb - The query builder
 * @param orderBy - The ordering specification
 * @param getColumn - Function to get column reference
 * @returns The query builder with ordering applied
 */
export function withOrdering<T extends PgSelect, TTable extends Table>(
    qb: T,
    orderBy: TOrderBy<TTable>,
    getColumn: (
        column: keyof TTable['_']['columns']
    ) => TTable['_']['columns'][keyof TTable['_']['columns']]
) {
    const orderByConditions = orderBy.map((item) => {
        // if the item is a string, get the column and order by ascending
        if (typeof item === 'string') {
            return asc(getColumn(item));
        }

        // if the item is an object, get the field and direction
        if (typeof item === 'object' && 'field' in item && 'direction' in item) {
            const { field, direction } = item;
            const column = getColumn(field);
            return direction === 'asc' ? asc(column) : desc(column);
        }

        // if the item is not a string or object, throw an error
        throw new Error(`Invalid ordering item: ${JSON.stringify(item)}`);
    });

    return orderByConditions.length > 0 ? qb.orderBy(...orderByConditions) : qb;
}

/**
 * Helper function to add filters to a query
 * @param qb - The query builder
 * @param filters - Array of SQL filters (undefined filters are ignored)
 * @returns The query builder with filters applied
 */
export function withFilters<T extends PgSelect>(qb: T, filters: (SQL | undefined)[] | undefined) {
    // if no filters are provided, return the query builder
    if (!filters) {
        return qb;
    }

    // filter out undefined filters
    const validFilters = filters.filter((filter): filter is SQL => filter !== undefined);

    if (validFilters.length === 0) {
        return qb;
    }

    // Combine all filters with AND and apply them
    return qb.where(and(...validFilters));
}
