import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const tagServices = createFeatureServices('tag')
    .registerSchemas(tagSchemas)
    .registerSchemas(tagToTransactionSchemas)
    .registerQueries(tagQueries)
    .registerQueries(tagToTransactionQueries)
    .registerCoreServices()
    .addService('assignToTransaction', ({ queries }) => ({
        operation: 'assign tags to transaction',
        throwOnNull: true,
        fn: async (input) => {
            return await queries.assign(input);
        },
    }))
    .build();
