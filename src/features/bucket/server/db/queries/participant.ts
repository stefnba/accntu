import { and, eq } from 'drizzle-orm';

import { TBucketParticipantQuery } from '@/features/bucket/schemas';
import { bucketParticipant } from '@/features/bucket/server/db/schemas';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

/**
 * Get all participants for a bucket
 * @param bucketId - The ID of the bucket to get participants for
 * @returns The participants for the bucket
 */
const getAll = async ({
    userId,
}: TQuerySelectUserRecords): Promise<TBucketParticipantQuery['select'][]> =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(bucketParticipant)
                .where(
                    and(eq(bucketParticipant.userId, userId), eq(bucketParticipant.isActive, true))
                ),
        operation: 'list all bucket participants for a user',
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
                .from(bucketParticipant)
                .where(and(eq(bucketParticipant.id, id), eq(bucketParticipant.userId, userId)));
            return result;
        },
        operation: 'get bucket participant by ID',
        allowNull: true,
    });

/**
 * Create a new participant
 * @param data - The data to create the participant with
 * @param userId - The user ID of the participant
 * @returns The created participant
 */
const create = ({ data, userId }: TQueryInsertUserRecord<TBucketParticipantQuery['insert']>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .insert(bucketParticipant)
                .values({ ...data, userId })
                .returning();
            return result;
        },
        operation: 'create bucket participant',
    });

/**
 * Update a participant
 * @param id - The ID of the participant to update
 * @param userId - The user ID of the participant
 * @param data - The data to update the participant with
 * @returns The updated participant
 */
const update = ({ id, userId, data }: TQueryUpdateUserRecord<TBucketParticipantQuery['update']>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucketParticipant)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(bucketParticipant.id, id), eq(bucketParticipant.userId, userId)))
                .returning();
            return result;
        },
        operation: 'update bucket participant',
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
                .update(bucketParticipant)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(bucketParticipant.id, id))
                .returning();

            return result;
        },
        operation: 'remove bucket participant',
    });

export const bucketParticipantQueries = {
    getById,
    create,
    update,
    remove,
    getAll,
};
