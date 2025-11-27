import { createFeatureSchemas } from '@/lib/schema';
import { tag } from '@/server/db/tables';
import { createFeatureQueries } from '@/server/lib/db/query/feature-queries/factory';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { createFeatureServices } from '@/server/lib/service/factory';

const tagTableConfig = createFeatureTableConfig(tag)
    .restrictReturnColumns(['id', 'name', 'userId'])
    .build();

const tagSchemas = createFeatureSchemas(tagTableConfig)
    .addSchema('custom', ({ schemas }) => ({
        service: schemas.base,
    }))
    .build();

const tagQueries = createFeatureQueries('tag', tagTableConfig)
    .registerSchema(tagSchemas)
    .addQuery('custom', ({ tableOps, tableConfig }) => ({
        fn: (input: { name: string; userId: string }) => {
            return tableOps.createRecord({
                data: input,
                returnColumns: tableConfig.getReturnColumns(),
            });
        },
    }))
    .registerAllStandard({ defaultFilters: { isActive: true } })
    .build();

// Create services
const tagServices = createFeatureServices('tag')
    .registerQueries(tagQueries)
    .registerSchema(tagSchemas)
    // Add a custom service
    .addService('createWithValidation', ({ queries, schemas, error }) => ({
        operation: 'create tag with validation',
        onNull: 'throw',
        fn: async (input: { name: string; userId: string }) => {
            // Example of accessing schemas
            console.log(schemas.custom.service);

            if (input.name === 'bad') {
                throw error.validation('INVALID_INPUT');
            }
            if (input.name === 'spam') {
                return null;
            }
            return await queries.custom(input);
        },
    }))
    // Register standard services
    // .withStandard((builder) => builder.create().getById().getMany().createMany())
    .registerAllStandard()
    .build();

// Standard service

const standardResult = await tagServices.getById({
    ids: { id: '1' },
    userId: 'user1',
});
// Result can be null (from the query), so we need to check
if (standardResult) {
    console.log(standardResult.id);
}

const createManyResult = await tagServices.createMany({
    data: [{ name: 'test1' }, { name: 'test2' }],
    userId: 'user1',
});
console.log(createManyResult);

const getManyResult = await tagServices.getMany({
    userId: 'user1',
});
console.log(getManyResult);

const customResult = await tagServices.createWithValidation({
    name: 'test',
    userId: 'user1',
});
console.log(customResult);
