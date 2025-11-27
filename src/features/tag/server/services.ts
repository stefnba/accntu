import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { transactionServices } from '@/features/transaction/server/services';
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
    .addService('assign', ({ queries, error }) => ({
        operation: 'assign tags to transaction',
        onNull: 'throw',
        fn: async (input) => {
            // verify user owns the transaction
            const transaction = await transactionServices.getById({
                ids: { id: input.transactionId },
                userId: input.userId,
            });

            // throw error if transaction not found
            if (!transaction) {
                throw error.resource('NOT_FOUND', {
                    layer: 'service',
                    message: 'Transaction not found',
                    details: { transactionId: input.transactionId, userId: input.userId },
                });
            }

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
