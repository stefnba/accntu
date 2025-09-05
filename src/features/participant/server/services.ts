import { participantSchemas } from '@/features/participant/schemas';
import { participantQueries } from '@/features/participant/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const participantServices = createFeatureServices
    .registerSchema(participantSchemas)
    .registerQuery(participantQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a participant
         */
        create: async (input) => {
            return await queries.create({ data: input.data, userId: input.userId });
        },
        /**
         * Get participants with filters
         */
        getMany: async ({ userId, filters, pagination }) => {
            return await queries.getMany({ userId, filters, pagination });
        },
        /**
         * Get a participant by ID
         */
        getById: async ({ ids, userId }) => {
            return await queries.getById({ ids, userId });
        },
        /**
         * Update a participant by ID
         */
        updateById: async ({ data, ids, userId }) => {
            const result = await queries.updateById({ ids, data, userId });
            if (!result) {
                throw new Error('Participant not found or you do not have permission to update it');
            }
            return result;
        },
        /**
         * Remove a participant by ID
         */
        removeById: async ({ ids, userId }) => {
            const result = await queries.removeById({ ids, userId });
            if (!result) {
                throw new Error('Participant not found or you do not have permission to delete it');
            }
            return result;
        },
    }));