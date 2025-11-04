import { GetTableColumnKeys } from '@/server/lib/db/query/table-operations';
import {
    Column,
    ColumnBaseConfig,
    ColumnDataType,
    eq,
    getTableColumns,
    ilike,
    inArray,
    isNotNull,
    isNull,
    like,
    notInArray,
    Table,
} from 'drizzle-orm';

export const queryFilters = {
    /**
     * Ilike filter (case insensitive like)
     */
    ilike: (
        field: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>,
        value: string | undefined
    ) => (value ? ilike(field, `%${value}%`) : undefined),
    /**
     * Like filter (case sensitive like)
     */
    like: (
        field: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>,
        value: string | undefined
    ) => (value ? like(field, `%${value}%`) : undefined),
    /**
     * Equal to filter
     */
    eq: (
        field: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>,
        value: string | undefined
    ) => (value ? eq(field, value) : undefined),
    /**
     * Is NULL
     */
    isNull: (field: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>) =>
        isNull(field),
    /**
     * Is NOT NULL
     */
    isNotNull: (field: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>) =>
        isNotNull(field),
    /**
     * In array
     */
    inArray: (
        field: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>,
        value: string[] | undefined
    ) => (value ? inArray(field, value) : undefined),
    /**
     * Not in array
     */
    notInArray: (
        field: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>,
        value: string[] | undefined
    ) => (value ? notInArray(field, value) : undefined),
};

/**
 * Wrapper function to add filters to a table and allow using column names as filter fields and inferring the types
 * @param table - The table to add filters to
 *
 * @example
 * ```typescript
 * const filters = withTableFilters(tag);
 * filters.ilike('name', 'test');
 * filters.like('name', 'test');
 * filters.eq('name', 'test');
 * ```
 */
export const withTableFilters = <T extends Table>(table: T) => {
    return {
        ilike: <TCol extends GetTableColumnKeys<T>>(
            field: TCol,
            value: (T['_']['columns'][TCol]['_']['data'] & string) | undefined
        ) => queryFilters.ilike(getTableColumns(table)[field], value),
        like: <TCol extends GetTableColumnKeys<T>>(
            field: TCol,
            value: (T['_']['columns'][TCol]['_']['data'] & string) | undefined
        ) => queryFilters.like(getTableColumns(table)[field], value),
        eq: <TCol extends GetTableColumnKeys<T>>(
            field: TCol,
            value: T['_']['columns'][TCol]['_']['data'] | undefined
        ) => queryFilters.eq(getTableColumns(table)[field], value),
        isNull: <TCol extends GetTableColumnKeys<T>>(field: TCol) =>
            queryFilters.isNull(getTableColumns(table)[field]),
        isNotNull: <TCol extends GetTableColumnKeys<T>>(field: TCol) =>
            queryFilters.isNotNull(getTableColumns(table)[field]),
        inArray: <TCol extends GetTableColumnKeys<T>>(
            field: TCol,
            value: (T['_']['columns'][TCol]['_']['data'] & string)[] | undefined
        ) => queryFilters.inArray(getTableColumns(table)[field], value),
        notInArray: <TCol extends GetTableColumnKeys<T>>(
            field: TCol,
            value: (T['_']['columns'][TCol]['_']['data'] & string)[] | undefined
        ) => queryFilters.notInArray(getTableColumns(table)[field], value),
    };
};
