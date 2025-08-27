import { tagSchemas } from '@/features/tag/schemas';
import { tagQueries } from '@/features/tag/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const tagServices = createFeatureServices({
    queries: tagQueries,
    schemas: tagSchemas,
    services: ({ queries }) => ({
        /**
         * Create a new tag
         */
        create: async (input) => queries.create({ data: input.data, userId: input.userId }),
        /**
         * Get many tags
         */
        getMany: async (input) => queries.getMany({ userId: input.userId }),
        /**
         * Get a tag by ID
         */
        getById: async (input) => queries.getById({ id: input.id, userId: input.userId }),
        /**
         * Update a tag by ID
         */
        updateById: async (input) =>
            queries.updateById({ id: input.id, data: input.data, userId: input.userId }),
        /**
         * Remove a tag by ID
         */
        removeById: async (input) => queries.removeById({ id: input.id, userId: input.userId }),
        /**
         * Assign tags to a transaction
         */
        assignToTransaction: async (input) =>
            queries.assignToTransaction({
                id: input.transactionId,
                userId: input.userId,
                tagIds: input.tagIds,
            }),
        customService: async (input: { name: string }) => {
            return {
                ...input,
                processed: true,
            };
        },
    }),
});
