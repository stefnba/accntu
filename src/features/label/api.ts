import { apiClient, createMutation, createQuery } from '@/lib/api';

export const LABEL_QUERY_KEYS = {
    LABELS: (userId: string) => ['labels', userId] as const,
    LABEL: (id: string) => ['label', id] as const,
    LABEL_HIERARCHY: (userId: string) => ['labels', userId, 'hierarchy'] as const,
    LABEL_ROOT: (userId: string) => ['labels', userId, 'root'] as const,
    LABEL_CHILDREN: (parentId: string) => ['labels', parentId, 'children'] as const,
} as const;

/**
 * Label API endpoints with integrated error handling
 */
export const useLabelEndpoints = {
    /**
     * Get all labels for a user
     */
    getLabels: (userId: string) =>
        createQuery(
            apiClient.labels['labels']['user'][':userId'].$get,
            LABEL_QUERY_KEYS.LABELS(userId)
        ),

    /**
     * Get label by ID
     */
    getLabel: (id: string) =>
        createQuery(apiClient.labels['labels'][':id'].$get, LABEL_QUERY_KEYS.LABEL(id)),

    /**
     * Get label hierarchy for a user
     */
    getLabelHierarchy: (userId: string) =>
        createQuery(
            apiClient.labels['labels']['user'][':userId']['hierarchy'].$get,
            LABEL_QUERY_KEYS.LABEL_HIERARCHY(userId)
        ),

    /**
     * Get root labels for a user
     */
    getRootLabels: (userId: string) =>
        createQuery(
            apiClient.labels['labels']['user'][':userId']['root'].$get,
            LABEL_QUERY_KEYS.LABEL_ROOT(userId)
        ),

    /**
     * Get child labels for a parent label
     */
    getChildLabels: (parentId: string) =>
        createQuery(
            apiClient.labels['labels'][':parentId']['children'].$get,
            LABEL_QUERY_KEYS.LABEL_CHILDREN(parentId)
        ),

    /**
     * Create a new label
     */
    createLabel: (userId: string) =>
        createMutation(apiClient.labels['labels'].$post, LABEL_QUERY_KEYS.LABELS(userId)),

    /**
     * Update a label
     */
    updateLabel: (id: string, userId: string) =>
        createMutation(apiClient.labels['labels'][':id'].$put, LABEL_QUERY_KEYS.LABEL(id)),

    /**
     * Delete a label
     */
    deleteLabel: (id: string, userId: string) =>
        createMutation(apiClient.labels['labels'][':id'].$delete, LABEL_QUERY_KEYS.LABEL(id)),
};
