import { bucketSchemas } from '@/features/bucket/schemas';
import { bucketQueries } from '@/features/bucket/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const bucketServices = createFeatureServices
    .registerSchema(bucketSchemas)
    .registerQuery(bucketQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a new bucket
         */
        create: async (input) => {
            return await queries.create({ data: { ...input.data, userId: input.userId } });
        },
        /**
         * Get a bucket by ID
         */
        getById: async ({ ids, userId }) => {
            return await queries.getById({
                ids,
                userId,
            });
        },
        /**
         * Get many buckets
         */
        getMany: async ({ userId, filters, pagination }) => {
            return await queries.getMany({ userId, filters, pagination });
        },
        /**
         * Update a bucket by ID
         */
        updateById: async ({ data, ids, userId }) => {
            // First check if the bucket exists and belongs to the user
            const existingBucket = await queries.getById({ ids, userId });
            if (!existingBucket) {
                throw new Error('Bucket not found or you do not have permission to update it');
            }
            return await queries.updateById({ ids, data, userId });
        },
        /**
         * Remove a bucket by ID
         */
        removeById: async ({ ids, userId }) => queries.removeById({ ids, userId }),
    }));
