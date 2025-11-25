import { tag } from '@/server/db/tables';
import { createFeatureQueries } from '@/server/lib/db/query/feature-queries/factory';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { StandardServiceBuilder } from '@/server/service-new/standard';

const tagTableConfig = createFeatureTableConfig(tag)
    .restrictReturnColumns(['id', 'name', 'userId'])
    .build();

const tagQueries = createFeatureQueries('tag', tagTableConfig)
    .addQuery('customCreate', ({ tableOps, tableConfig }) => ({
        fn: (input: { name: string; userId: string }) => {
            return tableOps.createRecord({
                data: input,
                returnColumns: tableConfig.getReturnColumns(),
            });
        },
    }))
    .registerAllStandard({ defaultFilters: { isActive: true } })
    .build();

// const tagSchemas = createFeatureSchemas(tagTableConfig)
//     .addSchema('custom', ({ schemas }) => ({
//         service: schemas.base,
//     }))
//     .build();

// Create services
// const tagServices = createFeatureServices('tag', tagTableConfig)
//     .registerQueries(tagQueries)
//     .registerSchema(tagSchemas)
//     // Add a custom service
//     .addService('createWithValidation', ({ queries, schemas }) => ({
//         operation: 'create tag with validation',
//         throwOnNull: true,
//         fn: async (input: { name: string; userId: string }) => {
//             // Example of accessing schemas
//             console.log(schemas.custom.service);

//             if (input.name === 'bad') {
//                 throw new Error('Bad name');
//             }
//             return await queries.customCreate(input);
//         },
//     }))
//     // Register standard services
//     .registerAllStandard()
//     .build();

const tagServices = StandardServiceBuilder.create(tagTableConfig, tagQueries);

// Standard service
const services = tagServices.getById().create().createMany().getMany().done();
const standardResult = await services.getById({
    ids: { id: '1' },
    userId: 'user1',
});
// Result can be null (from the query), so we need to check
if (standardResult) {
    console.log(standardResult.id);
}

const createManyResult = await services.createMany({
    data: [{ name: 'test1' }, { name: 'test2' }],
    userId: 'user1',
});
console.log(createManyResult);

const getManyResult = await services.getMany({
    userId: 'user1',
});
console.log(getManyResult);
