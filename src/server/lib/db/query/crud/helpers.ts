import { PgSelect } from 'drizzle-orm/pg-core';

/**
 * Helper function to add pagination to a query
 * @param qb - The query builder
 * @param page - The page number
 * @param pageSize - The page size
 * @returns The query builder with pagination
 */
function withPagination<T extends PgSelect>(
    qb: T,
    { page, pageSize }: { page: number; pageSize: number }
) {
    return qb.limit(pageSize).offset((page - 1) * pageSize);
}
