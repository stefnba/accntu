import { TBucketParticipantQuery } from '@/features/bucket/schemas';
import { bucketParticipantQueries } from '@/features/bucket/server/db/queries/participant';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';

export const participantService = {
    /**
     * Get all participants for a user
     * @param userId - The user ID
     * @returns The participants
     */
    getAll: async ({ userId }: TQuerySelectUserRecords) => {
        const result = await bucketParticipantQueries.getAll({ userId });
        console.log('result', result);
        return result;
    },

    /**
     * Get a participant by ID
     * @param id - The participant ID
     * @param userId - The user ID
     * @returns The participant
     */
    getById: async ({ id, userId }: TQuerySelectUserRecordById) => {
        const result = await bucketParticipantQueries.getById({ id, userId });

        if (!result) {
            return {};
        }

        return result;
    },

    /**
     * Create a participant
     * @param data - The participant data
     * @param userId - The user ID
     * @returns The created participant
     */
    create: async ({ data, userId }: TQueryInsertUserRecord<TBucketParticipantQuery['insert']>) => {
        const newParticipant = await bucketParticipantQueries.create({ data, userId });

        return newParticipant;
    },

    /**
     * Update a participant
     * @param id - The participant ID
     * @param data - The participant data
     * @param userId - The user ID
     * @returns The updated participant
     */
    update: async ({
        id,
        userId,
        data,
    }: TQueryUpdateUserRecord<TBucketParticipantQuery['update']>) => {
        const updatedParticipant = await bucketParticipantQueries.update({ id, userId, data });

        if (!updatedParticipant) {
            throw new Error('Participant not found or you do not have permission to update it');
        }

        return updatedParticipant;
    },

    /**
     * Delete a participant
     * @param id - The participant ID
     * @param userId - The user ID
     * @returns The deleted participant
     */
    remove: async ({ id, userId }: TQueryDeleteUserRecord) => {
        const deletedParticipant = await bucketParticipantQueries.remove({ id, userId });

        if (!deletedParticipant) {
            throw new Error('Participant not found or you do not have permission to delete it');
        }

        return { id };
    },
};
