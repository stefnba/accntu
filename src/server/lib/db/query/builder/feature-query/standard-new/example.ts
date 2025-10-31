import { tag } from '@/server/db/tables';
import { StandardQueryBuilder } from '@/server/lib/db/query/builder/feature-query/standard-new/builder';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

const config = createFeatureTableConfig(tag)
    .setIds(['id'])
    .setUserId('userId')
    .defineReturnColumns(['id', 'name', 'color', 'transactionCount', 'userId', 'createdAt'])
    .build();

const builder = new StandardQueryBuilder({
    config,
    standardQueries: {},
    standardQueryConfig: { defaultFilters: { isActive: true } },
});

const queries = builder.getById().done();

// const result = await getById({ ids: { id: '1' } });

const getByIdReturnType = await queries.getById({
    ids: { id: 'gw58au99x8ufmax3ygtvvvij' },
    userId: 'kdot36uifwaveogao0o7umx3',
});
console.log(getByIdReturnType);

process.exit(0);
