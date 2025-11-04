import { typedKeys } from '@/lib/utils';
import { getTableColumns, Table } from 'drizzle-orm';

/**
 * Get the columns from a table
 * @param table - The table to get the columns from
 * @returns The columns from the table as an array of keys
 * @example
 * ```ts
 * const columns = getColumnsFromTable(tag);
 * // ['id', 'userId', 'name', 'description', 'createdAt', 'updatedAt'] as const
 * ```
 */
export const getColumnsFromTable = <T extends Table>(table: T): Array<keyof T['_']['columns']> => {
    const columns = getTableColumns(table);
    return typedKeys(columns);
};

/**
 * Check if a table has a column
 * @param table - The table to check the column in
 * @param column - The column to check for
 * @returns True if the table has the column, false otherwise
 * @example
 * ```ts
 * const hasColumn = tableHasColumn(tag, 'name');
 * // true
 * ```
 */
export const tableHasColumn = <T extends Table>(
    table: T,
    column: keyof T['_']['columns']
): boolean => {
    const columns = getColumnsFromTable(table);
    return columns.includes(column);
};

/**
 * Type guard that checks if a Drizzle table contains a specific column.
 *
 * Narrows the `field` parameter to be a valid key of the table's columns,
 * enabling type-safe column access in subsequent operations.
 *
 * @param table - The Drizzle table instance to check
 * @param field - The column name to search for
 * @returns Type predicate indicating if the field exists as a column
 *
 * @example
 * if (tableHasField(userTable, 'email')) {
 *   // TypeScript now knows 'email' is a valid column
 * }
 */
export const tableHasField = (
    table: Table,
    field: string
): field is keyof Table['_']['columns'] => {
    const cols = getTableColumns(table);
    return Object.keys(cols).includes(field);
};
