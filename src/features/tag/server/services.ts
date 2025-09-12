import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { transactionServices } from '@/features/transaction/server/services';
import { createFeatureServices } from '@/server/lib/service/';
import { coreCrudServiceHandler } from '@/server/lib/service/crud';

export const tagServices = createFeatureServices
    .registerSchema(tagSchemas)
    .registerSchema(tagToTransactionSchemas)
    .registerQuery(tagQueries)
    .registerQuery(tagToTransactionQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a tag
         */
        create: async ({ data, userId }) =>
            coreCrudServiceHandler.createOneRecord(queries.create({ data: { ...data, userId } })),

        /**
         * Get a tag by ID
         */
        getById: async ({ ids, userId }) =>
            coreCrudServiceHandler.getOneRecord(queries.getById({ ids, userId })),

        /**
         * Update a tag by ID
         */
        updateById: async ({ ids, data, userId }) =>
            coreCrudServiceHandler.updateOneRecord(queries.updateById({ ids, data, userId })),

        /**
         * Remove a tag by ID
         */
        removeById: async ({ ids, userId }) =>
            coreCrudServiceHandler.deleteOneRecord(queries.removeById({ ids, userId })),

        /**
         * Get many tags
         */
        getMany: async ({ userId, filters, pagination }) => {
            return await queries.getMany({ userId, filters, pagination });
        },
        /**
         * Assign tags to a transaction
         */
        assignToTransaction: async ({ tagIds, transactionId, userId }) => {
            // Verify user owns the transaction (security check)
            const transaction = await transactionServices.getById({
                ids: { id: transactionId },
                userId,
            });
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            return await queries.assignToTransaction({ tagIds, transactionId, userId });
        },
    }));
