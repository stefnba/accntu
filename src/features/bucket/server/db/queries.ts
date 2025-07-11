import { and, eq } from 'drizzle-orm';

import { TBucketQuery } from '@/features/bucket/schemas';
import { bucket } from '@/features/bucket/server/db/schema';
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
 * Get a bucket by ID
 * @param id - The ID of the bucket to get
 * @param userId - The user ID of the bucket
 * @returns The bucket
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) =>
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
        operation: 'get bucket by id',
        allowNull: true,
    });

/**
 * Get all buckets for a user
 * @param userId - The user ID
 * @returns The buckets
 */
const getAll = async ({
    userId,
}: TQuerySelectUserRecords): Promise<TBucketQuery['select'][]> =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(bucket)
                .where(and(eq(bucket.userId, userId), eq(bucket.isActive, true))),
        operation: 'get all buckets',
    });

/**
 * Create a bucket
 * @param data - The bucket data
 * @param userId - The user ID
 * @returns The created bucket
 */
const create = async ({
    data,
    userId,
}: TQueryInsertUserRecord<TBucketQuery['insert']>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .insert(bucket)
                .values({ ...data, userId })
                .returning();
            return result;
        },
        operation: 'create bucket',
    });

/**
 * Update a bucket
 * @param id - The ID of the bucket to update
 * @param data - The bucket data
 * @param userId - The user ID
 * @returns The updated bucket
 */
const update = async ({
    id,
    data,
    userId,
}: TQueryUpdateUserRecord<TBucketQuery['update']>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucket)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
                .returning();
            return result;
        },
        operation: 'update bucket',
    });

/**
 * Remove a bucket
 * @param id - The ID of the bucket to remove
 * @param userId - The user ID of the bucket
 * @returns The removed bucket
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucket)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
                .returning();

            return result;
        },
        operation: 'remove bucket',
    });

export const bucketQueries = {
    getById,
    getAll,
    create,
    update,
    remove,
};