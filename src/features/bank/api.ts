import { apiClient, createMutation, createQuery } from '@/lib/api';

export const GLOBAL_BANK_QUERY_KEYS = {
    GLOBAL_BANKS: (search?: string, country?: string) => ['global_banks', search, country] as const,
    GLOBAL_BANK: (id: string) => ['global_bank', id] as const,
    GLOBAL_BANK_ACCOUNTS: (bankId: string) => ['global_bank_accounts', bankId] as const,
    GLOBAL_BANK_ACCOUNT: (id: string) => ['global_bank_account', id] as const,
    CONNECTED_BANKS: () => ['connected_banks'] as const,
    CONNECTED_BANK: (id: string) => ['connected_bank', id] as const,
    CONNECTED_BANK_ACCOUNTS: () => ['connected_bank_accounts'] as const,
    CONNECTED_BANK_ACCOUNTS_BY_BANK: (connectedBankId: string) =>
        ['connected_bank_accounts', connectedBankId] as const,
    CONNECTED_BANK_ACCOUNT: (id: string) => ['connected_bank_account', id] as const,
    CONNECTED_BANK_ACCOUNT_CSV_CONFIG: (id: string) =>
        ['connected_bank_account', id, 'csv-config'] as const,
} as const;

/**
 * Global Bank API endpoints with integrated error handling
 */
export const useGlobalBankEndpoints = {
    /**
     * Get all global banks
     */
    getGlobalBanks: createQuery(
        apiClient.banks['global-banks'].$get,
        GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANKS()
    ),

    /**
     * Search global banks with optional query and country filter
     */
    searchGlobalBanks: (query?: string, country?: string) =>
        createQuery(
            apiClient.banks['global-banks'].$get,
            GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANKS(query, country)
        ),

    /**
     * Get global banks by country
     */
    getGlobalBanksByCountry: (country: string) =>
        createQuery(
            apiClient.banks['global-banks']['country'][':country'].$get,
            GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANKS(undefined, country)
        ),

    /**
     * Get global bank by ID
     */
    getGlobalBank: (id: string) =>
        createQuery(
            apiClient.banks['global-banks'][':id'].$get,
            GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANK(id)
        ),
};

/**
 * Global Bank Account API endpoints with integrated error handling
 */
export const useGlobalBankAccountEndpoints = {
    /**
     * Get global bank accounts for a specific bank
     */
    getGlobalBankAccounts: (bankId: string) =>
        createQuery(
            apiClient.banks['global-banks'][':bankId']['accounts'].$get,
            GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANK_ACCOUNTS(bankId)
        ),

    /**
     * Get global bank account by ID
     */
    getGlobalBankAccount: (id: string) =>
        createQuery(
            apiClient.banks['global-bank-accounts'][':id'].$get,
            GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANK_ACCOUNT(id)
        ),
};

/**
 * Connected Bank API endpoints with integrated error handling
 */
export const useConnectedBankEndpoints = {
    /**
     * Get connected banks for a user
     */
    getConnectedBanks: () =>
        createQuery(
            apiClient.banks['connected-banks']['user'][':userId'].$get,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANKS()
        ),

    /**
     * Get connected bank by ID
     */
    getConnectedBank: (id: string) =>
        createQuery(
            apiClient.banks['connected-banks'][':id'].$get,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANK(id)
        ),

    /**
     * Create a new connected bank
     */
    createConnectedBank: () =>
        createMutation(
            apiClient.banks['connected-banks'].$post,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANKS()
        ),
};

/**
 * Connected Bank Account API endpoints with integrated error handling
 */
export const useConnectedBankAccountEndpoints = {
    /**
     * Get connected bank accounts for a user
     */
    getConnectedBankAccounts: () =>
        createQuery(
            apiClient.banks['connected-bank-accounts']['user'][':userId'].$get,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANK_ACCOUNTS()
        ),

    /**
     * Get connected bank accounts for a specific connected bank
     */
    getConnectedBankAccountsByBank: (connectedBankId: string) =>
        createQuery(
            apiClient.banks['connected-bank-accounts']['bank'][':connectedBankId'].$get,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANK_ACCOUNTS_BY_BANK(connectedBankId)
        ),

    /**
     * Get connected bank account by ID
     */
    getConnectedBankAccount: (id: string) =>
        createQuery(
            apiClient.banks['connected-bank-accounts'][':id'].$get,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANK_ACCOUNT(id)
        ),

    /**
     * Get connected bank account with CSV configuration
     */
    getConnectedBankAccountWithCsvConfig: (id: string) =>
        createQuery(
            apiClient.banks['connected-bank-accounts'][':id']['csv-config'].$get,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANK_ACCOUNT_CSV_CONFIG(id)
        ),

    /**
     * Create a new connected bank account
     */
    createConnectedBankAccount: (userId: string) =>
        createMutation(
            apiClient.banks['connected-bank-accounts'].$post,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANK_ACCOUNTS()
        ),

    /**
     * Update a connected bank account
     */
    updateConnectedBankAccount: (id: string) =>
        createMutation(
            apiClient.banks['connected-bank-accounts'][':id'].$put,
            GLOBAL_BANK_QUERY_KEYS.CONNECTED_BANK_ACCOUNT(id)
        ),
};
