/**
 * FeatureQueryBuilder - Modern, progressive query builder for feature-based architecture.
 *
 * This builder provides a fluent, type-safe interface for constructing database queries.
 * It supports both standard CRUD operations and custom queries with full TypeScript inference.
 */

import type { InferQuerySchemas, TOperationSchemaObject, TZodShape } from '@/lib/schemas/types';
import {
    StandardQueryBuilder,
    type TStandardNewQueryConfig,
} from '@/server/lib/db/query/builder/feature-query/standard';

import type { QueryFn } from '@/server/lib/db/query/builder/feature-query/types';
import { dbQueryFnHandler } from '@/server/lib/db/query/handler';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { Table } from 'drizzle-orm';

export class FeatureQueryBuilder<
    const Q extends Record<string, QueryFn>,
    const S extends Record<string, TOperationSchemaObject>,
    const TTable extends Table,
    const TBase extends TZodShape,
    const TIdSchema extends TZodShape,
    const TUserIdSchema extends TZodShape,
    const TInsertDataSchema extends TZodShape,
    const TUpdateDataSchema extends TZodShape,
    const TSelectReturnSchema extends TZodShape,
    const TTableConfig extends FeatureTableConfig<
        TTable,
        TIdSchema,
        TUserIdSchema,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema
    > = FeatureTableConfig<
        TTable,
        TIdSchema,
        TUserIdSchema,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema
    >,
