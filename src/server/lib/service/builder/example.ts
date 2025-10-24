import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { createServiceBuilder } from '@/server/lib/service/builder/factory';

const quick = createServiceBuilder('quick')
    .registerSchemas(tagSchemas)
    .registerSchemas(tagToTransactionSchemas)
    .registerQueries(tagQueries)
    .registerQueries(tagToTransactionQueries)
    .registerCoreServices()
    .addService('assignToTransaction', ({ queries }) => ({
        operation: 'create tag to transaction',
        returnHandler: 'nonNull',
        fn: async (input) => {
            return await queries.assignToTransaction(input);
        },
    }))
    .addService('getById', ({ queries }) => ({
        operation: 'get tag by id',
        returnHandler: 'nonNull',
        fn: async (input) => {
            if (input.ids.id === 'urzwx524rabolqzj808nm0vg') {
                return {
                    adsf: 33,
                };
            }
            return null;
        },
    }))
    .build();

const run = async () => {
    const resultGetById = await quick.getById({
        ids: {
            id: 'urzwx524rabolqzj808nm0vg',
        },
        userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
    });
    console.log('resultGetById', resultGetById);

    const resultCreate = await quick.create({
        data: {
            name: 'test-' + Date.now(),
            color: '#000000',
        },
        userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
    });
    console.log('resultCreate', resultCreate);

    const resultGetMany = await quick.getMany({
        filters: {
            // search: 'test',
        },
        pagination: { page: 1, pageSize: 100 },
        userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
    });
    // console.log('resultGetMany', resultGetMany);

    const resultUpdateById = await quick.updateById({
        ids: { id: resultCreate.id },
        data: { name: 'test-updated-' + Date.now() },
        userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
    });
    console.log('resultUpdateById', resultUpdateById);
};

const run2 = async () => {
    const a = await quick.getById({
        ids: { id: '-urzwx524rabolqzj808nm0vg' },
        userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
    });
    console.log('a', a);
};

run2().then(() => {
    process.exit(0);
});
