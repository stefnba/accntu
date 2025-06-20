import { apiClient, createMutation, createQuery } from '@/lib/api';

const TRANSACTION_IMPORT_QUERY_KEYS = {
    IMPORTS: 'transaction-imports',
    IMPORT: 'transaction-import',
} as const;

/**
 * Transaction Import Record API endpoints
 */
export const useImportRecordEndpoints = {
    /**
     * Create a new transaction import
     */
    create: createMutation(
        apiClient['transaction-import'].imports.$post,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORTS
    ),

    /**
     * Get all transaction imports for the authenticated user
     */
    list: createQuery(
        apiClient['transaction-import'].imports.$get,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORTS
    ),

    /**
     * Get transaction import by ID
     */
    get: createQuery(
        apiClient['transaction-import'].imports[':id'].$get,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORT
    ),

    /**
     * Update transaction import
     */
    update: createMutation(
        apiClient['transaction-import'].imports[':id'].$put,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORT
    ),

    /**
     * Delete transaction import
     */
    delete: createMutation(
        apiClient['transaction-import'].imports[':id'].$delete,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORTS
    ),
};