> {
    /** Collection of registered query functions */
    queries: Q;

    /** Operation schemas for input/output type inference */
    schemas: S;

    tableConfig: TTableConfig;

    /** Drizzle table definition */
    table: TTable;

    /** Shared table operations builder for all queries */
    tableOperations: TableOperationsBuilder<TTable>;

    /** Name for the feature query builder (derived from table name or explicit config, useful for debugging and logging) */
    name: string;

    /**
     * Creates a new FeatureQueryBuilder instance.
     *
     * Typically called via factory function or chained from another builder method.
     *
     * @param queries - Initial query functions (usually empty {})
     * @param schemas - Initial schemas (usually empty {})
     * @param table - Drizzle table definition
     * @param name - Name for debugging/logging (derived from table name or explicit config)
     */
    constructor({
        queries,
        schemas,
        config,
        name,
    }: {
        queries: Q;
        schemas: S;
        config: TTableConfig;
        name: string;
    }) {
        this.queries = queries;
        this.schemas = schemas;
        this.tableConfig = config;
        this.table = config.table;
        this.name = name;
        // Create shared TableOperationsBuilder instance for all queries
        this.tableOperations = new TableOperationsBuilder(config.table);
    }

    /**
     * Register operation schemas for type inference.
     *
     * Schemas define the input/output structure for operations, enabling
     * TypeScript to infer query types automatically.
     *
     * @template TLocalSchemas - Record of schemas to register
     * @param schemas - Operation schemas (e.g., from feature/schemas.ts)
     * @returns New FeatureQueryBuilder with merged schemas
     *
     * @example
     * ```typescript
     * builder.registerSchema(userSchemas)
     * // userSchemas = { getById: {...}, create: {...}, ... }
     * ```
     */
    registerSchema<const TLocalSchemas extends Record<string, TOperationSchemaObject>>(
        schemas: TLocalSchemas
    ) {
        return new FeatureQueryBuilder<
            Q,
            S & TLocalSchemas,
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig
        >({
            queries: this.queries,
            schemas: { ...this.schemas, ...schemas },
            config: this.tableConfig,
            name: this.name,
        });
    }

    /**
     * Add a custom query function.
     *
     * For queries that don't fit standard CRUD patterns. The query function is
     * wrapped with error handling via dbQueryFnHandler.
     *
     * @template K - Query key (must match a schema key or be unique)
     * @template I - Input type (inferred from schema if exists)
     * @template O - Output type
     *
     * @param key - Unique query identifier
     * @param config - Query configuration object or function receiving tableOps
     * @returns New FeatureQueryBuilder with the added query
     *
     * @example
     * ```typescript
     * // Simple config
     * .addQuery('findByEmail', {
     *   fn: async (input) => { ... },
     *   operation: 'find user by email'
     * })
     *
     * // With tableOps access
     * .addQuery('archive', ({ tableOps }) => ({
     *   fn: async (input) => {
     *     return await tableOps.updateRecord({ ... });
     *   }
     * }))
     * ```
     */
    addQuery<
        const K extends Exclude<keyof S & string, keyof Q> | (string & {}),
        I = InferQuerySchemas<S>[K],
        O = unknown,
    >(
        key: K,
        config:
            | {
                  fn: QueryFn<I, O>;
                  operation?: string;
              }
            | (({
                  tableOps,
                  tableConfig,
              }: {
                  tableOps: TableOperationsBuilder<TTable>;
                  tableConfig: TTableConfig;
              }) => {
                  fn: QueryFn<I, O>;
                  operation?: string;
              })
    ) {
        // Extract fn and operation from config (handle both object and function)
        const { fn, operation } =
            typeof config === 'function'
                ? config({ tableOps: this.tableOperations, tableConfig: this.tableConfig })
                : config;

        // Wrap the query with error handling (custom queries need this layer)
        const wrappedQueryFn = dbQueryFnHandler({
            queryFn: fn,
            operation: operation || `${String(key)} operation`,
        });

        // Return a new builder with the wrapped query added
        return new FeatureQueryBuilder<
            Q & Record<K, QueryFn<I, O>>,
            S,
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig
        >({
            queries: { ...this.queries, [key]: wrappedQueryFn },
            schemas: this.schemas,
            config: this.tableConfig,
            name: this.name,
        });
    }

    /**
     * Pick a subset of queries from the builder.
     *
     * Useful for creating focused query objects with only the methods you need.
     * Maintains full type safety for the selected queries.
     *
     * @template K - Keys of queries to pick
     * @param keys - Array of query keys to include
     * @returns New FeatureQueryBuilder with only the selected queries
     *
     * @example
     * ```typescript
     * const queries = builder.pick(['getById', 'create'])
     * // queries.queries will only have getById and create methods
     * ```
     */
    pick<const K extends keyof Q>(keys: K[]) {
        // Build new queries object with only selected keys
        const queries = {} as Pick<Q, K>;
        for (const key of keys) {
            queries[key] = this.queries[key];
        }

        return new FeatureQueryBuilder<
            Pick<Q, K>,
            S,
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig
        >({
            queries: queries,
            schemas: this.schemas,
            config: this.tableConfig,
            name: this.name,
        });
    }

    withStandard<TStandardQueries extends Record<string, QueryFn>>(
        standard: (
            b: StandardQueryBuilder<
                TTable,
                TBase,
                TIdSchema,
                TUserIdSchema,
                TInsertDataSchema,
                TUpdateDataSchema,
                TSelectReturnSchema
            >
        ) => StandardQueryBuilder<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig,
            TStandardQueries
        >
    ) {
        const builder = standard(StandardQueryBuilder.create(this.tableConfig));
        const standardQueries = builder.done();

        return new FeatureQueryBuilder<
            Q & TStandardQueries,
            S,
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig
        >({
            queries: { ...this.queries, ...standardQueries },
            schemas: this.schemas,
            config: this.tableConfig,
            name: this.name,
        });
    }

    registerAllStandard(config: TStandardNewQueryConfig<TTable> = {}) {
        const builder = StandardQueryBuilder.create<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema
        >(this.tableConfig, config);

        const standardQueries = builder.all().done();

        return new FeatureQueryBuilder<
            Q & typeof standardQueries,
            S,
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig
        >({
            queries: { ...this.queries, ...standardQueries },
            schemas: this.schemas,
            config: this.tableConfig,
            name: this.name,
        });
    }
}
