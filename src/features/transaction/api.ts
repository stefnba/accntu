import { apiClient, createMutation, createQuery } from '@/lib/api';

const TRANSACTION_QUERY_KEYS = {
    TRANSACTIONS: 'transactions',
    TRANSACTION: 'transaction',
    FILTER_OPTIONS: 'transaction_filter_options',
} as const;

/**
 * Transaction API endpoints with integrated error handling
 */
export const useTransactionEndpoints = {
    /**
     * Get paginated transactions with filters
     */
    getAll: createQuery(apiClient.transactions.$get, TRANSACTION_QUERY_KEYS.TRANSACTIONS),

    /**
     * Get transaction filter options
     */
    getFilterOptions: createQuery(
        apiClient.transactions['filter-options'].$get,
        TRANSACTION_QUERY_KEYS.FILTER_OPTIONS
    ),

    /**
     * Get transaction by ID
     */
    getById: createQuery(apiClient.transactions[':id'].$get, TRANSACTION_QUERY_KEYS.TRANSACTION),

    /**
     * Update transaction
     */
    update: createMutation(
        apiClient.transactions[':id'].$patch,
        TRANSACTION_QUERY_KEYS.TRANSACTIONS
    ),

    /**
     * Import transactions
     */
    import: createMutation(
        apiClient.transactions.import.$post,
        TRANSACTION_QUERY_KEYS.TRANSACTIONS
    ),
};
