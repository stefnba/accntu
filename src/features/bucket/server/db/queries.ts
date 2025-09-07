import { bucketSchemas } from '@/features/bucket/schemas';
import { db, dbTable } from '@/server/db';
import { bucket } from '@/server/db/tables';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq, ilike } from 'drizzle-orm';

export const bucketQueries = createFeatureQueries
    .registerSchema(bucketSchemas)
    /**
     * Get many buckets
     */
    .addQuery('getMany', {
        operation: 'get buckets by user ID',
        fn: async ({ userId, filters, pagination }) => {
            const conditions = [
                eq(bucket.userId, userId),
                eq(bucket.isActive, true),
            ];

            if (filters?.search) {
                conditions.push(ilike(bucket.name, `%${filters.search}%`));
            }

            return await db
                .select()
                .from(dbTable.bucket)
                .where(and(...conditions))
                .limit(pagination?.pageSize || 20)
                .offset(((pagination?.page || 1) - 1) * (pagination?.pageSize || 20));
        },
    })
    /**
     * Create a bucket
     */
    .addQuery('create', {
        fn: async ({ data, userId }) => {
            const [newBucket] = await db
                .insert(dbTable.bucket)
                .values({ ...data, userId })
                .returning();
            return newBucket;
        },
        operation: 'create bucket',
    })
    /**
     * Get a bucket by ID
     */
    .addQuery('getById', {
        operation: 'get bucket by ID',
        fn: async ({ ids, userId }) => {
            const [result] = await db
                .select()
                .from(dbTable.bucket)
                .where(and(eq(bucket.id, ids.id), eq(bucket.userId, userId)))
                .limit(1);
            return result || null;
        },
    })
    /**
     * Soft delete a bucket
     */
    .addQuery('removeById', {
        operation: 'delete bucket',
        fn: async ({ ids, userId }) => {
            await db
                .update(dbTable.bucket)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(bucket.id, ids.id), eq(bucket.userId, userId)));
        },
    })
    /**
     * Update a bucket
     */
    .addQuery('updateById', {
        operation: 'update bucket',
        fn: async ({ ids, data, userId }) => {
            const [updated] = await db
                .update(dbTable.bucket)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(bucket.id, ids.id), eq(bucket.userId, userId)))
                .returning();
            return updated || null;
        },
    });

export type TBucket = InferFeatureType<typeof bucketQueries>;