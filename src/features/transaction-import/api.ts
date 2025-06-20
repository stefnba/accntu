import { apiClient, createMutation, createQuery } from '@/lib/api';

const TRANSACTION_IMPORT_QUERY_KEYS = {
    IMPORTS: 'transaction-imports',
    IMPORT: 'transaction-import',
} as const;

/**
 * Transaction Import API endpoints with integrated error handling
 */
export const useTransactionImportEndpoints = {
    /**
     * Create a new transaction import
     */
    create: createMutation(
        apiClient['transaction-import'].create.$post,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORTS
    ),

    /**
     * Get all transaction imports for the authenticated user
     */
    list: createQuery(
        apiClient['transaction-import'].list.$get,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORTS
    ),

    /**
     * Get transaction import by ID
     */
    get: createQuery(
        apiClient['transaction-import'][':importId'].$get,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORT
    ),

    /**
     * Parse transactions from upload into importable format
     */
    parse: createMutation(
        apiClient['transaction-import'].parse.$post,
        TRANSACTION_IMPORT_QUERY_KEYS.IMPORT
    ),
};
