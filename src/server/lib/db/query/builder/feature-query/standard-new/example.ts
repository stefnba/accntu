import { tag } from '@/server/db/tables';
import { StandardQueryBuilder } from '@/server/lib/db/query/builder/feature-query/standard-new/builder';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

const config = createFeatureTableConfig(tag)
    .setIds(['id'])
    .setUserId('userId')
    .defineInsertData(['name', 'color', 'description'])
    .defineReturnColumns([
        'id',
        'name',
        'color',
        'transactionCount',
        'userId',
        'createdAt',
        'description',
    ])
    .build();

const builder = new StandardQueryBuilder({
    config,
    standardQueries: {},
    standardQueryConfig: { defaultFilters: { isActive: true } },
});

const addd = builder.validateInputForInsertDefinedSchema({
    name: 'Test',
    color: 'red',
    description: 'Test description',
});

const aaaa = builder.getUserIdFieldName();
console.log(aaaa);

const queries = builder.getById().create({}).done();

// const result = await getById({ ids: { id: '1' } });

// const getByIdReturnType = await queries.getById({
//     ids: { id: 'gw58au99x8ufmax3ygtvvvij' },
//     userId: 'kdot36uifwaveogao0o7umx3',
// });
// console.log(getByIdReturnType);

const createResult = await queries.create({
    data: {
        name: 'Test' + Date.now(),
        color: 'red',
        // userId: 'kdot36uifwaveogao0o7umx3',
        description: 'Test description',
    },
    userId: 'kdot36uifwaveogao0o7umx3',
});
console.log('createResult', createResult);

process.exit(0);
