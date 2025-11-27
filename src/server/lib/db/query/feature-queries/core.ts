/**
 * FeatureQueryBuilder - Modern, progressive query builder for feature-based architecture.
 *
 * This builder provides a fluent, type-safe interface for constructing database queries.
 * It supports both standard CRUD operations and custom queries with full TypeScript inference.
 */

import type { InferSchemaByLayerAndOperation, TFeatureSchemas } from '@/lib/schema/types';
import {
    StandardQueryBuilder,
    type TStandardNewQueryConfig,
} from '@/server/lib/db/query/feature-queries/standard';

import type { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import { dbQueryFnHandler } from '@/server/lib/db/query/handler';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
import { AppErrors } from '@/server/lib/error';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';

export class FeatureQueryBuilder<
    const Q extends Record<string, never>,
    const S extends TFeatureSchemas,
    const TTable extends Table,
    const TConfig extends TFeatureTableConfig<TTable>,
    const TTableConfig extends FeatureTableConfig<TTable, TConfig> = FeatureTableConfig<
        TTable,
        TConfig
    >,
> {
    /** Collection of registered query functions */
    queries: Q;

    /** Operation schemas for input/output type inference */
    schemas: S;

    /** Table configuration */
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
        const table = config.getTable();

        this.queries = queries;
        this.schemas = schemas;
        this.tableConfig = config;
        this.table = table;
        this.name = name;
        // Create shared TableOperationsBuilder instance for all queries
        this.tableOperations = new TableOperationsBuilder(table);
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
    registerSchema<const TLocalSchemas extends TFeatureSchemas>(schemas: TLocalSchemas) {
        return new FeatureQueryBuilder<Q, S & TLocalSchemas, TTable, TConfig, TTableConfig>({
            queries: this.queries,
            schemas: { ...this.schemas, ...schemas },
            config: this.tableConfig,
            name: this.name,
        });
    }

    /**
     * Add a custom query function for operations that don't fit standard CRUD patterns.
     *
     * This method enables you to extend a feature's query API with domain-specific or complex queries that
     * exceed the capabilities of standard CRUD (create, read, update, delete) builders. Use this to add
     * queries such as batch operations, specialized lookups, business-logic-laden selections, or actions
     * involving joins and subqueries.
     *
     * If a schema is registered for the query, the input will be strongly typed via the schema and output will be inferred from the schema.
     * Note: The keys of the schema must match the key of the query.
     *
     * The provided config can either be a simple object ({ fn, operation }), or a function that receives
     * useful helpers including:
     *   - `tableOps`: TableOperationsBuilder instance for the table (create, update, bulk ops, etc)
     *   - `tableConfig`: Table configuration (for access to custom config, columns, etc)
     *   - `schemas`: Schemas registered for this feature (for validation, typing, etc)
     *   - `error`: AppErrors for throwing consistent application-layer errors
     *
     * The query function you register is wrapped with error handling and operation tracking for type safety.
     *
     * @param key - Unique query identifier (string, cannot clash with existing queries)
     * @param config -
     *    1) Simple: { fn: QueryFn, operation?: string }
     *    2) Factory: ({ tableOps, tableConfig, schemas, error }) => { fn: QueryFn, operation?: string }
     *
     * @returns A new FeatureQueryBuilder with the query registered; chainable.
     *
     * @example
     * Basic query with inline function:
     * ```typescript
     * .addQuery('findByStatus', {
     *   fn: async (input: { status: string }) => {
     *     // Custom fetch logic
     *     return await db.query.table.findMany({ where: { status: input.status } });
     *   },
     *   operation: 'find by status',
     * })
     * ```
     *
     * @example
     * Advanced: using helpers:
     * ```typescript
     * service.addQuery('bulkArchive', ({ tableOps, tableConfig, error }) => ({
     *   fn: async (input: { ids: string[], userId: string }) => {
     *     // Throws if ids empty
     *     if (!input.ids.length) throw error.validation('NO_IDS');
     *     // Use TableOperationsBuilder for safe updates
     *     return await tableOps.updateRecords({
     *       where: { id: { in: input.ids }, userId: input.userId },
     *       data: { archived: true }
     *     });
     *   },
     *   operation: 'archive multiple records',
     * }))
     * ```
     *
     * @example
     * With schemas and inference:
     * ```typescript
     * .registerSchema({
     *   getActive: {
     *     input: z.object({ userId: z.string() }),
     *     output: z.array(tableSchema),
     *   }
     * })
     * .addQuery('getActive', ({ tableOps, schemas }) => ({
     *   fn: async (input) => {
     *     // input is strongly typed via registered schema
     *     schemas.getActive.input.parse(input);
     *     return tableOps.findMany({ where: { userId: input.userId, isActive: true } });
     *   }
     * }))
     * ```
     */
    addQuery<
        const K extends Exclude<keyof S & string, keyof Q> | (string & {}),
        I = InferSchemaByLayerAndOperation<S, 'query', K>,
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
                  schemas,
                  error,
              }: {
                  tableOps: TableOperationsBuilder<TTable>;
                  tableConfig: TTableConfig;
                  schemas: S;
                  /** Direct access to AppErrors factory */
                  error: typeof AppErrors;
              }) => {
                  fn: QueryFn<I, O>;
                  operation?: string;
              })
    ) {
        // Extract fn and operation from config (handle both object and function)
        const { fn, operation } =
            typeof config === 'function'
                ? config({
                      tableOps: this.tableOperations,
                      tableConfig: this.tableConfig,
                      schemas: this.schemas,
                      error: AppErrors,
                  })
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
            TConfig,
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

        return new FeatureQueryBuilder<Pick<Q, K>, S, TTable, TConfig, TTableConfig>({
            queries: queries,
            schemas: this.schemas,
            config: this.tableConfig,
            name: this.name,
        });
    }

    /**
     * Add standard queries to the builder.
     *
     * @template TStandardQueries - Record of standard queries to add
     * @param standard - Standard query builder function
     * @returns New FeatureQueryBuilder with the standard queries added
     *
     * @example
     * ```typescript
     * const queries = builder.withStandard((b) => b.create().getById());
     * // queries.queries will have create, getById operations
     * ```
     */

    withStandard<TBuilder extends StandardQueryBuilder<TTable, TConfig>>(
        standard: (b: ReturnType<typeof StandardQueryBuilder.create<TTable, TConfig>>) => TBuilder
    ) {
        const builder = StandardQueryBuilder.create<TTable, TConfig>(this.tableConfig);
        const standardBuilder = standard(builder);
        const standardQueries = standardBuilder.done();

        return new FeatureQueryBuilder<Q & TBuilder['queries'], S, TTable, TConfig, TTableConfig>({
            queries: { ...this.queries, ...standardQueries },
            schemas: this.schemas,
            config: this.tableConfig,
            name: this.name,
        });
    }

    /**
     * Register all standard queries to the builder.
     *
     * @param config - Standard query configuration
     * @returns New FeatureQueryBuilder with the standard queries added
     *
     * @example
     * ```typescript
     * const queries = builder.registerAllStandard();
     * // queries.queries will have create, getById, getMany, updateById, removeById operations
     * ```
     */
    registerAllStandard(config: TStandardNewQueryConfig<TTable, TConfig> = {}) {
        const builder = StandardQueryBuilder.create<TTable, TConfig>(this.tableConfig, config);

        const standardQueries = builder.all().done();

        return new FeatureQueryBuilder<
            Q & typeof standardQueries,
            S,
            TTable,
            TConfig,
            TTableConfig
        >({
            queries: { ...this.queries, ...standardQueries },
            schemas: this.schemas,
            config: this.tableConfig,
            name: this.name,
        });
    }

    /**
     * Finalizes the builder and returns the accumulated queries object.
     */
    build(): Prettify<Q> {
        return this.queries;
    }
}
