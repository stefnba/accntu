import { and, eq } from 'drizzle-orm';

import { bucketParticipantQuerySchemas } from '@/features/bucket/schemas';
import { bucketParticipant } from '@/features/bucket/server/db/schemas';
import { TQueryDeleteUserRecord, TQueryUpdateUserRecord } from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

const getAllForBucket = (bucketId: string) =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(bucketParticipant)
                .where(
                    and(
                        eq(bucketParticipant.bucketId, bucketId),
                        eq(bucketParticipant.isActive, true)
                    )
                ),
        operation: 'get_all_bucket_participants',
    });

const getById = (id: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(bucketParticipant)
                .where(eq(bucketParticipant.id, id));
            return result || null;
        },
        operation: 'get_bucket_participant_by_id',
        allowNull: true,
    });

const create = (data: typeof bucketParticipantQuerySchemas.insert._type) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db.insert(bucketParticipant).values(data).returning();
            return result;
        },
        operation: 'create_bucket_participant',
    });

const update = ({
    id,
    data,
}: TQueryUpdateUserRecord<typeof bucketParticipantQuerySchemas.update._type>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucketParticipant)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(bucketParticipant.id, id))
                .returning();
            return result;
        },
        operation: 'update_bucket_participant',
    });

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
        operation: 'remove_bucket_participant',
    });

const removeAllForBucket = (bucketId: string) =>
    withDbQuery({
        queryFn: () =>
            db
                .delete(bucketParticipant)
                .where(eq(bucketParticipant.bucketId, bucketId))
                .returning(),
        operation: 'remove_all_bucket_participants',
    });

export const bucketParticipantQueries = {
    getAllForBucket,
    getById,
    create,
    update,
    remove,
    removeAllForBucket,
};
