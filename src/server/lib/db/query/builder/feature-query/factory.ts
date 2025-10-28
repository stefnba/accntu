import { FeatureQueryBuilder } from '@/server/lib/db/query/builder/feature-query/core';
import { Table } from 'drizzle-orm';

export const createFeatureQueries = <T extends Table>(table: T | { table: T; name?: string }) =>
    // todo: add name to the builder (useful for debugging and logging)
    new FeatureQueryBuilder({
        schemas: {},
        queries: {},
        table: 'table' in table ? table.table : table,
    });
