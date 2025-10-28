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
    ResolveDefaultAllowedColumns,
    ResolveDefaultReturnColumns,
    TCreateQueryOptions,
    TGetByIdQueryOptions,
    TStandardQueryConfig,
    TUpdateByIdQueryOptions,
} from '@/server/lib/db/query/builder/feature-query/standard/types';
import {
    defaultIdFiltersIdentifier,
    userIdIdentifier,
} from '@/server/lib/db/query/feature-queries/helpers';
import { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import {
    InferTableColumnTypes,
    TableOperationsBuilder,
    TBooleanFilter,
} from '@/server/lib/db/query/table-operations';
import {
    GetTableColumnKeys,
    GetTableInsertKeys,
    InferTableColumnType,
} from '@/server/lib/db/query/table-operations/types';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';

export class StandardQueryBuilder<
    TTable extends Table,
    Config extends TStandardQueryConfig<TTable, boolean>,
    BaseQueries extends Record<string, QueryFn>,
    BaseSchemas extends Record<string, TOperationSchemaObject>,
    StandardQueries extends Record<string, QueryFn> = Record<string, never>,
> {
    /** Drizzle table definition */
    private table: TTable;

    /** Queries from parent FeatureQueryBuilder */
    private baseQueries: BaseQueries;

    /** Schemas from parent FeatureQueryBuilder */
    private baseSchemas: BaseSchemas;

    /** Standard query configuration (idColumns, userIdColumn, etc.) */
    private config: Config;

    /** Name from parent builder (for debugging/logging) */
    private name: string;

    /** Accumulated standard queries (grows as queries are added) */
    private standardQueries: StandardQueries;

    /** Shared table operations builder (reused from parent FeatureQueryBuilder) */
    private tableOps: TableOperationsBuilder<TTable>;

    /**
     * Creates a new StandardQueryBuilder instance.
     *
     * Typically called via FeatureQueryBuilder.standardQueries(), not directly.
     *
     * @param options - Constructor options
     * @param options.table - Drizzle table definition
     * @param options.baseQueries - Existing queries from parent builder
     * @param options.baseSchemas - Existing schemas from parent builder
     * @param options.config - Standard query configuration
     * @param options.tableOps - Shared TableOperationsBuilder instance
     * @param options.name - Name from parent builder (for debugging/logging)
     * @param options.standardQueries - Previously added standard queries (for chaining)
     */
    constructor({
        table,
        baseQueries,
        baseSchemas,
        config,
        tableOps,
        name,
        standardQueries,
    }: {
        table: TTable;
        baseQueries: BaseQueries;
        baseSchemas: BaseSchemas;
        config: Config;
        tableOps: TableOperationsBuilder<TTable>;
        name: string;
        standardQueries?: StandardQueries;
    }) {
        this.table = table;
        this.baseQueries = baseQueries;
        this.baseSchemas = baseSchemas;
        this.config = config;
        this.tableOps = tableOps;
        this.name = name;
        this.standardQueries = standardQueries ?? ({} as StandardQueries);
    }

    /**
     * Resolves returnColumns from options or defaults.
     *
     * Helper method to get returnColumns with proper fallback logic:
     * 1. Use provided returnColumns from options
     * 2. Fall back to config.defaults.returnColumns
     * 3. Throw error if neither is available
     *
     * @param providedColumns - Columns explicitly provided in method options
     * @param methodName - Name of the method calling this helper (for error messages)
     * @returns Resolved array of column names
     * @throws Error if no returnColumns found in options or defaults
     */
    private resolveReturnColumns<TColumns extends Array<GetTableColumnKeys<TTable>>>(
        providedColumns: TColumns | undefined,
        methodName: string
    ): TColumns | NonNullable<Config['defaults']>['returnColumns'] {
        const returnColumns = providedColumns ?? this.config.defaults?.returnColumns;
        if (!returnColumns) {
            throw new Error(
                `${this.name}.${methodName}: returnColumns is required either in method options or config.defaults.returnColumns`
            );
        }
        return returnColumns;
    }

    /**
     * Resolves allowedColumns from options or defaults.
     *
     * Helper method to get allowedColumns with proper fallback logic:
     * 1. Use provided allowedColumns from options
     * 2. Fall back to config.defaults.allowedUpsertColumns
     * 3. Throw error if neither is available
     *
     * @param providedColumns - Columns explicitly provided in method options
     * @param methodName - Name of the method calling this helper (for error messages)
     * @returns Resolved array of column names
     * @throws Error if no allowedColumns found in options or defaults
     */
    private resolveAllowedColumns<TColumns extends ReadonlyArray<GetTableInsertKeys<TTable>>>(
        providedColumns: TColumns | undefined,
        methodName: string
    ): TColumns | NonNullable<Config['defaults']>['allowedUpsertColumns'] {
        const allowedColumns = providedColumns ?? this.config.defaults?.allowedUpsertColumns;
        if (!allowedColumns) {
            throw new Error(
                `${this.name}.${methodName}: allowedColumns is required either in method options or config.defaults.allowedUpsertColumns`
            );
        }
        return allowedColumns;
    }

    /**
     * Add a create query for inserting new records.
     *
     * Builds a type-safe query that:
     * - Only allows specified columns (security whitelist)
     * - Automatically merges userId if configured
     * - Returns only specified columns (uses defaults if not specified)
     * - Handles conflicts (ignore/update/fail)
     * - Applies default ID filters from config
     *
     * @template TAllowedColumns - Columns that can be inserted
     * @template TReturnColumns - Columns to return after creation
     *
     * @param options - Create query configuration
     * @param options.allowedColumns - Whitelist of columns that can be inserted (uses config.defaults.allowedUpsertColumns if not specified)
     * @param options.returnColumns - Columns to return in result (uses config.defaults.returnColumns if not specified)
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
     *
     * // Or use defaults from config
     * .create({
     *   onConflict: 'ignore'
     *   // allowedColumns and returnColumns will use config.defaults
     * })
     * ```
     */
    create<
        TAllowedColumns extends ReadonlyArray<
            GetTableInsertKeys<TTable>
        > = ResolveDefaultAllowedColumns<TTable, Config>,
        TReturnColumns extends Array<GetTableColumnKeys<TTable>> = ResolveDefaultReturnColumns<
            TTable,
            Config
        >,
    >(options?: TCreateQueryOptions<TTable, TAllowedColumns, TReturnColumns>) {
        // Validate that allowedColumns exist (type-level constraint enforced at compile time)
        // This ensures defaults are configured if not provided in options
        this.resolveAllowedColumns(options?.allowedColumns, 'create');

        // Resolve returnColumns with fallback to defaults
        const returnColumns = this.resolveReturnColumns(options?.returnColumns, 'create');

        const { onConflict } = options ?? {};
        const userIdColumn = this.config.userIdColumn;

        // Input type: data with allowed columns + userId if userIdColumn is configured
        // Prettify wraps the type for nice IntelliSense display
        type CreateInput = Prettify<
            {
                data: Prettify<Pick<TTable['$inferInsert'], TAllowedColumns[number]>>;
            } & (Config['userIdColumn'] extends GetTableColumnKeys<TTable>
                ? { userId: InferTableColumnType<TTable, Config['userIdColumn']> }
                : object)
        >;

        // Query function implementation
        const createQuery: QueryFn<
            CreateInput,
            Prettify<Pick<InferTableColumnTypes<TTable>, TReturnColumns[number]>>
        > = async (input: CreateInput) => {
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
            StandardQueries & {
                create: QueryFn<
                    CreateInput,
                    Prettify<Pick<InferTableColumnTypes<TTable>, TReturnColumns[number]>>
                >;
            }
        >({
            table: this.table,
            baseQueries: this.baseQueries,
            baseSchemas: this.baseSchemas,
            config: this.config,
            tableOps: this.tableOps,
            name: this.name,
            standardQueries: newStandardQueries,
        });
    }

    /**
     * Add a getById query for fetching a single record.
     *
     * Builds a type-safe query that:
     * - Uses ID columns from configuration
     * - Automatically includes userId filter if configured
     * - Applies default ID filters from config (e.g., isActive: true)
     * - Returns only specified columns (uses defaults if not specified)
     * - Returns null if no record found
     *
     * @template TReturnColumns - Columns to return in result
     *
     * @param options - GetById query configuration
     * @param options.returnColumns - Columns to return in result (uses config.defaults.returnColumns if not specified)
     *
     * @returns New StandardQueryBuilder with getById query added
     *
     * @example
     * ```typescript
     * .getById({
     *   returnColumns: ['id', 'name', 'email']
     * })
     *
     * // Or use defaults from config
     * .getById()
     * // Uses config.defaults.returnColumns
     *
     * // Usage:
     * await queries.getById({
     *   ids: { id: '123' },
     *   userId: 'user-id'  // Required if userIdColumn configured
     * })
     * // Returns: { id, name, email } | null
     * ```
     */
    getById<
        TReturnColumns extends Array<GetTableColumnKeys<TTable>> = ResolveDefaultReturnColumns<
            TTable,
            Config
        >,
    >(options?: TGetByIdQueryOptions<TTable, TReturnColumns>) {
        // Resolve returnColumns with fallback to defaults
        const returnColumns = this.resolveReturnColumns(options?.returnColumns, 'getById');

        const userIdColumn = this.config.userIdColumn;
        const defaultIdFilters = this.config.defaults?.idFilters;

        // Internal input type (unprettified for type inference)
        type GetByIdInputInternal = {
            ids: {
                [K in Config['idColumns'][number]]: InferTableColumnType<TTable, K>;
            };
        } & (Config['userIdColumn'] extends GetTableColumnKeys<TTable>
            ? { userId: InferTableColumnType<TTable, Config['userIdColumn']> }
            : object);

        // Prettified input type for QueryFn signature (better IntelliSense)
        type GetByIdInput = Prettify<GetByIdInputInternal>;

        // Query function implementation
        const getByIdQuery: QueryFn<
            GetByIdInput,
            Prettify<Pick<InferTableColumnTypes<TTable>, TReturnColumns[number]>> | null
        > = async (input: GetByIdInput) => {
            // Cast to internal type for proper type inference with typedEntries
            // This is safe because Prettify<T> is structurally identical to T
            const inputInternal = input as GetByIdInputInternal;

            // Build identifiers array from all sources
            const identifiers: Array<TBooleanFilter<TTable>> = [
                // 1. userId identifier (if configured)
                ...userIdIdentifier(userIdColumn, inputInternal),
                // 2. Default filters (e.g., isActive: true)
                ...defaultIdFiltersIdentifier(defaultIdFilters),
                // 3. ID fields from input (e.g., id: '123')
                ...typedEntries(inputInternal.ids).map(([key, value]) => ({
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
            StandardQueries & {
                getById: QueryFn<
                    Prettify<GetByIdInput>,
                    Prettify<Pick<InferTableColumnTypes<TTable>, TReturnColumns[number]>> | null
                >;
            }
        >({
            table: this.table,
            baseQueries: this.baseQueries,
            baseSchemas: this.baseSchemas,
            config: this.config,
            tableOps: this.tableOps,
            name: this.name,
            standardQueries: newStandardQueries,
        });
    }

    /**
     * Add an updateById query for updating a single record.
     *
     * Builds a type-safe query that:
     * - Uses ID columns from configuration to locate the record
     * - Restricts which columns can be updated (security whitelist)
     * - Automatically includes userId filter if configured
     * - Applies default ID filters from config (e.g., isActive: true)
     * - Returns updated record with specified columns
     * - Returns null if no record found
     *
     * @template TAllowedColumns - Columns allowed for update (security whitelist)
     * @template TReturnColumns - Columns to return in result
     *
     * @param options - UpdateById query configuration
     * @param options.allowedColumns - Columns allowed for update (uses config.defaults.allowedUpsertColumns if not specified)
     * @param options.returnColumns - Columns to return in result (uses config.defaults.returnColumns if not specified)
     *
     * @returns New StandardQueryBuilder with updateById query added
     *
     * @example
     * ```typescript
     * .updateById({
     *   allowedColumns: ['name', 'email'],
     *   returnColumns: ['id', 'name', 'email', 'updatedAt']
     * })
     *
     * // Or use defaults from config
     * .updateById()
     * // Uses config.defaults.allowedUpsertColumns & returnColumns
     *
     * // Usage:
     * await queries.updateById({
     *   ids: { id: '123' },
     *   data: { name: 'New Name', email: 'new@email.com' },
     *   userId: 'user-id'  // Required if userIdColumn configured
     * })
     * // Returns: { id, name, email, updatedAt } | null
     * ```
     */
    updateById<
        TAllowedColumns extends ReadonlyArray<
            GetTableInsertKeys<TTable>
        > = ResolveDefaultAllowedColumns<TTable, Config>,
        TReturnColumns extends Array<GetTableColumnKeys<TTable>> = ResolveDefaultReturnColumns<
            TTable,
            Config
        >,
    >(options?: TUpdateByIdQueryOptions<TTable, TAllowedColumns, TReturnColumns>) {
        // Resolve columns with fallback to defaults
        this.resolveAllowedColumns(options?.allowedColumns, 'updateById');
        const returnColumns = this.resolveReturnColumns(options?.returnColumns, 'updateById');

        const userIdColumn = this.config.userIdColumn;
        const defaultIdFilters = this.config.defaults?.idFilters;

        // Internal input type (unprettified for type inference)
        type UpdateByIdInputInternal = {
            ids: {
                [K in Config['idColumns'][number]]: InferTableColumnType<TTable, K>;
            };
            data: Prettify<Pick<TTable['$inferInsert'], TAllowedColumns[number]>>;
        } & (Config['userIdColumn'] extends GetTableColumnKeys<TTable>
            ? { userId: InferTableColumnType<TTable, Config['userIdColumn']> }
            : object);

        // Prettified input type for QueryFn signature (better IntelliSense)
        type UpdateByIdInput = Prettify<UpdateByIdInputInternal>;

        // Query function implementation
        const updateByIdQuery: QueryFn<
            UpdateByIdInput,
            Prettify<Pick<InferTableColumnTypes<TTable>, TReturnColumns[number]>> | null
        > = async (input: UpdateByIdInput) => {
            // Cast to internal type for proper type inference with typedEntries
            // This is safe because Prettify<T> is structurally identical to T
            const inputInternal = input as UpdateByIdInputInternal;

            // Build identifiers array from all sources
            const identifiers: Array<TBooleanFilter<TTable>> = [
                // 1. userId identifier (if configured)
                ...userIdIdentifier(userIdColumn, inputInternal),
                // 2. Default filters (e.g., isActive: true)
                ...defaultIdFiltersIdentifier(defaultIdFilters),
                // 3. ID fields from input (e.g., id: '123')
                ...typedEntries(inputInternal.ids).map(([key, value]) => ({
                    field: key,
                    value,
                })),
            ];

            // todo: validate input data against allowedColumns (only allow columns that are in the allowedColumns array)

            // Call tableOps (already has error handling)
            return await this.tableOps.updateRecord({
                returnColumns,
                identifiers,
                data: inputInternal.data,
            });
        };

        // Return new builder with updated query type
        const newStandardQueries = {
            ...this.standardQueries,
            updateById: updateByIdQuery,
        };

        return new StandardQueryBuilder<
            TTable,
            Config,
            BaseQueries,
            BaseSchemas,
            StandardQueries & {
                updateById: QueryFn<
                    UpdateByIdInput,
                    Prettify<Pick<InferTableColumnTypes<TTable>, TReturnColumns[number]>> | null
                >;
            }
        >({
            table: this.table,
            baseQueries: this.baseQueries,
            baseSchemas: this.baseSchemas,
            config: this.config,
            tableOps: this.tableOps,
            name: this.name,
            standardQueries: newStandardQueries,
        });
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
            name: this.name,
        });
    }
}
