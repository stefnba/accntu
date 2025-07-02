import { apiClient, createMutation, createQuery } from '@/lib/api';

const BUCKET_QUERY_KEYS = {
    ALL: 'buckets',
    ONE: 'bucket',
};

export const useBucketEndpoints = {
    /**
     * Get all buckets with computed statistics
     */
    getAll: createQuery(apiClient.buckets.$get, BUCKET_QUERY_KEYS.ALL),

    /**
     * Get a bucket by id with computed statistics
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

    /**
     * Assign transaction to bucket
     */
    assignTransaction: createMutation(
        apiClient.buckets[':id'].transactions[':transactionId'].$post,
        [BUCKET_QUERY_KEYS.ALL, BUCKET_QUERY_KEYS.ONE]
    ),

    /**
     * Remove transaction from bucket
     */
    removeTransaction: createMutation(
        apiClient.buckets[':id'].transactions[':transactionId'].$delete,
        [BUCKET_QUERY_KEYS.ALL, BUCKET_QUERY_KEYS.ONE]
    ),

    /**
     * Update bucket paid amount for SplitWise integration
     */
    updatePaidAmount: createMutation(
        apiClient.buckets[':id']['paid-amount'].$patch,
        [BUCKET_QUERY_KEYS.ALL, BUCKET_QUERY_KEYS.ONE]
    ),
};
