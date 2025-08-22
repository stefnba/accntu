import { labelQueriesTest } from '@/features/label/server/db/queries';
import { label } from '@/features/label/server/db/schema';
import { TCustomQueries } from '@/server/lib/db/query/factory/types';
import { Table } from 'drizzle-orm';
import { BuildSchema, createSelectSchema } from 'drizzle-zod';
import { TFeatureSchemaConfig } from './types';

export const createFeatureSchemas = <TQueries extends TCustomQueries, TTable extends Table>(
    config: TFeatureSchemaConfig<
        TQueries,
        TTable,
        BuildSchema<'select', TTable['_']['columns'], undefined>
    >
) => {
    const { table, paramsSchemas, feature } = config;

    const paramsSchema = createSelectSchema(table);

    return {
        paramsSchemas: paramsSchemas(paramsSchema),
        feature,
    };
};

const labelSchemas = createFeatureSchemas({
    feature: 'label',
    table: label,
    queries: labelQueriesTest,
    paramsSchemas: (schema) => ({
        query: {
            getAll: schema.pick({
                id: true,
                name: true,
                color: true,
            }),
        },
    }),
});

const a = labelSchemas.paramsSchemas.query?.getAll;
