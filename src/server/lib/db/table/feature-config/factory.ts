import { FeatureTableConfigBuilder } from '@/server/lib/db/table/feature-config/core';
import { Table } from 'drizzle-orm';
import {
    BuildSchema,
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const createFeatureTableConfig = <TTable extends Table>(table: TTable) => {
    return new FeatureTableConfigBuilder<
        TTable,
        BuildSchema<'insert', TTable['_']['columns'], undefined, undefined>['shape'],
        BuildSchema<'insert', TTable['_']['columns'], undefined, undefined>['shape'],
        BuildSchema<'insert', TTable['_']['columns'], undefined, undefined>['shape'],
        BuildSchema<'update', TTable['_']['columns'], undefined, undefined>['shape'],
        BuildSchema<'select', TTable['_']['columns'], undefined, undefined>['shape'],
        undefined,
        undefined
    >({
        table,
        rawSchema: createInsertSchema(table).shape,
        baseSchema: createInsertSchema(table).shape,
        idSchema: z.object({}).shape,
        userIdSchema: z.object({}).shape,
        insertSchema: createInsertSchema(table).shape,
        updateSchema: createUpdateSchema(table).shape,
        selectSchema: createSelectSchema(table).shape,
    });
};
