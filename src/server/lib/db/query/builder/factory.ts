import { InferQuerySchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { typedEntries } from '@/lib/utils';
import { QueryFn } from '@/server/lib/db/query/builder/types';
import { CrudQueryBuilder } from '@/server/lib/db/query/crud/core';
import { RequiredOnly, TByIdInput } from '@/server/lib/db/query/crud/types';
import { GetColumnData, InferInsertModel, SQLWrapper, Table } from 'drizzle-orm';
import { QueryBuilder } from './core';

class FeatureQueries<
    const TSchemas extends Record<string, TOperationSchemaObject> = Record<
        string,
        TOperationSchemaObject
    >,
> {
    schemas: TSchemas;

    constructor({ schemas }: { schemas: TSchemas }) {
        this.schemas = schemas;
    }

    /**
     * Register a schema to the feature query collection.
     * @param schemas - The schemas to register
     */
    registerSchema<T extends Record<string, TOperationSchemaObject>>(schemas: T) {
        return new FeatureQueries<TSchemas & T>({
            schemas: {
                ...this.schemas,
                ...schemas,
            },
        });
    }

    /**
     * Register core queries for a table
     * @param table - The table that the queries are for
     * @param config - The config for the queries
     * @param TIdFields - The fields that are used to identify the record
     * @param TUserIdField - The field that is used to identify the user
     * @param TReturnColumns - The columns that are returned by the queries
     * @param TAllowedUpsertColumns - The columns that are allowed to be upserted
     *
     * @example
     * ```typescript
     * const queries = createFeatureQueries.registerCoreQueries(tag, {
     *     idFields: ['id'],
     *     userIdField: 'userId',
     *     returnColumns: ['id', 'name'],
     *     allowedUpsertColumns: ['name'],
     * });
     * ```
     * @returns A new FeatureQueries with the registered queries
     */
    registerCoreQueries<
        T extends Table,
        TIdFields extends Array<keyof T['_']['columns']>,
        TUserIdField extends keyof T['_']['columns'] | undefined = undefined,
        TReturnColumns extends Array<keyof T['_']['columns']> = Array<keyof T['_']['columns']>,
        TAllowedUpsertColumns extends ReadonlyArray<keyof T['$inferInsert']> = ReadonlyArray<
            keyof T['$inferInsert']
        >,
        TManyFilters extends Record<string, any> | undefined = undefined,
    >(
        table: T,
        config: {
            /**
             * The fields that are used to identify the record
             */
            idFields: TIdFields;

            /**
             * The field that is used to identify the user
             */
            userIdField?: TUserIdField;

            /**
             * The columns that are returned by the queries
             */
            returnColumns?: TReturnColumns;

            /**
             * The columns that are allowed to be upserted
             */
            allowedUpsertColumns?: TAllowedUpsertColumns;

            /**
             * Whether to soft delete the record. Defaults to true.
             */
            softDelete?: boolean;

            /**
             * The filters that are used to filter the records
             *
             * @example
             * ```typescript
             * const queries = createFeatureQueries.registerCoreQueries(tag, {
             *     manyFilters: (filters: Partial<{ name: string; description: string }>) =>
             *          [
             *              eq(tag.name, filters.name),
             *              eq(tag.description, filters.description),
             *          ],
             * });
             * ```
             */
            manyFilters?: (filters: TManyFilters) => (SQLWrapper | undefined)[];
        }
    ) {
        const { returnColumns, softDelete = true, manyFilters } = config;
        const q = new CrudQueryBuilder(table);

        return new QueryBuilder<
            TSchemas,
            {
                /**
                 * Create a record in the table
                 */
                create: QueryFn<
                    {
                        data: Pick<InferInsertModel<T>, TAllowedUpsertColumns[number]> &
                            RequiredOnly<T['$inferInsert']>;
                    },
                    { [K in TReturnColumns[number]]: T['_']['columns'][K]['_']['data'] }
                >;
                /**
                 * Create many records in the table
                 */
                createMany: QueryFn<
                    {
                        data: Array<
                            Pick<InferInsertModel<T>, TAllowedUpsertColumns[number]> &
                                RequiredOnly<T['$inferInsert']>
                        >;
                    },
                    { [K in TReturnColumns[number]]: T['_']['columns'][K]['_']['data'] }[]
                >;
                /**
                 * Get a record by the given identifiers
                 */
                getById: QueryFn<
                    TByIdInput<T, TIdFields, TUserIdField>,
                    { [K in TReturnColumns[number]]: T['_']['columns'][K]['_']['data'] }
                >;
                /**
                 * Get many records by the given identifiers
                 */
                getMany: QueryFn<
                    {
                        filters?: TManyFilters;
                        limit?: number;
                        pagination?: {
                            page?: number;
                            pageSize?: number;
                        };
                    } & (TUserIdField extends keyof T['_']['columns']
                        ? {
                              userId: GetColumnData<T['_']['columns'][TUserIdField]>;
                          }
                        : object),
                    { [K in TReturnColumns[number]]: T['_']['columns'][K]['_']['data'] }[]
                >;
                /**
                 * Update a record by the given identifiers
                 */
                updateById: QueryFn<
                    TByIdInput<T, TIdFields, TUserIdField> & {
                        data: Pick<InferInsertModel<T>, TAllowedUpsertColumns[number]>;
                    },
                    { [K in TReturnColumns[number]]: T['_']['columns'][K]['_']['data'] }
                >;
                /**
                 * Remove a record by the given identifiers
                 */
                removeById: QueryFn<TByIdInput<T, TIdFields, TUserIdField>, void>;
            }
        >({
            schemas: this.schemas,
            queries: {
                /**
                 * Create a record in the table
                 */
                create: (input) =>
                    q.createRecord<TReturnColumns>({ data: input.data, returnColumns }),
                /**
                 * Create many records in the table
                 */
                createMany: (input) => q.createManyRecords({ data: input.data }),
                /**
                 * Get a record by the given identifiers
                 */
                getById: async (input) =>
                    q.getFirstRecord<TReturnColumns>({
                        columns: returnColumns,
                        identifiers: typedEntries(input.ids).map(([key, value]) => ({
                            field: key,
                            value,
                        })),
                    }),
                /**
                 * Get many records by the given identifiers
                 */
                getMany: (input) =>
                    q.getManyRecords<TReturnColumns>({
                        limit: input.limit,
                        identifiers:
                            'userId' in input && input.userId
                                ? [{ field: 'userId', value: input.userId }]
                                : [],
                        // filters: input.filters,
                        // pagination: input.pagination,
                        columns: returnColumns,
                        filters: input.filters ? manyFilters?.(input.filters) : undefined,
                    }),
                /**
                 * Update a record by the given identifiers
                 */
                updateById: (input) =>
                    q.updateRecord<TReturnColumns>({
                        data: input.data,
                        identifiers: typedEntries(input.ids).map(([key, value]) => ({
                            field: key,
                            value,
                        })),
                        returnColumns,
                    }),
                /**
                 * Remove a record by the given identifiers
                 */
                removeById: (input) =>
                    q.removeRecord({
                        identifiers: typedEntries(input.ids).map(([key, value]) => ({
                            field: key,
                            value,
                        })),
                        softDelete,
                    }),
            },
        });
    }

    /**
     * Add a query to the feature query collection. This is a shortcut for adding a query to the QueryBuilder.
     * @param key - The key of the query
     * @param config - The config of the query
     */
    addQuery<
        const K extends keyof TSchemas & string,
        TOutput,
        TInput = K extends keyof InferQuerySchemas<TSchemas>
            ? InferQuerySchemas<TSchemas>[K]
            : never,
    >(key: K, config: { fn: QueryFn<TInput, TOutput>; operation?: string }) {
        return new QueryBuilder<TSchemas>({
            schemas: this.schemas,
            queries: {},
        }).addQuery(key, config);
    }
}

/**
 * Factory function to create a feature query collection.
 */
export const createFeatureQueries = new FeatureQueries({
    schemas: {},
});
