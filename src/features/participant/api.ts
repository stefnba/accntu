import { apiClient, createMutation, createQuery } from '@/lib/api';

const PARTICIPANT_QUERY_KEYS = {
    ALL: 'participants',
    ONE: 'participant',
};

export const useParticipantEndpoints = {
    /**
     * Get all participants
     */
    getAll: createQuery(apiClient.participants.$get, PARTICIPANT_QUERY_KEYS.ALL),

    /**
     * Get a participant by id
     */
    getById: createQuery(apiClient.participants[':id'].$get, PARTICIPANT_QUERY_KEYS.ONE),

    /**
     * Create a new participant
     */
    create: createMutation(apiClient.participants.$post, PARTICIPANT_QUERY_KEYS.ALL),

    /**
     * Update a participant
     */
    update: createMutation(apiClient.participants[':id'].$patch, PARTICIPANT_QUERY_KEYS.ONE),

    /**
     * Delete a participant
     */
    delete: createMutation(
        apiClient.participants[':id'].$delete,
        PARTICIPANT_QUERY_KEYS.ALL
    ),
};