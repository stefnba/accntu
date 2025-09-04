import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const tagServices = createFeatureServices({
    queries: { ...tagQueries, ...tagToTransactionQueries },
    schemas: { ...tagSchemas, ...tagToTransactionSchemas },
    services: ({ queries }) => ({
        /**
         * Create a new tag
         */
        create: async (input) => queries.create({ data: input.data, userId: input.user.userId }),
        /**
         * Get many tags
         */
        getMany: async ({ idFields }) => queries.getMany({ userId: idFields.userId }),
        /**
         * Get a tag by ID
         */
        getById: async ({ idFields }) =>
            queries.getById({ id: idFields.id, userId: 'test-user-id' }),
        /**
         * Update a tag by ID
         */
        updateById: async ({ data, idFields }) =>
            queries.updateById({ id: idFields.id, data, userId: 'test-user-id' }),
        /**
         * Remove a tag by ID
         */
        removeById: async (input) =>
            queries.removeById({ id: input.idFields.id, userId: 'test-user-id' }),
        /**
         * Assign tags to a transaction
         */
        assignToTransaction: async (input) =>
            queries.assignToTransaction({
                transactionId: input.idFields.transactionId,
                userId: 'test-user-id', // This should come from auth context
                tagIds: input.tagIds,
            }),
        /**
         * Custom service for testing
         */
        customService: async (input: { name: string }) => {
            return {
                ...input,
                processed: true,
            };
        },
    }),
});
