import { apiClient, createMutation, createQuery } from '@/lib/api';

const TAG_QUERY_KEYS = {
    TAGS: 'tags',
    TAG: 'tag',
    TRANSACTION_TAGS: 'transaction_tags',
} as const;

/**
 * Tag API endpoints with integrated error handling
 */
export const useTagEndpoints = {
    /**
     * Get all tags for the authenticated user
     */
    getAll: createQuery(apiClient.tags.$get, TAG_QUERY_KEYS.TAGS),

    /**
     * Get tag by ID
     */
    getById: createQuery(apiClient.tags[':id'].$get, TAG_QUERY_KEYS.TAG),

    /**
     * Create a new tag
     */
    create: createMutation(apiClient.tags.$post, TAG_QUERY_KEYS.TAGS),

    /**
     * Update a tag
     */
    update: createMutation(apiClient.tags[':id'].$put, [TAG_QUERY_KEYS.TAG, TAG_QUERY_KEYS.TAGS]),

    /**
     * Delete a tag (soft delete)
     */
    delete: createMutation(apiClient.tags[':id'].$delete, TAG_QUERY_KEYS.TAG),
};
