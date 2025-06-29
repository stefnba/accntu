import { apiClient, createMutation, createQuery } from '@/lib/api';

const ADMIN_GLOBAL_BANK_ACCOUNT_QUERY_KEYS = {
    ADMIN_GLOBAL_BANK_ACCOUNTS: 'admin_global_bank_accounts',
    ADMIN_GLOBAL_BANK_ACCOUNT: 'admin_global_bank_account',
} as const;

/**
 * Admin Global Bank Account API endpoints with integrated error handling
 */
export const useAdminGlobalBankAccountEndpoints = {
    /**
     * Get global bank accounts for a specific bank (admin only)
     */
    getByBankId: createQuery(apiClient.admin['global-bank-accounts']['by-bank'][':bankId'].$get),

    /**
     * Get global bank account by ID (admin only)
     */
    getById: createQuery(
        apiClient.admin['global-bank-accounts'][':id'].$get,
        ADMIN_GLOBAL_BANK_ACCOUNT_QUERY_KEYS.ADMIN_GLOBAL_BANK_ACCOUNT
    ),

    /**
     * Create global bank account (admin only)
     */
    create: createMutation(apiClient.admin['global-bank-accounts'].$post),

    /**
     * Update global bank account (admin only)
     */
    update: createMutation(apiClient.admin['global-bank-accounts'][':id'].$put),

    /**
     * Delete global bank account (admin only)
     */
    remove: createMutation(apiClient.admin['global-bank-accounts'][':id'].$delete),

    /**
     * Test global bank account transformation query (admin only)
     */
    testTransformQuery: createMutation(
        apiClient.admin['global-bank-accounts']['test-transform-query'].$post
    ),
};
