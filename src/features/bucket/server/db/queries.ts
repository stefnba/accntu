import { bucketSchemas } from '@/features/bucket/schemas';
import { db, dbTable } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';
import { and, eq, ilike } from 'drizzle-orm';

export const bucketQueries = createFeatureQueries
    .registerSchema(bucketSchemas)
    /**
     * Create a bucket
     */
    .addQuery('create', {
        operation: 'create bucket',
        fn: async ({ data, userId }) => {
            const [result] = await db
                .insert(dbTable.bucket)
                .values({ ...data, userId })
                .returning();
            return result || null;
        },
    })
    /**
     * Get many buckets
     */
    .addQuery('getMany', {
        operation: 'get buckets with filters',
        fn: async ({ userId, filters, pagination }) => {
            const conditions = [
                eq(dbTable.bucket.userId, userId),
                eq(dbTable.bucket.isActive, true),
            ];

            if (filters?.search) {
                conditions.push(ilike(dbTable.bucket.name, `%${filters.search}%`));
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
     * Get a bucket by ID
     */
    .addQuery('getById', {
        operation: 'get bucket by ID',
        fn: async ({ ids, userId }) => {
            const [result] = await db
                .select()
                .from(dbTable.bucket)
                .where(and(eq(dbTable.bucket.id, ids.id), eq(dbTable.bucket.userId, userId)))
                .limit(1);
            return result || null;
        },
    })
    /**
     * Update a bucket by ID
     */
    .addQuery('updateById', {
        operation: 'update bucket',
        fn: async ({ ids, data, userId }) => {
            const [result] = await db
                .update(dbTable.bucket)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(dbTable.bucket.id, ids.id), eq(dbTable.bucket.userId, userId)))
                .returning();
            return result || null;
        },
    })
    /**
     * Remove a bucket by ID
     */
    .addQuery('removeById', {
        operation: 'remove bucket',
        fn: async ({ ids, userId }) => {
            const [result] = await db
                .update(dbTable.bucket)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(dbTable.bucket.id, ids.id), eq(dbTable.bucket.userId, userId)))
                .returning();
            return result || null;
        },
    });

export type TBucket = InferFeatureType<typeof bucketQueries>;