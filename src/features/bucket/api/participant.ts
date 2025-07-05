import { apiClient, createMutation, createQuery } from '@/lib/api';

const PARTICIPANT_QUERY_KEYS = {
    ALL: 'participants',
    ONE: 'participant',
};

export const useBucketParticipantEndpoints = {
    /**
     * Get all participants
     */
    getAll: createQuery(apiClient.buckets.participants.$get, PARTICIPANT_QUERY_KEYS.ALL),

    /**
     * Get a participant by id
     */
    getById: createQuery(apiClient.buckets.participants[':id'].$get, PARTICIPANT_QUERY_KEYS.ONE),

    /**
     * Create a new participant
     */
    create: createMutation(apiClient.buckets.participants.$post, PARTICIPANT_QUERY_KEYS.ALL),

    /**
     * Update a participant
     */
    // update: createMutation(apiClient.buckets.participants[':id'].$put, PARTICIPANT_QUERY_KEYS.ONE),

    /**
     * Delete a participant
     */
    delete: createMutation(
        apiClient.buckets.participants[':id'].$delete,
        PARTICIPANT_QUERY_KEYS.ALL
    ),
};
