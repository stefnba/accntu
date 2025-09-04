import { InferQuerySchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import type { QueryFn } from '@/server/lib/db/query/builder/types';
import { queryFnHandler } from '@/server/lib/db/query/handler';

export class QueryBuilder<
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

    /**
     * Add a query to the QueryBuilder
     * @param key - The key of the query must be a key of the schemas and not already in the queries
     * @param query - The query function
     * @returns A new QueryBuilder with the added query
     */
    addQuery<
        const K extends Exclude<keyof TSchemas & string, keyof TQueryObject>,
        TOutput,
        TInput = K extends keyof InferQuerySchemas<TSchemas>
            ? InferQuerySchemas<TSchemas>[K]
            : never,
    >(key: K, config: { fn: QueryFn<TInput, TOutput>; operation?: string }) {
        const { fn, operation } = config;

        // Wrap the query with the queryFnHandler
        const wrappedQuery = queryFnHandler({
            fn,
            operation: operation || `${String(key)} operation`,
            // table: this.table,
        });

        // Return a new QueryBuilder with the wrapped query
        return new QueryBuilder<
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
}
