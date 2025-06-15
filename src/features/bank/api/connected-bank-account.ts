import { apiClient, createMutation, createQuery } from '@/lib/api';

const CONNECTED_BANK_ACCOUNT_QUERY_KEYS = {
    CONNECTED_BANK_ACCOUNTS: () => ['connected_bank_accounts'] as const,
    CONNECTED_BANK_ACCOUNTS_BY_BANK: (connectedBankId: string) =>
        ['connected_bank_accounts', connectedBankId] as const,
    CONNECTED_BANK_ACCOUNT: (id: string) => ['connected_bank_account', id] as const,
    CONNECTED_BANK_ACCOUNT_CSV_CONFIG: (id: string) =>
        ['connected_bank_account', id, 'csv-config'] as const,
} as const;

/**
 * Connected Bank Account API endpoints with integrated error handling
 */
export const useConnectedBankAccountEndpoints = {
    /**
     * Get connected bank accounts for a user
     * Note: This endpoint doesn't exist in the current API structure
     */
    // getByUserId: () =>
    //     createQuery(
    //         apiClient.banks['connected-bank-accounts'].$get,
    //         CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNTS()
    //     ),

    /**
     * Get connected bank accounts for a specific connected bank
     * TODO: Fix API path - this endpoint may not exist or needs different routing
     */
    // getByConnectedBankId: (connectedBankId: string) =>
    //     createQuery(
    //         apiClient.banks['connected-bank-accounts']['by-bank'][':id'].$get,
    //         CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNTS_BY_BANK(connectedBankId)
    //     ),

    /**
     * Get connected bank account by ID
     */
    getById: (id: string) =>
        createQuery(
            apiClient.banks['connected-bank-accounts'][':id'].$get,
            CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNT(id)
        ),

    /**
     * Create a new connected bank account
     */
    create: () =>
        createMutation(
            apiClient.banks['connected-bank-accounts'].$post,
            CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNTS()
        ),

    /**
     * Update a connected bank account
     */
    update: (id: string) =>
        createMutation(
            apiClient.banks['connected-bank-accounts'][':id'].$put,
            CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNT(id)
        ),
};
