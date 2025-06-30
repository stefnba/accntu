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
    update: createMutation(apiClient.tags[':id'].$put, TAG_QUERY_KEYS.TAG),

    /**
     * Delete a tag (soft delete)
     */
    delete: createMutation(apiClient.tags[':id'].$delete, TAG_QUERY_KEYS.TAG),
};

/**
 * Transaction Tag API endpoints with integrated error handling
 */
export const useTransactionTagEndpoints = {
    /**
     * Get tags for a transaction with metadata
     */
    getTransactionTags: createQuery(
        apiClient.tags['transactions'][':transactionId']['tags'].$get,
        TAG_QUERY_KEYS.TRANSACTION_TAGS
    ),

    /**
     * Get simple tags for a transaction
     */
    getTransactionTagsSimple: createQuery(
        apiClient.tags['transactions'][':transactionId']['tags']['simple'].$get,
        TAG_QUERY_KEYS.TRANSACTION_TAGS
    ),

    /**
     * Add tag to transaction
     */
    addTagToTransaction: createMutation(
        apiClient.tags['transactions']['tags'].$post,
        TAG_QUERY_KEYS.TRANSACTION_TAGS
    ),

    /**
     * Remove tag from transaction
     */
    removeTagFromTransaction: createMutation(
        apiClient.tags['transactions'][':transactionId']['tags'][':tagId'].$delete,
        TAG_QUERY_KEYS.TRANSACTION_TAGS
    ),
};

/**
 * Tag Utility API endpoints
 */
export const useTagUtilityEndpoints = {
    /**
     * Update tag transaction count
     */
    updateTagTransactionCount: createMutation(
        apiClient.tags[':tagId']['update-count'].$put,
        TAG_QUERY_KEYS.TAG
    ),
};
