import { TParticipantQuery } from '@/features/participant/schemas';
import { participantQueries } from '@/features/participant/server/db/queries';
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
        const result = await participantQueries.getAll({ userId });
        return result;
    },

    /**
     * Get a participant by ID
     * @param id - The participant ID
     * @param userId - The user ID
     * @returns The participant
     */
    getById: async ({ id, userId }: TQuerySelectUserRecordById) => {
        const result = await participantQueries.getById({ id, userId });

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
    create: async ({ data, userId }: TQueryInsertUserRecord<TParticipantQuery['insert']>) => {
        const newParticipant = await participantQueries.create({ data, userId });

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
    }: TQueryUpdateUserRecord<TParticipantQuery['update']>) => {
        const updatedParticipant = await participantQueries.update({ id, userId, data });

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
        const deletedParticipant = await participantQueries.remove({ id, userId });

        if (!deletedParticipant) {
            throw new Error('Participant not found or you do not have permission to delete it');
        }

        return { id };
    },
};