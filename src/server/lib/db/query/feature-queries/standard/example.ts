import { tag } from '@/server/db/tables';
import { StandardQueryBuilder } from '@/server/lib/db/query/feature-queries/standard/builder';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

// ==============================
// Table Config
// ==============================

const config = createFeatureTableConfig(tag)
    .restrictReturnColumns(['id', 'description', 'createdAt'])
    .enableOrdering(['createdAt'])
    .enableManyFiltering({
        name: z.string(),
    })
    .enablePagination()
    .build();

export const inputSchema = config.buildManyInputSchema();
export type TInputSchema = z.infer<typeof inputSchema>;

const orderingSchema = config.validateOrderingInput({
    ordering: [{ field: 'createdAt', direction: 'asc' }],
});
console.log('orderingSchema', orderingSchema);

const manyFiltersSchema = config.validateManyFiltersInput({ filters: { name: 'Test' } });
console.log('manyFiltersSchema', manyFiltersSchema);

// ==============================
// Standard Query Builder
// ==============================

const standardQueries = StandardQueryBuilder.create(config, {
    defaultFilters: {
        isActive: true,
    },
    getMany: {
        defaultPagination: {
            pageSize: 3,
        },
        defaultOrdering: ['description'],
    },
})
    .all()
    .done();

// ==============================
// Test Queries
// ==============================

// Get all records
const manyResult = await standardQueries.getMany({
    userId: 'kdot36uifwaveogao0o7umx3',
    ordering: [{ field: 'createdAt', direction: 'asc' }],
    filters: {
        name: 'Test',
    },
});
console.log('Has only 3 records', manyResult.length === 3);
console.log('manyResult', manyResult);

const manyResultOne = await standardQueries.getMany({
    userId: 'kdot36uifwaveogao0o7umx3',
    ordering: [{ field: 'createdAt', direction: 'asc' }],
    pagination: { page: 1, pageSize: 1 },
});
console.log('Has only 1 record', manyResultOne.length === 1);
console.log('manyResult', manyResultOne);

// Create a record
const createResult = await standardQueries.create({
    data: {
        // what: 'asdfklsadf',
        name: 'Test' + Date.now(),
    },
    userId: 'kdot36uifwaveogao0o7umx3',
});
console.log('createResult', createResult);

// Get a record by id
const getByIdResult = await standardQueries.getById({
    ids: { id: createResult.id },
    userId: 'kdot36uifwaveogao0o7umx3',
});
console.log('getByIdResult', getByIdResult);

// ==============================
// Exit
// ==============================
process.exit(0);
