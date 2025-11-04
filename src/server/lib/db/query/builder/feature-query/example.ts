import { tag } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { createFeatureQueries } from './factory';

const USER_ID = 'kdot36uifwaveogao0o7umx3';

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
    .registerAllStandard({ defaultFilters: { isActive: true } });

// ====================
// customCreate
// ====================
const customCreate = tagQueries.queries.customCreate;
const customCreateResult = await customCreate({
    name: 'E' + Date.now(),
    userId: USER_ID,
});
console.log('customCreateResult', customCreateResult);
// ====================
// standard getById
// ====================
const getById = tagQueries.queries.getById;
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
const getMany = tagQueries.queries.getMany;
const getManyResult = await getMany({
    userId: USER_ID,
});
console.log('getManyResult', getManyResult);
// ====================
// standard updateById
// ====================
const updateById = tagQueries.queries.updateById;
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
const createMany = tagQueries.queries.createMany;
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

// exit
process.exit(0);
