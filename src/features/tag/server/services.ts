import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { createFeatureServices } from '@/server/lib/service';

export const tagServices = createFeatureServices('tag')
    .registerSchema(tagSchemas)
    .registerSchema(tagToTransactionSchemas)
    .registerQueries(tagQueries)
    .registerQueries(tagToTransactionQueries)
    .withStandard((builder) =>
        builder.create().getById().getMany().updateById().removeById().createMany()
    )
    /**
     * Assign tags to a transaction
     */
    .addService('assign', ({ queries }) => ({
        operation: 'assign tags to transaction',
        onNull: 'throw',
        fn: async (input) => {
            // todo verify user owns the transaction

            return await queries.assign(input);
        },
    }))
    /**
     * Remove tags from a transaction
     */
    .addService('remove', ({ queries }) => ({
        operation: 'assign tags to transaction',
        onNull: 'throw',
        fn: async (input) => {
            return await queries.remove(input);
        },
    }))
    .build();
