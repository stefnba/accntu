import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { transactionServices } from '@/features/transaction/server/services';
import { createFeatureServices } from '@/server/lib/service/';

export const tagServices = createFeatureServices
    .registerSchema(tagSchemas)
    .registerSchema(tagToTransactionSchemas)
    .registerQuery(tagQueries)
    .registerQuery(tagToTransactionQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a new tag
         */
        create: async (input) => {
            return await queries.create({ data: input.data, userId: 'input.user.userId' });
        },
        /**
         * Get a tag by ID
         */
        getById: async ({ ids, userId }) => {
            return await queries.getById({
                ids,
                userId,
            });
        },
        /**
         * Get many tags
         */
        getMany: async ({ userId, filters, pagination }) => {
            return await queries.getMany({ userId, filters, pagination });
        },
        /**
         * Update a tag by ID
         */
        updateById: async ({ data, ids, userId }) => queries.updateById({ ids, data, userId }),
        /**
         * Remove a tag by ID
         */
        removeById: async ({ ids, userId }) => queries.removeById({ ids, userId }),
        /**
         * Assign tags to a transaction
         */
        assignToTransaction: async ({ tagIds, transactionId, userId }) => {
            // Verify user owns the transaction (security check)
            const transaction = await transactionServices.getById({
                id: transactionId,
                userId,
            });
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            return await queries.assignToTransaction({ tagIds, transactionId, userId });
        },
    }));
