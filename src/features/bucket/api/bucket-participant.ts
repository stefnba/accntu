import { apiClient, createMutation, createQuery } from '@/lib/api';

const BUCKET_PARTICIPANT_QUERY_KEYS = {
    ALL: 'bucket-participants',
};

export const useBucketParticipantEndpoints = {
    /**
     * Get all participants for a bucket
     */
    getAllForBucket: createQuery(
        apiClient.buckets[':bucketId'].participants.$get,
        BUCKET_PARTICIPANT_QUERY_KEYS.ALL
    ),

    /**
     * Create a new participant
     */
    create: createMutation(
        apiClient.buckets[':bucketId'].participants.$post,
        BUCKET_PARTICIPANT_QUERY_KEYS.ALL
    ),

    /**
     * Update a participant
     */
    update: createMutation(
        apiClient.buckets.participants[':id'].$put,
        BUCKET_PARTICIPANT_QUERY_KEYS.ALL
    ),

    /**
     * Delete a participant
     */
    delete: createMutation(
        apiClient.buckets.participants[':id'].$delete,
        BUCKET_PARTICIPANT_QUERY_KEYS.ALL
    ),
};
