import { TBucketQuery } from '@/features/bucket/schemas';
import { bucketQueries } from '@/features/bucket/server/db/queries/bucket';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';

export const bucketServices = {
    /**
     * Get all buckets for a user
     */
    getAll: async ({ userId }: TQuerySelectUserRecords) => {
        const result = await bucketQueries.getAll({ userId });
        return result;
    },

    /**
     * Get a bucket by ID
     */
    getById: async ({ id, userId }: TQuerySelectUserRecordById) => {
        const result = await bucketQueries.getById({ id, userId });

        return result;
    },

    /**
     * Create a bucket
     */
    create: async ({ data, userId }: TQueryInsertUserRecord<TBucketQuery['insert']>) => {
        const newBucket = await bucketQueries.create({ data, userId });
        return newBucket;
    },

    /**
     * Update a bucket
     */
    update: async ({ id, userId, data }: TQueryUpdateUserRecord<TBucketQuery['update']>) => {
        const updatedBucket = await bucketQueries.update({ id, userId, data });

        if (!updatedBucket) {
            throw new Error('Bucket not found or you do not have permission to update it');
        }

        return updatedBucket;
    },

    /**
     * Delete a bucket
     */
    remove: async ({ id, userId }: TQueryDeleteUserRecord) => {
        const deletedBucket = await bucketQueries.remove({ id, userId });

        if (!deletedBucket) {
            throw new Error('Bucket not found or you do not have permission to delete it');
        }

        return { id };
    },
};
