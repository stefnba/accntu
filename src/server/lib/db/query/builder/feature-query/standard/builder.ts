/**
 * StandardQueryBuilder - Progressive builder for standard CRUD operations.
 *
 * This builder provides a fluent interface for adding standard database operations
 * one at a time. Each method returns a new builder instance with the added query,
 * maintaining full type safety throughout the chain.
 *
 * Key features:
 * - Add only the CRUD operations you need (not all-or-nothing)
 * - Each operation configured individually with specific options
 * - Full TypeScript inference for inputs and outputs
 * - No double error handling (tableOps handles errors, no dbQueryFnHandler wrapper)
 * - Call `.done()` to return to the main FeatureQueryBuilder
 *
 * @template TTable - Drizzle table type
 * @template Config - Standard query configuration (idColumns, userIdColumn, etc.)
 * @template BaseQueries - Queries from the parent FeatureQueryBuilder
 * @template BaseSchemas - Schemas from the parent FeatureQueryBuilder
 * @template StandardQueries - Accumulated standard queries (grows as queries are added)
 *
 * @example
 * ```typescript
 * featureBuilder
 *   .standardQueries({ idColumns: ['id'], userIdColumn: 'userId' })
 *     .create({ allowedColumns: ['name'], returnColumns: ['id', 'name'] })
 *     .getById({ returnColumns: ['id', 'name', 'email'] })
 *     .done() // Returns to FeatureQueryBuilder
 * ```
 */

