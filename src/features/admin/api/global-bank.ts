import { apiClient, createMutation, createQuery } from '@/lib/api';

const ADMIN_GLOBAL_BANK_QUERY_KEYS = {
    ADMIN_GLOBAL_BANKS: 'admin_global_banks',
    ADMIN_GLOBAL_BANK: 'admin_global_bank',
} as const;

/**
 * Admin Global Bank API endpoints with integrated error handling
 */
export const useAdminGlobalBankEndpoints = {
    /**
     * Get all global banks (admin only)
     */
    getAll: createQuery(apiClient.admin['global-banks'].$get),

    /**
     * Get global bank by ID (admin only)
     */
    getById: createQuery(apiClient.admin['global-banks'][':id'].$get),

    /**
     * Create global bank (admin only)
     */
    create: createMutation(apiClient.admin['global-banks'].$post),

    /**
     * Update global bank (admin only)
     */
    update: createMutation(apiClient.admin['global-banks'][':id'].$put),

    /**
     * Delete global bank (admin only)
     */
    remove: createMutation(apiClient.admin['global-banks'][':id'].$delete),
};
