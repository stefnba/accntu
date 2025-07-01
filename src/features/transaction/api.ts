import { apiClient, createQuery } from '@/lib/api';

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
    getById: createQuery(
        apiClient.transactions[':transactionId'].$get,
        TRANSACTION_QUERY_KEYS.TRANSACTION
    ),
};