import { TOperationSchemaObject } from '@/lib/schemas/types';
import { typedEntries } from '@/lib/utils';
import { FeatureQueryBuilder } from '@/server/lib/db/query/builder/feature-query/core';
import {
    TCreateQueryOptions,
    TGetByIdQueryOptions,
    TStandardQueryConfig,
} from '@/server/lib/db/query/builder/feature-query/standard/types';
import {
    defaultIdFiltersIdentifier,
    userIdIdentifier,
} from '@/server/lib/db/query/feature-queries/helpers';
import { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import { TableOperationsBuilder, TBooleanFilter } from '@/server/lib/db/query/table-operations';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';

export class StandardQueryBuilder<
    TTable extends Table,
    Config extends TStandardQueryConfig<TTable>,
    BaseQueries extends Record<string, QueryFn>,
    BaseSchemas extends Record<string, TOperationSchemaObject>,
    StandardQueries extends Record<string, QueryFn> = Record<string, never>,
> {
    /** Accumulated standard queries (grows as queries are added) */
    private standardQueries: StandardQueries;

    /** Shared table operations builder (reused from parent FeatureQueryBuilder) */
    private tableOps: TableOperationsBuilder<TTable>;

    /**
     * Creates a new StandardQueryBuilder instance.
     *
     * Typically called via FeatureQueryBuilder.standardQueries(), not directly.
     *
     * @param table - Drizzle table definition
     * @param baseQueries - Existing queries from parent builder
     * @param baseSchemas - Existing schemas from parent builder
     * @param config - Standard query configuration
     * @param tableOps - Shared TableOperationsBuilder instance
     * @param standardQueries - Previously added standard queries (for chaining)
     */
    constructor(
        private table: TTable,
        private baseQueries: BaseQueries,
        private baseSchemas: BaseSchemas,
        private config: Config,
        tableOps: TableOperationsBuilder<TTable>,
        standardQueries?: StandardQueries
    ) {
        this.tableOps = tableOps;
        this.standardQueries = standardQueries ?? ({} as StandardQueries);
    }

    /**
     * Add a create query for inserting new records.
     *
     * Builds a type-safe query that:
     * - Only allows specified columns (security whitelist)
     * - Automatically merges userId if configured
     * - Returns only specified columns
     * - Handles conflicts (ignore/update/fail)
     *
     * @template TAllowedColumns - Columns that can be inserted
     * @template TReturnColumns - Columns to return after creation
     *
     * @param options - Create query configuration
     * @param options.allowedColumns - Whitelist of columns that can be inserted
     * @param options.returnColumns - Columns to return in result
     * @param options.onConflict - How to handle duplicate key conflicts
     *
     * @returns New StandardQueryBuilder with create query added
     *
     * @example
     * ```typescript
     * .create({
     *   allowedColumns: ['name', 'email'],
     *   returnColumns: ['id', 'name', 'createdAt'],
     *   onConflict: 'ignore'
     * })
     * ```
     */
    create<
        TAllowedColumns extends ReadonlyArray<keyof TTable['$inferInsert']>,
        TReturnColumns extends Array<keyof TTable['_']['columns']>,
    >(
        options: TCreateQueryOptions<TTable> & {
            allowedColumns: TAllowedColumns;
            returnColumns: TReturnColumns;
        }
    ) {
        const { returnColumns, onConflict } = options;
        const userIdColumn = this.config.userIdColumn;

        // Input type: data with allowed columns + userId if userIdColumn is configured
        // Prettify wraps the type for nice IntelliSense display
        type CreateInput = Prettify<
            {
                data: Prettify<Pick<TTable['$inferInsert'], TAllowedColumns[number]>>;
            } & (Config['userIdColumn'] extends keyof TTable['_']['columns']
                ? { userId: TTable['_']['columns'][Config['userIdColumn']]['_']['data'] }
                : object)
        >;

        // Output type: matches what createRecord returns (Prettified for IntelliSense)
        type CreateOutput = Prettify<{
            [K in TReturnColumns[number]]: TTable['_']['columns'][K]['_']['data'];
        }>;

        // Query function implementation
        const createQuery: QueryFn<CreateInput, CreateOutput> = async (
            input: CreateInput
        ): Promise<CreateOutput> => {
            // Merge userId into data if userIdColumn is configured
            const data =
                userIdColumn && 'userId' in input
                    ? { ...input.data, [userIdColumn]: input.userId }
                    : input.data;

            // Call tableOps (already has error handling, no need for dbQueryFnHandler wrapper)
            return await this.tableOps.createRecord({
                data,
                returnColumns,
                onConflict,
            });
        };

        // Return new builder with updated query type
        const newStandardQueries = {
            ...this.standardQueries,
            create: createQuery,
        };

        return new StandardQueryBuilder<
            TTable,
            Config,
            BaseQueries,
            BaseSchemas,
            StandardQueries & { create: QueryFn<CreateInput, CreateOutput> }
        >(
            this.table,
            this.baseQueries,
            this.baseSchemas,
            this.config,
            this.tableOps,
            newStandardQueries
        );
    }

    /**
     * Add a getById query for fetching a single record.
     *
     * Builds a type-safe query that:
     * - Uses ID columns from configuration
     * - Automatically includes userId filter if configured
     * - Applies default filters (e.g., isActive: true)
     * - Returns only specified columns
     * - Returns null if no record found
     *
     * @template TReturnColumns - Columns to return in result
     *
     * @param options - GetById query configuration
     * @param options.returnColumns - Columns to return in result
     *
     * @returns New StandardQueryBuilder with getById query added
     *
     * @example
     * ```typescript
     * .getById({
     *   returnColumns: ['id', 'name', 'email']
     * })
     *
     * // Usage:
     * await queries.getById({
     *   ids: { id: '123' },
     *   userId: 'user-id'  // Required if userIdColumn configured
     * })
     * // Returns: { id, name, email } | null
     * ```
     */
    getById<TReturnColumns extends Array<keyof TTable['_']['columns']>>(
        options: TGetByIdQueryOptions<TTable> & {
            returnColumns: TReturnColumns;
        }
    ) {
        const { returnColumns } = options;
        const userIdColumn = this.config.userIdColumn;
        const defaultIdFilters = this.config.defaultIdFilters;

        // Input type: ids object based on idColumns + optional userId
        // Not prettified to maintain type inference for identifiers
        type GetByIdInput = {
            ids: {
                [K in Config['idColumns'][number]]: TTable['_']['columns'][K]['_']['data'];
            };
        } & (Config['userIdColumn'] extends keyof TTable['_']['columns']
            ? { userId: TTable['_']['columns'][Config['userIdColumn']]['_']['data'] }
            : object);

        // Output type: can be null if record not found (Prettified for IntelliSense)
        type GetByIdOutput = Prettify<{
            [K in TReturnColumns[number]]: TTable['_']['columns'][K]['_']['data'];
        }> | null;

        // Query function implementation
        const getByIdQuery: QueryFn<GetByIdInput, GetByIdOutput> = async (
            input: GetByIdInput
        ): Promise<Prettify<GetByIdOutput>> => {
            // Build identifiers array from all sources
            const identifiers: Array<TBooleanFilter<TTable>> = [
                // 1. userId identifier (if configured)
                ...userIdIdentifier(userIdColumn, input),
                // 2. Default filters (e.g., isActive: true)
                ...defaultIdFiltersIdentifier(defaultIdFilters),
                // 3. ID fields from input (e.g., id: '123')
                ...typedEntries(input.ids).map(([key, value]) => ({
                    field: key,
                    value,
                })),
            ];

            // Call tableOps (already has error handling)
            return await this.tableOps.getFirstRecord({
                columns: returnColumns,
                identifiers,
            });
        };

        // Return new builder with updated query type
        const newStandardQueries = {
            ...this.standardQueries,
            getById: getByIdQuery,
        };

        return new StandardQueryBuilder<
            TTable,
            Config,
            BaseQueries,
            BaseSchemas,
            StandardQueries & { getById: QueryFn<GetByIdInput, GetByIdOutput> }
        >(
            this.table,
            this.baseQueries,
            this.baseSchemas,
            this.config,
            this.tableOps,
            newStandardQueries
        );
    }

    /**
     * Complete standard query building and return to main FeatureQueryBuilder.
     *
     * Merges all standard queries with base queries and returns a new
     * FeatureQueryBuilder that can be used for custom queries or finalization.
     *
     * @returns FeatureQueryBuilder with all queries (base + standard)
     *
     * @example
     * ```typescript
     * builder
     *   .standardQueries({ ... })
     *     .create({ ... })
     *     .getById({ ... })
     *     .done() // Returns to FeatureQueryBuilder
     *   .addQuery('customQuery', { ... }) // Can now add custom queries
     * ```
     */
    done() {
        return new FeatureQueryBuilder<
            BaseQueries & typeof this.standardQueries,
            BaseSchemas,
            TTable
        >({
            // Merge base queries with accumulated standard queries
            queries: { ...this.baseQueries, ...this.standardQueries },
            schemas: this.baseSchemas,
            table: this.table,
        });
    }
}
