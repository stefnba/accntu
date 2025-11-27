import { tag } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { createFeatureQueries } from './factory';

const USER_ID = 'kdot36uifwaveogao0o7umx3';

const tagTableConfig = createFeatureTableConfig(tag)
    .restrictReturnColumns(['id', 'name', 'userId'])
    .build();

const tagQueries = createFeatureQueries('tag', tagTableConfig)
    .addQuery('customCreate', ({ tableOps, tableConfig, error }) => ({
        fn: (input: { name: string; userId: string }) => {
            // Example of throwing an error with AppErrors
            if (input.name === 'bad') {
                throw error.validation('INVALID_INPUT', {
                    message: 'Name is bad',
                });
            }

            return tableOps.createRecord({
                data: input,
                returnColumns: tableConfig.getReturnColumns(),
            });
        },
    }))
    .registerAllStandard({ defaultFilters: { isActive: true } })
    .build();

// ====================
// customCreate
// ====================
const customCreate = tagQueries.customCreate;
const customCreateResult = await customCreate({
    name: 'E' + Date.now(),
    userId: USER_ID,
});
console.log('customCreateResult', customCreateResult);
// ====================
// standard getById
// ====================
const getById = tagQueries.getById;
const getByIdResult = await getById({
    ids: {
        id: customCreateResult.id,
    },
    userId: USER_ID,
});
console.log('getByIdResult', getByIdResult);
// ====================
// standard getMany
// ====================
const getMany = tagQueries.getMany;
const getManyResult = await getMany({
    userId: USER_ID,
});
console.log('getManyResult', getManyResult);
// ====================
// standard updateById
// ====================
const updateById = tagQueries.updateById;
const updateByIdResult = await updateById({
    data: {
        name: 'Updated ' + Date.now(),
        // userId: 'Wrong userId', // make sure input validation with zod works and removes userId
    },
    ids: {
        id: customCreateResult.id,
    },
    userId: USER_ID,
});
console.log('updateByIdResult', updateByIdResult);
// ====================
// standard createMany
// ====================
const createMany = tagQueries.createMany;
const createManyResult = await createMany({
    data: [
        {
            name: 'Test createMany Item 1 ' + Date.now(),
        },
        {
            name: 'Test createMany Item 2 ' + Date.now(),
        },
    ],
    userId: USER_ID,
});
console.log('getManyResult', createManyResult);
// ====================
// standard create
// ====================
const create = tagQueries.create;
const createResult = await create({
    data: {
        name: 'Test create ' + Date.now(),
    },
    userId: USER_ID,
});
console.log('createResult', createResult);

// exit
process.exit(0);
