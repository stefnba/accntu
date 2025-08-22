import { TCustomQueries } from '@/server/lib/db/query/factory/types';
import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';
import { z } from 'zod';

export type TFeatureSchemaConfig<
    TQueries extends TCustomQueries,
    TTable extends Table,
    TSchema extends BuildSchema<'select', TTable['_']['columns'], undefined>,
    TParamsSchemas extends {
        query?: Partial<Record<keyof TQueries, z.ZodTypeAny>>;
        service?: Record<string, z.ZodTypeAny>;
        custom?: Record<string, z.ZodTypeAny>;
    } = {
        query?: Partial<Record<keyof TQueries, z.ZodTypeAny>>;
        service?: Record<string, z.ZodTypeAny>;
        custom?: Record<string, z.ZodTypeAny>;
    },
> = {
    feature: string;
    queries: TQueries;
    table: TTable;
    paramsSchemas: (schema: TSchema) => TParamsSchemas;
};
