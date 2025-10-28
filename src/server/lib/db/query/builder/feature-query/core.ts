/**
 * FeatureQueryBuilder - Modern, progressive query builder for feature-based architecture.
 *
 * This builder provides a fluent, type-safe interface for constructing database queries.
 * It supports both standard CRUD operations and custom queries with full TypeScript inference.
 *
 * Key improvements over the legacy approach:
 * - Progressive query registration (add one at a time)
 * - Simpler type inference (no complex nested generics)
 * - Separate builders for standard vs custom queries
 * - Method chaining with clear state transitions
 * - Single error handling layer (no double wrapping)
 *
 * @template Q - Record of registered query functions
 * @template S - Record of operation schemas for type inference
 * @template TTable - Drizzle table type
 *
 * @see StandardQueryBuilder - For building standard CRUD queries
 * @see {@link /src/server/lib/db/query/builder/feature-query/README.md} - Full documentation
 *
 * @example
 * ```typescript
 * const queries = new FeatureQueryBuilder({ queries: {}, schemas: {}, table: userTable })
 *   .registerSchema(userSchemas)
 *   .standardQueries({
 *     idColumns: ['id'],
 *     userIdColumn: 'userId'
 *   })
 *     .create({ allowedColumns: ['name', 'email'], returnColumns: ['id', 'name'] })
 *     .getById({ returnColumns: ['id', 'name', 'email'] })
 *     .done()
 *   .addQuery('customQuery', ({ tableOps }) => ({
 *     fn: async (input) => { ... }
 *   }));
 * ```
 */

import type { InferQuerySchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { StandardQueryBuilder } from '@/server/lib/db/query/builder/feature-query/standard/builder';
import { TStandardQueryConfig } from '@/server/lib/db/query/builder/feature-query/standard/types';
import type { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import { dbQueryFnHandler } from '@/server/lib/db/query/handler';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations';
import { Table } from 'drizzle-orm';

export class FeatureQueryBuilder<
    const Q extends Record<string, QueryFn>,
    const S extends Record<string, TOperationSchemaObject>,
    const TTable extends Table,
> {
    /** Collection of registered query functions */
    queries: Q;

    /** Operation schemas for input/output type inference */
    schemas: S;

    /** Drizzle table definition */
    table: TTable;

    /** Shared table operations builder for all queries */
    tableOperations: TableOperationsBuilder<TTable>;

    /**
     * Creates a new FeatureQueryBuilder instance.
     *
     * Typically called via factory function or chained from another builder method.
     *
     * @param queries - Initial query functions (usually empty {})
     * @param schemas - Initial schemas (usually empty {})
     * @param table - Drizzle table definition
     */
    constructor({ queries, schemas, table }: { queries: Q; schemas: S; table: TTable }) {
        this.queries = queries;
        this.schemas = schemas;
        this.table = table;
        // Create shared TableOperationsBuilder instance for all queries
        this.tableOperations = new TableOperationsBuilder(table);
    }

    /**
     * Register or switch to a different table.
     *
     * Creates a new builder instance with the specified table while preserving
     * queries and schemas. Useful when building queries for related tables.
     *
     * @template TLocalTable - Type of the new table
     * @param table - Drizzle table definition
     * @returns New FeatureQueryBuilder with the new table type
     *
     * @example
     * ```typescript
     * builder.registerTable(userTable)
     * ```
     */
    registerTable<const TLocalTable extends Table>(table: TLocalTable) {
        return new FeatureQueryBuilder<Q, S, TLocalTable>({
            queries: this.queries,
            schemas: this.schemas,
            table: table,
        });
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
        return new FeatureQueryBuilder<Q, S & TLocalSchemas, TTable>({
            queries: this.queries,
            schemas: { ...this.schemas, ...schemas },
            table: this.table,
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
            | (({ tableOps }: { tableOps: TableOperationsBuilder<TTable> }) => {
                  fn: QueryFn<I, O>;
                  operation?: string;
              })
    ) {
        // Extract fn and operation from config (handle both object and function)
        const { fn, operation } =
            typeof config === 'function' ? config({ tableOps: this.tableOperations }) : config;

        // Wrap the query with error handling (custom queries need this layer)
        const wrappedQueryFn = dbQueryFnHandler({
            queryFn: fn,
            operation: operation || `${String(key)} operation`,
        });

        // Return a new builder with the wrapped query added
        return new FeatureQueryBuilder<Q & Record<K, QueryFn<I, O>>, S, TTable>({
            queries: { ...this.queries, [key]: wrappedQueryFn },
            schemas: this.schemas,
            table: this.table,
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

        return new FeatureQueryBuilder<Pick<Q, K>, S, TTable>({
            queries: queries,
            schemas: this.schemas,
            table: this.table,
        });
    }

    /**
     * Start building standard CRUD queries.
     *
     * Transitions to StandardQueryBuilder for progressive registration of
     * standard operations (create, getById, getMany, updateById, removeById).
     *
     * Call individual methods on the returned builder, then call `.done()` to
     * return to the main FeatureQueryBuilder.
     *
     * @template Config - Configuration type for standard queries
     * @param config - Standard query configuration
     * @returns StandardQueryBuilder for method chaining
     *
     * @example
     * ```typescript
     * builder
     *   .standardQueries({
     *     idColumns: ['id'],
     *     userIdColumn: 'userId',
     *     defaultIdFilters: { isActive: true }
     *   })
     *     .create({ allowedColumns: ['name'], returnColumns: ['id', 'name'] })
     *     .getById({ returnColumns: ['id', 'name', 'email'] })
     *     .done() // Returns to FeatureQueryBuilder
     *   .addQuery('customQuery', ...)
     * ```
     */
    standardQueries<Config extends TStandardQueryConfig<TTable>>(config: Config) {
        return new StandardQueryBuilder<TTable, Config, Q, S>(
            this.table,
            this.queries,
            this.schemas,
            config,
            this.tableOperations
        );
    }
}
