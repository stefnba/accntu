import { and, eq } from 'drizzle-orm';

import { TParticipantQuery } from '@/features/participant/schemas';

import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db, dbTable } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

/**
 * Get all participants for a user
 * @param userId - The ID of the user to get participants for
 * @returns The participants for the user
 */
const getAll = async ({
    userId,
}: TQuerySelectUserRecords): Promise<TParticipantQuery['select'][]> =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(dbTable.participant)
                .where(and(eq(participant.userId, userId), eq(participant.isActive, true))),
        operation: 'list all participants for a user',
    });

/**
 * Get a participant by ID
 * @param id - The ID of the participant to get
 * @param userId - The user ID of the participant
 * @returns The participant
 */
const getById = ({ id, userId }: TQuerySelectUserRecordById) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(dbTable.participant)
                .where(and(eq(participant.id, id), eq(participant.userId, userId)));
            return result;
        },
        operation: 'get participant by ID',
        allowNull: true,
    });

/**
 * Create a new participant
 * @param data - The data to create the participant with
 * @param userId - The user ID of the participant
 * @returns The created participant
 */
const create = ({ data, userId }: TQueryInsertUserRecord<TParticipantQuery['insert']>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .insert(dbTable.participant)
                .values({ ...data, userId })
                .returning();
            return result;
        },
        operation: 'create participant',
    });

/**
 * Update a participant
 * @param id - The ID of the participant to update
 * @param userId - The user ID of the participant
 * @param data - The data to update the participant with
 * @returns The updated participant
 */
const update = ({ id, userId, data }: TQueryUpdateUserRecord<TParticipantQuery['update']>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(dbTable.participant)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(participant.id, id), eq(participant.userId, userId)))
                .returning();
            return result;
        },
        operation: 'update participant',
    });

/**
 * Remove a participant
 * @param id - The ID of the participant to remove
 * @returns The removed participant
 */
const remove = ({ id }: TQueryDeleteUserRecord) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(dbTable.participant)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(participant.id, id))
                .returning();

            return result;
        },
        operation: 'remove participant',
    });

export const participantQueries = {
    getById,
    create,
    update,
    remove,
    getAll,
};
