import { inArray, isNull, or } from 'drizzle-orm';
import { type PgColumn, PgSelect } from 'drizzle-orm/pg-core';

/**
 * Filter function helper for Drizzle inArray to also allow null values in array.
 * SQL `column IN (value1, value2)` filter is combined with OR `column IS NULL` clause.
 * @param column
 * @param value
 * @returns
 */
export const inArrayWithNullFilter = (
    column: PgColumn,
    value: Array<string | number | null> | undefined
) => {
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

export const queryBuilder = <T extends PgSelect>(query: T, options: {}) => {
    const dynamicQuery = query.$dynamic();
};
