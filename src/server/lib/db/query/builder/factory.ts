import { TOperationSchemaObject } from '@/lib/schemas/types';
import { Table } from 'drizzle-orm';
import { QueryBuilder } from './core';

export const createFeatureQueries = <
    TTable extends Table,
    TSchemas extends Record<string, TOperationSchemaObject>,
>(config: {
    table: TTable;
    schemas: TSchemas;
}) => {
    return new QueryBuilder<TTable, TSchemas>({
        table: config.table,
        schemas: config.schemas,
        queries: {}, // empty queries object
    });
};
