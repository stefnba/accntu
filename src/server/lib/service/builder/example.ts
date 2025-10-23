import { tagSchemas } from '@/features/tag/schemas';
import { tagQueries } from '@/features/tag/server/db/queries';
import { ServiceBuilderFactory } from '@/server/lib/service/builder/factory';

const quick = new ServiceBuilderFactory({
    schemas: {},
    queries: {},
})
    .registerSchemas(tagSchemas)
    .registerQueries(tagQueries.queries)
    .registerCoreServices()
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
