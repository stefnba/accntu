import { TOperationSchemaObject } from '@/lib/schemas/types';
import { typedKeys } from '@/lib/utils';
import { queryFnHandler } from '@/server/lib/db/query/handler/core';
import { getTableName, Table } from 'drizzle-orm';
import type { ExtractQueryFns, QueriesConfig, QueryHandlerResult } from './types';

/**
 * Create a query collection for a given table and query objects.
 * Both core CRUD queries but also custom queries can be added.
 * @param table - The table to create the query collection for
 * @param config - The config for the query collection
 * @returns The query collection
 */
export function createFeatureQueries<
    T extends Table,
    TSchemas extends Record<string, TOperationSchemaObject>,
    TQueries extends QueriesConfig<T>,
>(config: {
    table: T;
    schemas: TSchemas;
    queries: (input: { schemas: TSchemas }) => TQueries;
}): QueryHandlerResult<T, TQueries> {
    const { table, queries, schemas } = config;

    const queryWithSchemasResult = queries({ schemas });

    const queriesFns = {} as ExtractQueryFns<T, TQueries>;

    // Get the actual query functions from the query function result
    typedKeys(queryWithSchemasResult).forEach((key) => {
        const queryConfig = queryWithSchemasResult[key];

        const operation = queryConfig.operation || `${String(key)} on ${getTableName(table)} table`;

        queriesFns[key] = queryFnHandler({
            fn: queryConfig.fn,
            operation,
            table,
        });
    });

    return queriesFns;
}
