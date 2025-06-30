import { apiClient, createMutation, createQuery } from '@/lib/api';

const CONNECTED_BANK_QUERY_KEYS = {
    CONNECTED_BANKS: 'connected_banks',
    CONNECTED_BANK: 'connected_bank',
} as const;

/**
 * Connected Bank API endpoints with integrated error handling
 */
export const useConnectedBankEndpoints = {
    // === QUERIES ===

    /**
     * Get connected banks for a user
     */
    getAll: createQuery(
        apiClient.banks['connected-banks'].$get,
        CONNECTED_BANK_QUERY_KEYS.CONNECTED_BANKS
    ),

    /**
     * Get connected bank by ID
     */
    getById: createQuery(
        apiClient.banks['connected-banks'][':id'].$get,
        CONNECTED_BANK_QUERY_KEYS.CONNECTED_BANK
    ),

    // === MUTATIONS ===

    /**
     * Create a new connected bank
     */
    create: createMutation(
        apiClient.banks['connected-banks'].$post,
        CONNECTED_BANK_QUERY_KEYS.CONNECTED_BANKS
    ),

    /**
     * Update a connected bank
     */
    update: () => {},

    /**
     * Delete a connected bank
     */
    delete: () => {},
};
