import { apiClient, createMutation, createQuery } from '@/lib/api';

const LABEL_QUERY_KEYS = {
    LABELS: 'labels',
    LABEL: 'label',
    ROOT_LABELS: 'root_labels',
    FLATTENED_LABELS: 'flattened_labels',
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
     * Get all labels flattened for the authenticated user
     */
    getAllFlattened: createQuery(
        apiClient.labels.flattened.$get,
        LABEL_QUERY_KEYS.FLATTENED_LABELS
    ),

    /**
     * Get root labels with nested children
     */
    getRoots: createQuery(apiClient.labels.roots.$get, LABEL_QUERY_KEYS.ROOT_LABELS),

    /**
     * Get label by ID
     */
    getById: createQuery(apiClient.labels[':id'].$get, LABEL_QUERY_KEYS.LABEL),

    /**
     * Create a new label
     */
    create: createMutation(apiClient.labels.$post, LABEL_QUERY_KEYS.LABELS),

    /**
     * Update a label
     */
    update: createMutation(apiClient.labels[':id'].$put, [
        LABEL_QUERY_KEYS.LABEL,
        LABEL_QUERY_KEYS.LABELS,
    ]),

    /**
     * Delete a label (soft delete)
     */
    delete: createMutation(apiClient.labels[':id'].$delete, LABEL_QUERY_KEYS.LABEL),

    /**
     * Reorder labels (drag and drop)
     */
    reorder: createMutation(apiClient.labels.reorder.$put, [
        LABEL_QUERY_KEYS.LABELS,
        LABEL_QUERY_KEYS.ROOT_LABELS,
    ]),
};
