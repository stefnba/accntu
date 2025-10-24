import type { InferQuerySchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { typedEntries } from '@/lib/utils';
import type { QueryFn, TCoreQueries } from '@/server/lib/db/query/feature-queries/types';
import { withTableFilters } from '@/server/lib/db/query/filters';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations';
import { SQL, Table } from 'drizzle-orm';
import { FeatureQueryBuilder } from './core';
import { defaultIdFiltersIdentifier, userIdIdentifier } from './helpers';

class FeatureQueryFactory<
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
        return new FeatureQueryFactory<TSchemas & T>({
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
     * @param TManyFilters - The filters that are used to filter the records
     * @param TQueryConfig - The config for the queries
     * @param TSoftDelete - Whether to soft delete the record
     *
     * @example
     * ```typescript
     * const queries = createFeatureQueries.registerCoreQueries(tag, {
     *     idFields: ['id'],
     *     userIdField: 'userId',
     *     returnColumns: ['id', 'name'],
     *     allowedUpsertColumns: ['name'],
     *     queryConfig: {
     *         getMany: {
     *             filters: (filters: Partial<{ name: string; description: string }>) => [
     *                 eq(tag.name, filters.name),
     *                 eq(tag.description, filters.description),
     *             ],
     *         },
     *         create: {
     *             onConflict: 'update',
     *         },
     *     },
     *     softDelete: true,
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
        // TManyFilters extends Record<
        //     string,
        //     any
        // > = InferQuerySchemas<TSchemas>['getMany']['filters'],
    >(
        table: T,
        config: {
            /**
             * The fields that are used to identify the record
             */
            idFields: TIdFields;

            /**
             * The default filters that are used to filter the records
             * @example
             * ```typescript
             * const queries = createFeatureQueries.registerCoreQueries(tag, {
             *     defaultIdFilters: {
             *         isActive: true,
             *     },
             * });
             * ```
             */
            defaultIdFilters?: {
                [K in keyof T['_']['columns']]?: T['_']['columns'][K]['_']['data'];
            };

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

            // manyFilters?: (filters: TManyFilters) => (SQLWrapper | undefined)[];
            queryConfig?: {
                create?: {
                    /**
                     * The data that is used to create the record
                     */
                    onConflict?: 'update' | 'ignore' | 'fail';
                };
                updateById?: {
                    /**
                     * The data that is used to update the record
                     */
                    onConflict?: 'update' | 'ignore' | 'fail';
                };
                getMany?: {
                    /**
                     * The filters that are used to filter the records. If the schema has a `getMany` operation with a `layer` schema returning `filter`,
                     * the filters will be inferred using the schema.
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
                    filters?: (
                        filterParams: InferQuerySchemas<TSchemas>['getMany']['filters'],
                        filterClauses: ReturnType<typeof withTableFilters<T>>
                    ) => (SQL<unknown> | undefined)[];
                    orderBy?: Partial<Record<keyof T['_']['columns'], 'asc' | 'desc'>>;
                };
            };
        }
    ) {
        const {
            returnColumns,
            softDelete = true,
            queryConfig = {},
            defaultIdFilters,
            userIdField,
        } = config;

        const q = new TableOperationsBuilder(table);

        const queries: TCoreQueries<
            TSchemas,
            T,
            TIdFields,
            TUserIdField,
            TReturnColumns,
            TAllowedUpsertColumns
        > = {
            /**
             * Create a record in the table
             */
            create: (input) => {
                // If userIdField is defined and part of input, then merge it with input.data
                // This is safe because TCreateInput<T, TUserIdField, TAllowedUpsertColumns> guarantees
                // that when userIdField is defined, input contains the userId property
                const data =
                    userIdField && userIdField in input
                        ? { ...input.data, [userIdField]: input[userIdField as keyof typeof input] }
                        : input.data;

                return q.createRecord<TReturnColumns>({
                    data,
                    returnColumns,
                });
            },
            /**
             * Create many records in the table
             */
            createMany: (input) => {
                return q.createManyRecords<TReturnColumns>({
                    data: input.data,
                    // overrideValues: userIdValueExtracted,
                    returnColumns,
                });
            },
            /**
             * Get a record by the given identifiers
             */
            getById: async (input) =>
                q.getFirstRecord<TReturnColumns>({
                    columns: returnColumns,
                    identifiers: [
                        // user id identifier
                        ...userIdIdentifier(userIdField, input),
                        // default id filters identifier
                        ...defaultIdFiltersIdentifier(defaultIdFilters),
                        // id identifier
                        ...typedEntries(input.ids).map(([key, value]) => ({
                            field: key,
                            value,
                        })),
                    ],
                }),
            /**
             * Get many records by the given identifiers
             */
            getMany: (input) =>
                q.getManyRecords<TReturnColumns>({
                    identifiers: [
                        // user id identifier
                        ...userIdIdentifier(userIdField, input),
                        // default id filters identifier
                        ...defaultIdFiltersIdentifier(defaultIdFilters),
                    ],
                    columns: returnColumns,
                    filters: input.filters
                        ? queryConfig.getMany?.filters?.(input.filters, withTableFilters<T>(table))
                        : undefined,
                    orderBy: queryConfig.getMany?.orderBy,
                    pagination: input.pagination,
                }),
            /**
             * Update a record by the given identifiers
             */
            updateById: (input) =>
                q.updateRecord<TReturnColumns>({
                    data: input.data,
                    identifiers: [
                        // user id identifier
                        ...userIdIdentifier(userIdField, input),
                        // default id filters identifier
                        ...defaultIdFiltersIdentifier(defaultIdFilters),
                        // id identifier
                        ...typedEntries(input.ids).map(([key, value]) => ({
                            field: key,
                            value,
                        })),
                    ],
                    returnColumns,
                }),
            /**
             * Remove a record by the given identifiers
             */
            removeById: (input) =>
                q.removeRecord({
                    returnColumns,
                    softDelete,
                    identifiers: [
                        // user id identifier
                        ...userIdIdentifier(userIdField, input),
                        // default id filters identifier
                        ...defaultIdFiltersIdentifier(defaultIdFilters),
                        // id identifier
                        ...typedEntries(input.ids).map(([key, value]) => ({
                            field: key,
                            value,
                        })),
                    ],
                }),
        };

        return new FeatureQueryBuilder<
            TSchemas,
            TCoreQueries<
                TSchemas,
                T,
                TIdFields,
                TUserIdField,
                TReturnColumns,
                TAllowedUpsertColumns
            >
        >({
            schemas: this.schemas,
            queries: queries,
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
        return new FeatureQueryBuilder<TSchemas>({
            schemas: this.schemas,
            queries: {},
        }).addQuery(key, config);
    }
}

/**
 * Factory singleton for building feature-level database queries.
 *
 * This factory provides a fluent interface for:
 * 1. Registering feature schemas for type inference
 * 2. Registering core CRUD queries (create, getById, getMany, updateById, removeById)
 * 3. Adding custom queries specific to your feature
 *
 * @example
 * ```typescript
 * export const tagQueries = featureQueryFactory
 *   .registerSchema(tagSchemas)
 *   .registerCoreQueries(tagTable, {
 *     userIdField: 'userId',
 *     idFields: ['id'],
 *     allowedUpsertColumns: ['name', 'color']
 *   });
 * ```
 */
export const featureQueryFactory = new FeatureQueryFactory({
    schemas: {},
});
