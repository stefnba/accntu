import { apiClient, createQuery } from '@/lib/api';

const GLOBAL_BANK_ACCOUNT_QUERY_KEYS = {
    GLOBAL_BANK_ACCOUNTS: 'global_bank_accounts',
    GLOBAL_BANK_ACCOUNT: 'global_bank_account',
} as const;

/**
 * Global Bank Account API endpoints with integrated error handling
 */
export const useGlobalBankAccountEndpoints = {
    /**
     * Get global bank accounts for a specific bank
     */
    getByBankId: createQuery(
        apiClient.banks['global-bank-accounts']['by-bank'][':id'].$get,
        GLOBAL_BANK_ACCOUNT_QUERY_KEYS.GLOBAL_BANK_ACCOUNTS
    ),

    /**
     * Get global bank account by ID
     */
    getById: createQuery(
        apiClient.banks['global-bank-accounts'][':id'].$get,
        GLOBAL_BANK_ACCOUNT_QUERY_KEYS.GLOBAL_BANK_ACCOUNT
    ),
};
