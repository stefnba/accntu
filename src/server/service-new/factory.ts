import { TEmptyQueries } from '@/server/lib/db/query/feature-queries/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
import { Table } from 'drizzle-orm';
import { FeatureServiceBuilder } from './core';

/**
 * Factory function to create a new FeatureServiceBuilder instance.
 *
 * @param config - Table configuration
 * @param name - Service name (optional, defaults to config name)
 */
export const createFeatureServices = <
    const TTable extends Table,
    const TConfig extends TFeatureTableConfig<TTable>,
>(
    name: string,
    config: FeatureTableConfig<TTable, TConfig>
) => {
    return new FeatureServiceBuilder<
        TTable,
        TConfig,
        FeatureTableConfig<TTable, TConfig>,
        TEmptyQueries
    >({
        services: {},
        config,
        queries: {},
        schemas: {},
        name,
    });
};
