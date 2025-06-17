import { apiClient, createMutation, createQuery } from '@/lib/api';

const LABEL_QUERY_KEYS = {
    LABELS: 'labels',
    LABEL: 'label',
    LABEL_HIERARCHY: 'label_hierarchy',
    LABEL_ROOT: 'label_root',
    LABEL_CHILDREN: 'label_children',
} as const;

/**
 * Label API endpoints with integrated error handling
 */
export const useLabelEndpoints = {
    /**
     * Get all labels for the authenticated user
     */
    getAll: createQuery(apiClient.labels.$get, LABEL_QUERY_KEYS.LABELS),

    /**
     * Get label by ID
     */
    getById: createQuery(apiClient.labels[':id'].$get, LABEL_QUERY_KEYS.LABEL),

    /**
     * Get label hierarchy for the authenticated user
     */
    getHierarchy: createQuery(apiClient.labels['hierarchy'].$get, LABEL_QUERY_KEYS.LABEL_HIERARCHY),

    /**
     * Get root labels for the authenticated user
     */
    getRootLabels: createQuery(apiClient.labels['root'].$get, LABEL_QUERY_KEYS.LABEL_ROOT),

    /**
     * Get child labels for a parent label
     */
    getChildLabels: createQuery(
        apiClient.labels[':parentId']['children'].$get,
        LABEL_QUERY_KEYS.LABEL_CHILDREN
    ),

    /**
     * Create a new label
     */
    create: createMutation(apiClient.labels.$post, LABEL_QUERY_KEYS.LABELS),

    /**
     * Update a label
     */
    update: createMutation(apiClient.labels[':id'].$put, LABEL_QUERY_KEYS.LABEL),

    /**
     * Delete a label (soft delete)
     */
    delete: createMutation(apiClient.labels[':id'].$delete, LABEL_QUERY_KEYS.LABEL),
};
