import { FeatureSchemasBuilder } from '@/lib/schemas_new/core';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';

import { Table } from 'drizzle-orm';

export const createFeatureSchemas = <
    TTable extends Table,
    TConfig extends TFeatureTableConfig<TTable>,
>(
    config: FeatureTableConfig<TTable, TConfig>
) => {
    return new FeatureSchemasBuilder<Record<string, never>, TTable, TConfig>({
        schemas: {},
        config: config,
    });
};
