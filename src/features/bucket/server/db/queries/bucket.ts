import { and, eq } from 'drizzle-orm';

import { bucketQuerySchemas } from '@/features/bucket/schemas';
import { bucket } from '@/features/bucket/server/db/schemas';
import { TQueryDeleteUserRecord, TQueryUpdateUserRecord } from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

const getById = (id: string, userId: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(bucket)
                .where(
                    and(eq(bucket.id, id), eq(bucket.userId, userId), eq(bucket.isActive, true))
                );
            return result || null;
        },
        operation: 'get_bucket_by_id',
        allowNull: true,
    });

const getAll = (userId: string) =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(bucket)
                .where(and(eq(bucket.userId, userId), eq(bucket.isActive, true))),
        operation: 'get_all_buckets',
    });

const create = (data: typeof bucketQuerySchemas.insert._type, userId: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .insert(bucket)
                .values({ ...data, userId })
                .returning();
            return result;
        },
        operation: 'create_bucket',
    });

const update = ({
    id,
    data,
    userId,
}: TQueryUpdateUserRecord<typeof bucketQuerySchemas.update._type>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucket)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
                .returning();
            return result;
        },
        operation: 'update_bucket',
    });

const remove = ({ id, userId }: TQueryDeleteUserRecord) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucket)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
                .returning();

            return result;
        },
        operation: 'remove_bucket',
    });

export const bucketQueries = {
    getById,
    getAll,
    create,
    update,
    remove,
};
