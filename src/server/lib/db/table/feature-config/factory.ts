import { FeatureTableConfigBuilder } from '@/server/lib/db/table/feature-config/core';
import { Table } from 'drizzle-orm';

export const createFeatureTableConfig = <TTable extends Table>(table: TTable) => {
    return FeatureTableConfigBuilder.create<TTable>(table);
};
