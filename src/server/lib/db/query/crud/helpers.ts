import { asc, desc, and, Table, SQL } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import { typedEntries } from '@/lib/utils';

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
    return qb.limit(pageSize).offset((page - 1) * pageSize);
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
    orderBy: Partial<Record<keyof TTable['_']['columns'], 'asc' | 'desc'>>,
    getColumn: (column: keyof TTable['_']['columns']) => TTable['_']['columns'][keyof TTable['_']['columns']]
) {
    const orderByConditions = typedEntries(orderBy).map(([field, direction]) => {
        const column = getColumn(field);
        return direction === 'asc' ? asc(column) : desc(column);
    });

    return orderByConditions.length > 0 ? qb.orderBy(...orderByConditions) : qb;
}

/**
 * Helper function to add filters to a query
 * @param qb - The query builder
 * @param filters - Array of SQL filters (undefined filters are ignored)
 * @returns The query builder with filters applied
 */
export function withFilters<T extends PgSelect>(
    qb: T,
    filters: (SQL | undefined)[]
) {
    const validFilters = filters.filter((filter): filter is SQL => filter !== undefined);
    
    if (validFilters.length === 0) {
        return qb;
    }
    
    // Combine all filters with AND and apply them
    return qb.where(and(...validFilters));
}
