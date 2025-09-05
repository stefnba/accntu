import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries } from '@/features/tag/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const tagServices = createFeatureServices
    .registerSchema(tagSchemas)
    .registerSchema(tagToTransactionSchemas)
    .registerQuery(tagQueries)
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
            // todo check if user owns the transaction

            // return await queries.assignToTransaction({ tagIds, transactionId, userId });
            return { success: true };
        },

        /**
         * Custom service for testing
         */
        customService: async (input: { name: string }) => {
            return {
                ...input,
                processed: true,
            };
        },
    }));
