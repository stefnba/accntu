import { apiClient, createMutation, createQuery } from '@/lib/api';

const BUCKET_PARTICIPANT_QUERY_KEYS = {
    ALL: 'bucket-participants',
};

export const useBucketParticipantEndpoints = {
    /**
     * Get all participants for a bucket
     */
    getAllForBucket: createQuery(
        apiClient.buckets.participants[':bucketId'].$get,
        BUCKET_PARTICIPANT_QUERY_KEYS.ALL
    ),

    /**
     * Create a new bucketParticipant
     */
    create: createMutation(
        apiClient.buckets.participants[':bucketId'].$post,
        BUCKET_PARTICIPANT_QUERY_KEYS.ALL
    ),

    /**
     * Update a bucketParticipant
     */
    update: createMutation(
        apiClient.buckets.participants[':id'].$put,
        BUCKET_PARTICIPANT_QUERY_KEYS.ALL
    ),

    /**
     * Delete a bucketParticipant
     */
    delete: createMutation(
        apiClient.buckets.participants[':id'].$delete,
        BUCKET_PARTICIPANT_QUERY_KEYS.ALL
    ),
};
