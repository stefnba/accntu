import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { createServiceBuilder } from '@/server/lib/service/builder/factory';

const quick = createServiceBuilder
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
    .build();

const run = async () => {
    const resultGetById = await quick.getById({
        ids: {
            id: 'urzwx524rabolqzj808nm0vg',
        },
        userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
    });
    console.log(resultGetById);

    // const resultCreate = await quick.create({
    //     data: {
    //         name: 'test',
    //         color: '#000000',
    //     },
    //     userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
    // });
    // console.log(resultCreate);

    const resultGetMany = await quick.getMany({
        filters: {
            // search: 'test',
        },
        pagination: { page: 1, pageSize: 100 },
        userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
    });
    console.log(resultGetMany);
};

run();
