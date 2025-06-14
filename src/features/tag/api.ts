import { apiClient, createMutation, createQuery } from '@/lib/api';

export const TAG_QUERY_KEYS = {
    TAGS: (userId: string) => ['tags', userId] as const,
    TAG: (id: string) => ['tag', id] as const,
    TAG_HIERARCHY: (userId: string) => ['tags', userId, 'hierarchy'] as const,
    TAG_ROOT: (userId: string) => ['tags', userId, 'root'] as const,
    TAG_CHILDREN: (parentTagId: string) => ['tags', parentTagId, 'children'] as const,
    TAG_AUTO_RULES: (userId: string) => ['tags', userId, 'auto-rules'] as const,

    TRANSACTION_TAGS: (transactionId: string) => ['transactions', transactionId, 'tags'] as const,
    TRANSACTION_TAGS_SIMPLE: (transactionId: string) =>
        ['transactions', transactionId, 'tags', 'simple'] as const,
} as const;

/**
 * Tag API endpoints with integrated error handling
 */
export const useTagEndpoints = {
    /**
     * Get all tags for a user
     */
    getTags: (userId: string) =>
        createQuery(apiClient.tags['tags']['user'][':userId'].$get, TAG_QUERY_KEYS.TAGS(userId)),

    /**
     * Get tag by ID
     */
    getTag: (id: string) => createQuery(apiClient.tags['tags'][':id'].$get, TAG_QUERY_KEYS.TAG(id)),

    /**
     * Get tag hierarchy for a user
     */
    getTagHierarchy: (userId: string) =>
        createQuery(
            apiClient.tags['tags']['user'][':userId']['hierarchy'].$get,
            TAG_QUERY_KEYS.TAG_HIERARCHY(userId)
        ),

    /**
     * Get root tags for a user
     */
    getRootTags: (userId: string) =>
        createQuery(
            apiClient.tags['tags']['user'][':userId']['root'].$get,
            TAG_QUERY_KEYS.TAG_ROOT(userId)
        ),

    /**
     * Get child tags for a parent tag
     */
    getChildTags: (parentTagId: string) =>
        createQuery(
            apiClient.tags['tags'][':parentTagId']['children'].$get,
            TAG_QUERY_KEYS.TAG_CHILDREN(parentTagId)
        ),

    /**
     * Get tags with auto-tagging rules for a user
     */
    getTagsWithAutoRules: (userId: string) =>
        createQuery(
            apiClient.tags['tags']['user'][':userId']['auto-rules'].$get,
            TAG_QUERY_KEYS.TAG_AUTO_RULES(userId)
        ),

    /**
     * Create a new tag
     */
    createTag: (userId: string) =>
        createMutation(apiClient.tags['tags'].$post, TAG_QUERY_KEYS.TAGS(userId)),

    /**
     * Update a tag
     */
    updateTag: (id: string, userId: string) =>
        createMutation(apiClient.tags['tags'][':id'].$put, TAG_QUERY_KEYS.TAG(id)),

    /**
     * Delete a tag
     */
    deleteTag: (id: string, userId: string) =>
        createMutation(apiClient.tags['tags'][':id'].$delete, TAG_QUERY_KEYS.TAG(id)),
};

/**
 * Transaction Tag API endpoints with integrated error handling
 */
export const useTransactionTagEndpoints = {
    /**
     * Get tags for a transaction with metadata
     */
    getTransactionTags: (transactionId: string) =>
        createQuery(
            apiClient.tags['transactions'][':transactionId']['tags'].$get,
            TAG_QUERY_KEYS.TRANSACTION_TAGS(transactionId)
        ),

    /**
     * Get simple tags for a transaction
     */
    getTransactionTagsSimple: (transactionId: string) =>
        createQuery(
            apiClient.tags['transactions'][':transactionId']['tags']['simple'].$get,
            TAG_QUERY_KEYS.TRANSACTION_TAGS_SIMPLE(transactionId)
        ),

    /**
     * Add tag to transaction
     */
    addTagToTransaction: (transactionId: string) =>
        createMutation(
            apiClient.tags['transactions']['tags'].$post,
            TAG_QUERY_KEYS.TRANSACTION_TAGS(transactionId)
        ),

    /**
     * Remove tag from transaction
     */
    removeTagFromTransaction: (transactionId: string, tagId: string) =>
        createMutation(
            apiClient.tags['transactions'][':transactionId']['tags'][':tagId'].$delete,
            TAG_QUERY_KEYS.TRANSACTION_TAGS(transactionId)
        ),
};

/**
 * Tag Utility API endpoints
 */
export const useTagUtilityEndpoints = {
    /**
     * Update tag transaction count
     */
    updateTagTransactionCount: (tagId: string, userId: string) =>
        createMutation(
            apiClient.tags['tags'][':tagId']['update-count'].$put,
            TAG_QUERY_KEYS.TAG(tagId)
        ),
};
