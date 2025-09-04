import { InferQuerySchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import type { QueryFn } from '@/server/lib/db/query/builder/types';
import { queryFnHandler } from '@/server/lib/db/query/handler';
import { getTableName, Table } from 'drizzle-orm';

export class QueryBuilder<
    TTable extends Table = Table,
    const TSchemas extends Record<string, TOperationSchemaObject> = Record<
        string,
        TOperationSchemaObject
    >,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    TQueryObject extends Record<string, QueryFn> = {},
> {
    table: TTable;
    schemas: TSchemas;
    queries: TQueryObject;

    constructor({
        table,
        schemas,
        queries,
    }: {
        table: TTable;
        schemas: TSchemas;
        queries: TQueryObject;
    }) {
        this.schemas = schemas;
        this.table = table;
        this.queries = queries;
    }

    /**
     * Add a query to the QueryBuilder
     * @param key - The key of the query
     * @param query - The query function
     * @returns A new QueryBuilder with the added query
     */
    addQuery<
        const K extends keyof TSchemas & string,
        TOutput,
        TInput = K extends keyof InferQuerySchemas<TSchemas>
            ? InferQuerySchemas<TSchemas>[K]
            : never,
    >(key: K, config: { fn: QueryFn<TInput, TOutput>; operation?: string }) {
        const { fn, operation } = config;

        // Wrap the query with the queryFnHandler
        const wrappedQuery = queryFnHandler({
            fn,
            operation: operation || `${String(key)} operation on ${getTableName(this.table)} table`,
            table: this.table,
        });

        // Return a new QueryBuilder with the wrapped query
        return new QueryBuilder<
            TTable,
            TSchemas,
            TQueryObject & Record<K, QueryFn<TInput, TOutput>>
        >({
            table: this.table,
            schemas: this.schemas,
            queries: {
                ...this.queries,
                [key]: wrappedQuery,
            },
        });
    }

    /**
     * Build the queries object
     * @returns The queries object
     */
    build(): TQueryObject {
        return this.queries;
    }
}
