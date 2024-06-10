import { SQL, asc, desc, inArray, isNull, or } from 'drizzle-orm';
import { type PgColumn, PgSelect, PgSelectDynamic } from 'drizzle-orm/pg-core';

/**
 * Filter function helper for Drizzle inArray to also allow null values in array.
 * SQL `column IN (value1, value2)` filter is combined with OR `column IS NULL` clause.
 * @param column
 * @param value
 * @returns
 */
export const inArrayWithNullFilter = (
    column: PgColumn,
    value: Array<string | number | null> | undefined | string | number | null
): undefined | SQL => {
    if (!value) return undefined;

    // turn value into an array and re-run function
    if (!Array.isArray(value)) return inArrayWithNullFilter(column, [value]);

    if (!value || value.length === 0) return undefined;

    if (value.includes(null)) {
        const nonNullValues = value.filter((f) => f);

        // Drizzle doesn't support empty array in inArray
        if (nonNullValues.length === 0) {
            return isNull(column);
        }

        return or(inArray(column, nonNullValues), isNull(column));
    }
    return inArray(column, value);
};

export const inArrayFilter = (
    column: PgColumn,
    value: Array<string> | undefined
) => {
    // Drizzle doesn't support empty array in inArray
    if (!value || value.length === 0) return undefined;

    return inArray(column, value);
};

export const withPagination = <T extends PgSelect>(
    query: T,
    page: number = 1,
    pageSize: number = 25
) => {
    return query.limit(pageSize).offset((page - 1) * pageSize);
};

type QueryBuilderParams = {
    page?: number;
    pageSize?: number;
    filters?: SQL;
    orderBy?: Array<{ column: PgColumn; direction: 'asc' | 'desc' }>;
};

/**
 * Extend a Drizzle query with pagination, filters and ordering.
 * @param query Drizzle query.
 * @param options
 * @returns
 */
export const queryBuilder = <T extends PgSelect>(
    query: T,
    { page, pageSize, filters, orderBy }: QueryBuilderParams
): T => {
    // const dynamicQuery = query.$dynamic();

    if (filters) {
        query.where(filters);
    }

    if (orderBy) {
        query.orderBy(
            ...orderBy.map(({ column, direction }) => {
                if (direction === 'asc') return asc(column);
                return desc(column);
            })
        );
    }

    if (pageSize) {
        query.limit(pageSize);
    }

    if (page) {
        if (!pageSize) throw new Error('pageSize is required when using page.');
        query.offset((page - 1) * pageSize);
    }

    return query;
};
