import { tag } from '@/server/db/tables';
import { StandardQueryBuilder } from '@/server/lib/db/query/builder/feature-query/standard/builder';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

const config = createFeatureTableConfig(tag).restrictReturnColumns(['id', 'description']).build();

const standard = StandardQueryBuilder.create(config, {
    defaultFilters: {
        isActive: true,
    },
})
    .all()
    .done();
// const standard = StandardQueryBuilder.create(config).create().getById().getMany().done();

// const a = await standard.create({
//     data: {
//         // what: 'asdfklsadf',
//         name: 'Test' + Date.now(),
//     },
//     userId: 'kdot36uifwaveogao0o7umx3',
// });

// const b = await standard.getById({
//     ids: { id: 'f9p9peclli5zurxgykowda27' },
//     userId: 'kdot36uifwaveogao0o7umx3',
// });

const manyResult = await standard.getMany({
    userId: 'kdot36uifwaveogao0o7umx3',
});

console.log('manyResult', manyResult);

const updateResult = await standard.updateById({
    ids: {
        id: manyResult[0].id,
    },
    userId: 'kdot36uifwaveogao0o7umx3',
    data: {
        name: 'Updated' + Date.now(),
    },
});

console.log('updateResult', updateResult);

const removeResult = await standard.removeById({
    ids: {
        id: manyResult[0].id,
    },
    userId: 'kdot36uifwaveogao0o7umx3',
});

console.log('removeResult', removeResult);

process.exit(0);
