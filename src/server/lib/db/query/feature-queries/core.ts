import { InferQuerySchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import type { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import { dbQueryFnHandler } from '@/server/lib/db/query/handler';

/**
 * FeatureQueryBuilder - Feature-level query orchestration builder.
 *
 * This class wraps TableQueryBuilder with feature-specific logic such as:
 * - User authentication (userId extraction and filtering)
 * - Feature-specific filters (search, status, etc.)
 * - Pagination and ordering
 * - Schema-based type inference
 *
 * Use this for:
 * - Standard feature CRUD operations
 * - Adding custom queries to features
 * - Type-safe query composition
 *
 * @template TSchemas - Record of operation schemas for type inference
 * @template TQueryObject - Record of registered query functions
 *
 * @example
 * ```typescript
 * const queries = new FeatureQueryBuilder({ schemas: tagSchemas, queries: {} })
 *   .addQuery('getByName', {
 *     operation: 'get tag by name',
 *     fn: async ({ name, userId }) => {
 *       return await db.query.tag.findFirst({
 *         where: and(eq(tag.name, name), eq(tag.userId, userId))
 *       });
 *     }
 *   });
 * ```
 */
export class FeatureQueryBuilder<
    const TSchemas extends Record<string, TOperationSchemaObject> = Record<
        string,
        TOperationSchemaObject
    >,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    TQueryObject extends Record<string, QueryFn> = {},
> {
    schemas: TSchemas;
    queries: TQueryObject;

    constructor({ schemas, queries }: { schemas: TSchemas; queries: TQueryObject }) {
        this.schemas = schemas;
        this.queries = queries;
    }

    private _addQuery<
        const K extends string,
        TOutput,
        TInput = K extends keyof InferQuerySchemas<TSchemas>
            ? InferQuerySchemas<TSchemas>[K]
            : never,
    >(key: K, config: { fn: QueryFn<TInput, TOutput>; operation?: string }) {
        const { fn, operation } = config;

        // Wrap the query with the queryFnHandler
        const wrappedQuery = dbQueryFnHandler({
            queryFn: fn,
            operation: operation || `${String(key)} operation`,
            // table: this.table,
        });

        // Return a new FeatureQueryBuilder with the wrapped query
        return new FeatureQueryBuilder<
            // TTable,
            TSchemas,
            TQueryObject & Record<K, QueryFn<TInput, TOutput>>
        >({
            // table: this.table,
            schemas: this.schemas,
            queries: {
                ...this.queries,
                [key]: wrappedQuery,
            },
        });
    }

    /**
     * Add a query to the FeatureQueryBuilder
     * @param key - The key of the query must be a key of the schemas and not already in the queries
     * @param query - The query function
     * @returns A new FeatureQueryBuilder with the added query
     */
    addQuery<
        const K extends Exclude<keyof TSchemas & string, keyof TQueryObject>,
        TOutput,
        TInput = K extends keyof InferQuerySchemas<TSchemas>
            ? InferQuerySchemas<TSchemas>[K]
            : never,
    >(key: K, config: { fn: QueryFn<TInput, TOutput>; operation?: string }) {
        return this._addQuery(key, config);
    }

    /**
     * Remove a query from the FeatureQueryBuilder
     * @param key - The key of the query to remove
     * @returns A new FeatureQueryBuilder with the removed query
     */
    removeQuery<const K extends keyof TQueryObject & string>(key: K) {
        return new FeatureQueryBuilder<TSchemas, Omit<TQueryObject, K>>({
            schemas: this.schemas,
            queries: {
                ...this.queries,
                [key]: undefined,
            },
        });
    }

    /**
     * Overwrite a query in the FeatureQueryBuilder
     * @param key - The key of the query to override
     * @param config - The config of the query
     * @returns A new FeatureQueryBuilder with the overridden query
     */
    overwriteQuery<
        const K extends keyof TQueryObject & string,
        TOutput,
        TInput = K extends keyof InferQuerySchemas<TSchemas>
            ? InferQuerySchemas<TSchemas>[K]
            : never,
    >(
        key: K,
        config: { fn: QueryFn<TInput, TOutput>; operation?: string }
    ): FeatureQueryBuilder<TSchemas, Omit<TQueryObject, K> & Record<K, QueryFn<TInput, TOutput>>> {
        return this._addQuery<K, TOutput, TInput>(key, config);
    }
}
