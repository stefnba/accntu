import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const tagServices = createFeatureServices
    .registerSchema(tagSchemas)
    .registerSchema(tagToTransactionSchemas)
    .registerQuery(tagQueries.queries)
    .registerQuery(tagToTransactionQueries.queries)
    .defineServices(({ queries }) => ({
        /**
         * Create a tag
         */
        create: async ({ data, userId }) => await queries.create({ data, userId }),

        /**
         * Get a tag by ID
         */
        getById: async ({ ids, userId }) => await queries.getById({ ids, userId }),

        /**
         * Update a tag by ID
         */
        updateById: async ({ ids, data, userId }) =>
            await queries.updateById({ ids, data, userId }),

        /**
         * Remove a tag by ID
         */
        removeById: async ({ ids, userId }) => await queries.removeById({ ids, userId }),

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
            // Security check moved to query level to avoid circular dependency
            return await queries.assignToTransaction({ tagIds, transactionId, userId });
        },
    }));
