import { apiClient, createMutation, createQuery } from '@/lib/api';

const CONNECTED_BANK_ACCOUNT_QUERY_KEYS = {
    CONNECTED_BANK_ACCOUNTS: 'connected_bank_accounts',
    CONNECTED_BANK_ACCOUNT: 'connected_bank_account',
    CONNECTED_BANK_ACCOUNTS_BY_BANK: 'connected_bank_accounts_by_bank',
} as const;

/**
 * Connected Bank Account API endpoints with integrated error handling
 */
export const useConnectedBankAccountEndpoints = {
    /**
     * Get connected bank accounts for a specific connected bank

     */
    // getByConnectedBankId: createQuery(
    //     apiClient.banks['connected-bank-accounts'][""]
    //     CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNTS_BY_BANK
    // ),

    /**
     * Get connected bank account by ID
     */
    getById: createQuery(
        apiClient.banks['connected-bank-accounts'][':id'].$get,
        CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNT
    ),

    /**
     * Create a new connected bank account
     */
    create: createMutation(
        apiClient.banks['connected-bank-accounts'].$post,
        CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNTS
    ),

    /**
     * Update a connected bank account
     */
    update: createMutation(
        apiClient.banks['connected-bank-accounts'][':id'].$patch,
        CONNECTED_BANK_ACCOUNT_QUERY_KEYS.CONNECTED_BANK_ACCOUNT
    ),
};
