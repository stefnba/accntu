import { TZodShape } from '@/lib/schemas/types';
import { FeatureSchemasBuilder } from '@/lib/schemas_new/core';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';

import { Table } from 'drizzle-orm';

export const createFeatureSchemas = <
    TTable extends Table,
    TBase extends TZodShape,
    TIdSchema extends TZodShape,
    TUserIdSchema extends TZodShape,
    TInsertDataSchema extends TZodShape,
    TUpdateDataSchema extends TZodShape,
    TSelectReturnSchema extends TZodShape,
>(
    config: FeatureTableConfig<
        TTable,
        TIdSchema,
        TUserIdSchema,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema
    >
) => {
    return new FeatureSchemasBuilder<
        Record<string, never>,
        TTable,
        TBase,
        TIdSchema,
        TUserIdSchema,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema,
        FeatureTableConfig<
            TTable,
            TIdSchema,
            TUserIdSchema,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema
        >
    >({ schemas: {}, config });
};
