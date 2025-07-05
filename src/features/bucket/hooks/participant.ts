import { createMutation, createQuery } from '@/lib/api';
import { apiClient } from '@/lib/api/client';

const PARTICIPANT_QUERY_KEYS = {
    PARTICIPANTS: 'participants',
    PARTICIPANT: 'bucketParticipant',
} as const;

/**
 * Participant API endpoints with integrated error handling
 */
export const useParticipantEndpoints = {
    /**
     * Get all participants for the authenticated user
     */
    getAll: createQuery(apiClient.participants.$get, PARTICIPANT_QUERY_KEYS.PARTICIPANTS),

    /**
     * Get bucketParticipant by ID
     */
    getById: createQuery(apiClient.participants[':id'].$get, PARTICIPANT_QUERY_KEYS.PARTICIPANT),

    /**
     * Create a new bucketParticipant
     */
    create: createMutation(apiClient.participants.$post, PARTICIPANT_QUERY_KEYS.PARTICIPANTS),

    /**
     * Update a bucketParticipant
     */
    update: createMutation(
        apiClient.participants[':id'].$patch,
        PARTICIPANT_QUERY_KEYS.PARTICIPANT
    ),

    /**
     * Delete a bucketParticipant
     */
    delete: createMutation(
        apiClient.participants[':id'].$delete,
        PARTICIPANT_QUERY_KEYS.PARTICIPANTS
    ),
};
