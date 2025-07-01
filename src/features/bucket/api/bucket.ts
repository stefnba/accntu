import { apiClient, createMutation, createQuery } from '@/lib/api';

const BUCKET_QUERY_KEYS = {
    ALL: 'buckets',
    ONE: 'bucket',
};

export const useBucketEndpoints = {
    /**
     * Get all buckets
     */
    getAll: createQuery(apiClient.buckets.$get, BUCKET_QUERY_KEYS.ALL),

    /**
     * Get a bucket by id
     */
    getById: createQuery(apiClient.buckets[':id'].$get, BUCKET_QUERY_KEYS.ONE),

    /**
     * Create a new bucket
     */

    create: createMutation(apiClient.buckets.$post, BUCKET_QUERY_KEYS.ALL),
    /**
     * Update a bucket
     */
    update: createMutation(apiClient.buckets[':id'].$put, BUCKET_QUERY_KEYS.ONE),

    /**
     * Delete a bucket
     */
    delete: createMutation(apiClient.buckets[':id'].$delete, BUCKET_QUERY_KEYS.ALL),
};
