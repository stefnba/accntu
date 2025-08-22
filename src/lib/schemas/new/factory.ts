import { labelQueriesTest } from '@/features/label/server/db/queries';
import { label } from '@/features/label/server/db/schema';
import { TCustomQueries } from '@/server/lib/db/query/factory/types';
import { Table } from 'drizzle-orm';
import { BuildSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { TFeatureSchemaConfig } from './types';

export const createFeatureSchemas = <
    TQueries extends TCustomQueries,
    TTable extends Table,
    TParamsSchemas extends {
        query?: Partial<Record<keyof TQueries, z.ZodTypeAny>>;
        service?: Record<string, z.ZodTypeAny>;
        custom?: Record<string, z.ZodTypeAny>;
    },
>(
    config: TFeatureSchemaConfig<
        TQueries,
        TTable,
        BuildSchema<'select', TTable['_']['columns'], undefined>,
        TParamsSchemas
    >
): {
    paramsSchemas: TParamsSchemas;
    feature: string;
} => {
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
            remove: schema.pick({
                id: true,
            }),
        },
    }),
});

const a = labelSchemas.paramsSchemas.query.remove;

type TA = z.infer<typeof a>;
